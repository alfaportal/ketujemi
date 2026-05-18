const { chromium } = require("playwright");
const { mkdir } = require("node:fs/promises");
const path = require("node:path");

const OUT_DIR = path.resolve(__dirname, "..", "homepage-screenshots");
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

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = Math.max(1, Math.ceil(scrollHeight / (height * 0.85)));

    for (let i = 0; i < steps; i++) {
      const y = Math.min(
        Math.round(i * height * 0.85),
        Math.max(0, scrollHeight - height),
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
    console.log(`Saved ${name}: ${steps} scroll sections`);
  }

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
