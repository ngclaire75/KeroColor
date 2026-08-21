import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', err => console.log('[pageerror]', err.message));
page.on('console', msg => { if (msg.type() === 'error') console.log('[console error]', msg.text()); });

await page.goto('https://kerocolor.vercel.app/inspiration', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2800);

await page.click('.in-hero-play-btn');
await page.waitForTimeout(1500);

const state = await page.evaluate(() => {
  const v = document.querySelector('video[src*="blush.mp4"]');
  return v ? {
    paused: v.paused, currentTime: v.currentTime, readyState: v.readyState,
    error: v.error ? { code: v.error.code, message: v.error.message } : null,
    networkState: v.networkState, src: v.src, ended: v.ended,
  } : { found: false };
});
console.log('Hero state 1.5s after click:', JSON.stringify(state, null, 2));

await browser.close();
