import { chromium } from 'playwright'
const out = process.argv[2]
const b = await chromium.launch()
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp })
  await p.goto('http://localhost:4179/editorial', { waitUntil: 'networkidle' })
  await p.waitForTimeout(3000)
  await p.addStyleTag({ content: '.ed-more,.ed-more *{opacity:1!important;transform:none!important}' })
  await p.waitForTimeout(300)
  console.log(vp.width, await p.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect()
    return [Math.round(r('.ed-intro > .ed-intro-heading').top - r('.ed-masthead').bottom), Math.round(r('.ed-more > .ed-intro-heading').top - r('.ed-intro-footer').bottom), document.documentElement.scrollWidth]
  }))
  await p.screenshot({ path: `${out}/rv-${vp.width}.png` })
}
await b.close()
