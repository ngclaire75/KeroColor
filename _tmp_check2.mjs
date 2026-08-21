import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', err => console.log('[pageerror]', err.message));
page.on('console', msg => { if (msg.type() === 'error') console.log('[console error]', msg.text()); });

const t0 = Date.now();
page.on('request', req => { if (req.url().includes('blush.mp4')) console.log(`t+${Date.now()-t0}ms REQUEST`); });
page.on('response', res => { if (res.url().includes('blush.mp4')) console.log(`t+${Date.now()-t0}ms RESPONSE ${res.status()}`); });
page.on('requestfailed', req => { if (req.url().includes('blush.mp4')) console.log(`t+${Date.now()-t0}ms FAILED: ${req.failure()?.errorText}`); });

await page.goto('https://kerocolor.vercel.app/inspiration', { waitUntil: 'domcontentloaded' });

for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(1000);
  const s = await page.evaluate(() => {
    const v = document.querySelector('video[src*="blush.mp4"]');
    return v ? { readyState: v.readyState, buffered: v.buffered.length ? v.buffered.end(0) : 0, networkState: v.networkState, error: v.error ? v.error.code : null, duration: v.duration } : { found: false };
  });
  console.log(`t+${(i+1)*1000}ms state:`, JSON.stringify(s));
}

await browser.close();
