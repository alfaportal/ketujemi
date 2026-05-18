import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("homepage-screenshots");
const URL = "http://localhost:5173/";

async function capture() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const { name, width, height } of [
    { name: "mobile", width: 390, height: 844 },
    { name: "desktop", width: 1280, height: 800 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(1500);

    const fullPath = path.join(OUT_DIR, `homepage-${name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = height;
    const steps = Math.max(1, Math.ceil(scrollHeight / (viewportHeight * 0.85)));

    for (let i = 0; i < steps; i++) {
      const y = Math.min(
        Math.round(i * viewportHeight * 0.85),
        Math.max(0, scrollHeight - viewportHeight),
      );
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(400);
      const partPath = path.join(
        OUT_DIR,
        `homepage-${name}-section-${String(i + 1).padStart(2, "0")}.png`,
      );
      await page.screenshot({ path: partPath });
    }

    await page.close();
    console.log(`Saved ${name}: full + ${steps} sections → ${OUT_DIR}`);
  }

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
