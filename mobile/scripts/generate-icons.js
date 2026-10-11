/**
 * One-off icon export: rasterizes assets/icon/*.svg into the PNG sizes
 * app.json references. Re-run after editing the source SVGs.
 */
const path = require('path');
const sharp = require('sharp');

const ICON_DIR = path.join(__dirname, '..', 'assets', 'icon');
const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');

const jobs = [
  // Flat full-bleed icon (gradient background + mark) — legacy iOS/web icon, favicon, splash.
  { src: 'icon-flat.svg', out: path.join(IMAGES_DIR, 'icon.png'), size: 1024 },
  { src: 'icon-flat.svg', out: path.join(IMAGES_DIR, 'favicon.png'), size: 48 },
  // Splash: glyph only, transparent — composited over the splash backgroundColor in app.json.
  { src: 'mark.svg', out: path.join(IMAGES_DIR, 'splash-icon.png'), size: 512 },
  // Android adaptive icon layers.
  { src: 'background.svg', out: path.join(IMAGES_DIR, 'android-icon-background.png'), size: 1024 },
  { src: 'mark-adaptive.svg', out: path.join(IMAGES_DIR, 'android-icon-foreground.png'), size: 1024 },
  { src: 'mark-mono-adaptive.svg', out: path.join(IMAGES_DIR, 'android-icon-monochrome.png'), size: 1024 },
];

async function run() {
  for (const job of jobs) {
    const src = path.join(ICON_DIR, job.src);
    await sharp(src, { density: 384 }).resize(job.size, job.size).png().toFile(job.out);
    console.log(`wrote ${path.relative(process.cwd(), job.out)} (${job.size}x${job.size})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
