"use server";

import { headers } from "next/headers";

type Result = { ok: true; image: string } | { ok: false; error: string };

// Açar yalnız serverdə (.env.local / Vercel env) saxlanır, brauzerə heç vaxt getmir
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-image";

// Sadə sui-istifadə qoruması: IP başına 10 dəqiqədə 6 sorğu
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (list.length >= 6) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function aiPresent(input: { mockupDataUrl: string; prompt: string; productName: string }): Promise<Result> {
  // OPENAI_API_KEY varsa OpenAI, yoxsa GEMINI_API_KEY istifadə olunur
  const openaiKey = process.env.OPENAI_API_KEY;
  const key = process.env.GEMINI_API_KEY;
  if (!openaiKey && !key) return { ok: false, error: "AI təqdimat hələ qoşulmayıb" };

  const prompt = input.prompt?.trim();
  if (!prompt || prompt.length < 3) return { ok: false, error: "İstəyinizi yazın" };
  if (prompt.length > 500) return { ok: false, error: "İstək 500 simvoldan uzun olmasın" };

  const m = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(input.mockupDataUrl ?? "");
  if (!m) return { ok: false, error: "Əvvəlcə loqonu məhsula yerləşdirin" };
  if (m[2].length > 6_000_000) return { ok: false, error: "Şəkil çox böyükdür" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return { ok: false, error: "Çox sorğu göndərdiniz, bir az sonra yenidən cəhd edin" };

  const text =
    `This is a product mockup ("${String(input.productName).slice(0, 80)}") with the customer's logo already placed on it. ` +
    `Create ONE photorealistic, professional marketing presentation image of this exact product. ` +
    `Keep the product shape and the logo exactly as shown: do not redraw, translate or alter the logo or any text on it. ` +
    `Customer's request for the scene and style: ${prompt}`;

  if (openaiKey) {
    try {
      const form = new FormData();
      form.set("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
      form.set("prompt", text);
      form.set("size", "1024x1024");
      form.set("quality", process.env.OPENAI_IMAGE_QUALITY || "medium");
      const mime = m[1];
      form.set("image", new Blob([Buffer.from(m[2], "base64")], { type: mime }), `mockup.${mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"}`);
      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}` },
        body: form,
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) {
        console.error("[ai] OpenAI", res.status, (await res.text()).slice(0, 300));
        return {
          ok: false,
          error:
            res.status === 429
              ? "AI limiti dolub, bir az sonra yenidən cəhd edin"
              : res.status === 400
                ? "İstək AI tərəfindən qəbul olunmadı, sözləri dəyişib yenidən cəhd edin"
                : "AI təqdimat alınmadı",
        };
      }
      const json = await res.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (b64) return { ok: true, image: `data:image/png;base64,${b64}` };
      return { ok: false, error: "AI şəkil qaytarmadı, yenidən cəhd edin" };
    } catch (e) {
      console.error("[ai]", e);
      return { ok: false, error: "AI təqdimat alınmadı, yenidən cəhd edin" };
    }
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key! },
      body: JSON.stringify({
        contents: [{ parts: [{ text }, { inline_data: { mime_type: m[1], data: m[2] } }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.error("[ai] Gemini", res.status, (await res.text()).slice(0, 300));
      return { ok: false, error: res.status === 429 ? "AI limiti dolub, bir az sonra yenidən cəhd edin" : res.status === 503 ? "AI hazırda məşğuldur, bir az sonra yenidən cəhd edin" : "AI təqdimat alınmadı" };
    }
    const json = await res.json();
    const parts: { inlineData?: { mimeType?: string; data?: string }; inline_data?: { mime_type?: string; data?: string } }[] =
      json?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      const d = p.inlineData?.data ?? p.inline_data?.data;
      if (d) return { ok: true, image: `data:${p.inlineData?.mimeType ?? p.inline_data?.mime_type ?? "image/png"};base64,${d}` };
    }
    return { ok: false, error: "AI şəkil qaytarmadı, istəyi dəyişib yenidən cəhd edin" };
  } catch (e) {
    console.error("[ai]", e);
    return { ok: false, error: "AI təqdimat alınmadı, yenidən cəhd edin" };
  }
}
