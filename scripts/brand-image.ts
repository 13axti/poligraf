import sharp from "sharp";

/**
 * Sağ aşağı küncdəki moongroup nişanının üstünü örtür: küncə yapışan (şəklin kənarına qədər) bulanıq-ağ "tab" və üstündə "Lemur Group".
 * Nişanın yeri şəkildən şəklə bir az dəyişir, ona görə örtük geniş götürülür və kənara qədər uzanır (qalıq görünməsin).
 */
export async function brandImage(input: Buffer): Promise<{ data: Buffer; type: string }> {
  const img = sharp(input);
  const { width: W = 0, height: H = 0, format } = await img.metadata();
  const left = Math.round(W * 0.68), top = Math.round(H * 0.815);
  const w = W - left, h = H - top;
  const r = Math.round(h * 0.42);
  const shape = `M0 ${r} A${r} ${r} 0 0 1 ${r} 0 H${w} V${h} H0 Z`;
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><path d="${shape}" fill="#fff"/></svg>`);
  const fs = Math.round(H * 0.05);
  const cx = Math.round(W * 0.843 - left), cy = Math.round(H * 0.911 - top);
  const font = `font-family="Helvetica Neue, Arial, sans-serif" text-anchor="middle"`;
  const badge = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="${shape}" fill="#fff" fill-opacity="0.93"/>
      <text x="${cx}" y="${Math.round(cy - fs * 0.05)}" ${font} font-weight="800" font-size="${fs}" fill="#ff5a1f">Lemur</text>
      <text x="${cx}" y="${Math.round(cy + fs * 0.78)}" ${font} font-weight="600" font-size="${Math.round(fs * 0.72)}" fill="#1b1d1f" letter-spacing="${Math.round(fs * 0.12)}">GROUP</text>
    </svg>`
  );
  const blurred = await sharp(input).extract({ left, top, width: w, height: h }).blur(30).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const out = sharp(input).composite([{ input: blurred, left, top }, { input: badge, left, top }]);
  if (format === "png") return { data: await out.png().toBuffer(), type: "image/png" };
  if (format === "webp") return { data: await out.webp({ quality: 92 }).toBuffer(), type: "image/webp" };
  return { data: await out.jpeg({ quality: 92 }).toBuffer(), type: "image/jpeg" };
}
