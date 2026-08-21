import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('https://kerocolor.vercel.app/inspiration', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2800);

const tClick = Date.now();
await page.click('.in-hero-play-btn');
let msToFrame = null;
for (let i = 0; i < 300; i++) { // up to 15s
  await page.waitForTimeout(50);
  const hidden = await page.evaluate(() => document.querySelector('.in-hero-poster-overlay')?.classList.contains('in-hero-poster-overlay--hidden'));
  if (hidden) { msToFrame = Date.now() - tClick; break; }
}
console.log('Time click -> visible frame:', msToFrame, 'ms');
