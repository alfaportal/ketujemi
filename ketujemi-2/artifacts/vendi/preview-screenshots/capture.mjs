const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const url = 'http://localhost:5173/';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = 844;
  const steps = Math.max(1, Math.ceil(scrollHeight / (vh * 0.85)));
  for (let i = 0; i <= steps; i++) {
    const y = Math.min(i * Math.floor(vh * 0.85), scrollHeight);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(400);
    const n = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: `${out}/home-${n}.png` });
  }
  await browser.close();
  console.log('done', steps + 1, 'shots', scrollHeight);
})();
