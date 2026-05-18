const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const out = path.resolve(__dirname);
  const url = "http://localhost:5173/";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = 844;
  const step = Math.floor(vh * 0.8);
  const steps = Math.max(0, Math.ceil((scrollHeight - vh) / step));
  for (let i = 0; i <= steps; i++) {
    const y = Math.min(i * step, Math.max(0, scrollHeight - vh));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(500);
    const n = String(i + 1).padStart(2, "0");
    await page.screenshot({ path: path.join(out, `home-${n}.png`) });
  }
  await browser.close();
  console.log("done", steps + 1, "shots", scrollHeight);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
