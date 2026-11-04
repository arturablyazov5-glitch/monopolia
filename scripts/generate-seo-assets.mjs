// Генерация SEO-ресурсов из существующих фотографий и знака шапки.
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("public/seo", { recursive: true });
await copyFile("public/assets/logo-monopoly-mark-header.svg", "public/favicon.svg");
for (const [size, name] of [
  [32, "favicon-32.png"],
  [180, "apple-touch-icon.png"],
]) {
  await sharp("public/assets/logo-monopoly-mark-header.svg", { density: 540 })
    .resize(size, size)
    .png()
    .toFile(`public/${name}`);
}
const portraits = [];
for (const [photo, left] of [
  ["hero-team-left-inner-portrait", 255],
  ["hero-team-right-center-portrait", 655],
  ["hero-team-center-portrait", 450],
]) {
  const input = await sharp(`design-reference/original-assets/${photo}.png`)
    .resize(330, 570, { fit: "inside" })
    .png()
    .toBuffer();
  const { height } = await sharp(input).metadata();
  portraits.push({ input, left, top: 630 - height });
}
await sharp("public/assets/inner-hero-background.webp")
  .resize(1200, 630, { fit: "cover" })
  .composite(portraits)
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile("public/seo/team-1200x630.jpg");
