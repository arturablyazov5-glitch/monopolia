// Генерация SEO-ресурсов из первого экрана главной и знака шапки.
// node scripts/generate-seo-assets.mjs /path/to/home-hero-screenshot.png
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";

const heroScreenshot = process.argv[2];
if (!heroScreenshot) throw new Error("Pass a 40:21 screenshot of the desktop home hero.");

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
// Keep the social image aligned with the actual website, including its fonts.
await sharp(heroScreenshot)
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile("public/seo/monopolia-social-v2.jpg");
