import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
await page.goto('https://kerocolor.vercel.app/inspiration', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2800);

const gaps = await page.evaluate(() => {
  const nav = document.querySelector('.in-nav');
  const studio = document.querySelector('.in-studio');
  const intro = document.querySelector('.in-intro');
  const squares = document.querySelector('.in-squares');
  const hero = document.querySelector('.in-hero:not(.in-studio-hero)');
  const rect = (el) => el.getBoundingClientRect();
  return {
    gap_nav_to_studio: rect(studio).top - rect(nav).bottom,
    gap_studio_to_intro: rect(intro).top - rect(studio).bottom,
    gap_intro_to_squares: rect(squares).top - rect(intro).bottom,
    gap_squares_to_hero: rect(hero).top - rect(squares).bottom,
  };
});
console.log(JSON.stringify(gaps, null, 2));
await browser.close();
