import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('https://kerocolor.vercel.app/inspiration', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2800); // let the page's own reveal overlay finish

// Confirm buffer state right when the button becomes usable
const preClick = await page.evaluate(() => {
  const v = document.querySelector('video[src*="blush.mp4"]');
  return v ? { readyState: v.readyState, buffered: v.buffered.length ? v.buffered.end(0) : 0, duration: v.duration } : null;
});
console.log('Pre-click state:', JSON.stringify(preClick));

const tClick = Date.now();
await page.click('.in-hero-play-btn');
let msToFrame = null;
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(20);
  const hidden = await page.evaluate(() => document.querySelector('.in-hero-poster-overlay')?.classList.contains('in-hero-poster-overlay--hidden'));
  if (hidden) { msToFrame = Date.now() - tClick; break; }
}
console.log('Time click -> visible frame:', msToFrame, 'ms');

await browser.close();
