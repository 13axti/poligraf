"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getProductBySlug } from "@/lib/data";
import { calculatePrice } from "@/lib/pricing";
import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";

export type OrderResult = { ok: true; id: string } | { ok: false; error: string };

export interface OrderPayload {
  productSlug: string;
  variantId?: string;
  quantity?: number;
  widthCm?: number;
  heightCm?: number;
  customerName: string;
  customerPhone: string;
  note?: string;
  mockupDataUrl?: string;
  logoDataUrls?: string[]; // ən çox 2 loqo
  aiDataUrl?: string; // AI təqdimat şəkli
}

const MAX_FILE = 6 * 1024 * 1024;

function parseDataUrl(dataUrl: string | undefined) {
  if (!dataUrl) return null;
  const m = /^data:(image\/(png|jpeg|svg\+xml|webp|gif));base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const buf = Buffer.from(m[3], "base64");
  if (buf.length > MAX_FILE) return null;
  const ext = m[2] === "jpeg" ? "jpg" : m[2] === "svg+xml" ? "svg" : m[2];
  return { mime: m[1], ext, buf };
}

export async function submitOrder(input: OrderPayload): Promise<OrderResult> {
  const name = input.customerName?.trim();
  const phone = input.customerPhone?.trim();
  if (!name || name.length > 100) return { ok: false, error: "Adınızı yazın" };
  if (!/^[+\d\s()-]{7,20}$/.test(phone ?? "")) {
    return { ok: false, error: "Telefon nömrəsi düzgün deyil" };
  }

  const product = await getProductBySlug(input.productSlug);
  if (!product) return { ok: false, error: "Məhsul tapılmadı" };

  // Qiyməti həmişə serverdə yenidən hesabla — müştərinin göndərdiyinə güvənmə
  const variant = product.variants?.find((v) => v.id === input.variantId);
  const price = calculatePrice(product, {
    quantity: input.quantity,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
    variantModifier: variant?.priceModifier ?? 0,
  });
  if (price.total <= 0) return { ok: false, error: price.breakdown };

  const mockup = parseDataUrl(input.mockupDataUrl);
  const logos = (input.logoDataUrls ?? []).slice(0, 2).map(parseDataUrl).filter((x): x is NonNullable<ReturnType<typeof parseDataUrl>> => !!x);
  const ai = parseDataUrl(input.aiDataUrl);
  const note = input.note?.trim().slice(0, 1000) ?? "";
  const id = randomUUID();

  // ---------- Supabase ----------
  if (supabaseConfigured) {
    const sb = createPublicClient();
    let mockupPath: string | null = null;
    let logoPath: string | null = null; // birinci loqo; ikincisi eyni qovluqda logo-2.* kimi saxlanır

    const uploads = [
      ...(mockup ? [{ file: mockup, name: "mockup" }] : []),
      ...logos.map((file, i) => ({ file, name: `logo-${i + 1}` })),
      ...(ai ? [{ file: ai, name: "ai" }] : []),
    ];
    for (const { file, name: fname } of uploads) {
      const p = `${id}/${fname}.${file.ext}`;
      const { error } = await sb.storage.from("orders").upload(p, file.buf, { contentType: file.mime });
      if (error) return { ok: false, error: "Şəkil yüklənmədi, yenidən cəhd edin" };
      if (fname === "mockup") mockupPath = p;
      else if (fname === "logo-1") logoPath = p;
    }

    const { error } = await sb.from("orders").insert({
      id,
      // mock məhsulun id-si uuid deyil; belə halda null yazılır
      product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id) ? product.id : null,
      product_slug: product.slug,
      product_name: product.name,
      variant_name: variant?.name ?? null,
      pricing_model: product.pricingModel,
      quantity: input.quantity ?? null,
      width_cm: input.widthCm ?? null,
      height_cm: input.heightCm ?? null,
      computed_price: price.total,
      customer_name: name,
      customer_phone: phone,
      note,
      mockup_path: mockupPath,
      logo_path: logoPath,
    });
    if (error) return { ok: false, error: "Sifariş göndərilmədi, yenidən cəhd edin" };
    return { ok: true, id };
  }

  // ---------- Lokal ehtiyat (Supabase qoşulmayıb): data/orders/<id>/ ----------
  const dir = path.join(process.cwd(), "data", "orders", id);
  await mkdir(dir, { recursive: true });
  if (mockup) await writeFile(path.join(dir, `mockup.${mockup.ext}`), mockup.buf);
  for (const [i, lg] of logos.entries()) await writeFile(path.join(dir, `logo-${i + 1}.${lg.ext}`), lg.buf);
  await writeFile(
    path.join(dir, "order.json"),
    JSON.stringify(
      { id, product: product.name, variant: variant?.name, price: price.total, name, phone, note, input: { ...input, mockupDataUrl: undefined, logoDataUrls: undefined } },
      null,
      2
    )
  );
  return { ok: true, id };
}
