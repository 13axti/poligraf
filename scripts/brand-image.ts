import sharp from "sharp";

/** Sağ aşağıdakı moongroup nişanının üstünü bulanıqlaşdırıb üzərinə "Lemur Group" nişanı qoyur (nisbi koordinatlarla). */
export async function brandImage(input: Buffer): Promise<{ data: Buffer; type: string }> {
  const img = sharp(input);
  const { width: W = 0, height: H = 0, format } = await img.metadata();
  const left = Math.round(W * 0.712), top = Math.round(H * 0.836);
  const w = Math.round(W * 0.262), h = Math.round(H * 0.15);
  const r = Math.round(h / 2);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);
  const fs = Math.round(h * 0.34);
  const badge = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" rx="${r}" fill="#fff" fill-opacity="0.86"/>
      <text x="50%" y="${Math.round(h * 0.47)}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="${fs}" fill="#ff5a1f">Lemur</text>
      <text x="50%" y="${Math.round(h * 0.78)}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="600" font-size="${Math.round(fs * 0.72)}" fill="#1b1d1f" letter-spacing="${Math.round(fs * 0.12)}">GROUP</text>
    </svg>`
  );
  const blurred = await sharp(input).extract({ left, top, width: w, height: h }).blur(30).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const out = sharp(input).composite([{ input: blurred, left, top }, { input: badge, left, top }]);
  if (format === "png") return { data: await out.png().toBuffer(), type: "image/png" };
  if (format === "webp") return { data: await out.webp({ quality: 92 }).toBuffer(), type: "image/webp" };
  return { data: await out.jpeg({ quality: 92 }).toBuffer(), type: "image/jpeg" };
}
