import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLenis } from '../lenis'
import explore1 from '../../images/explore1.webp'
import explorepink2 from '../../images/explorepink2.webp'
import exploreblue1 from '../../images/exploreblue1.webp'
import mod1 from '../../images/mod1.webp'
import './ExploreMore.css'

// Everything below the Explore page's card grid, themed by whichever
// color family is active (red by default, or pink/blue/green from a
// search) — the same families the hero and gallery above already switch
// between. The focus is wearing and styling the color (proportions and
// fabric), which no other page covers.
const FAMILIES = {
  red: {
    name: 'Red',
    accent: '#74070d',
    img: explore1,
    shades: { dark: '#4a0a0e', main: '#941e1a', mid: '#aa7877', light: '#e3d1cf' },
    neutrals: [['Cream', '#efe6da'], ['Camel', '#c19a6b'], ['Black', '#1c1a1a'], ['Denim', '#4a6583']],
  },
  pink: {
    name: 'Pink',
    accent: '#c97a9b',
    img: explorepink2,
    shades: { dark: '#8e4a66', main: '#c97a9b', mid: '#e5a9c2', light: '#f8d8e7' },
    neutrals: [['White', '#fbf8f6'], ['Dove Grey', '#a8a4a6'], ['Navy', '#1f2a44'], ['Taupe', '#8b7d72']],
  },
  blue: {
    name: 'Blue',
    accent: '#15294d',
    img: exploreblue1,
    shades: { dark: '#15294d', main: '#445471', mid: '#8a94a6', light: '#d3d9e4' },
    neutrals: [['White', '#fbfaf7'], ['Camel', '#c19a6b'], ['Charcoal', '#3a3a3c'], ['Stone', '#b8b0a2']],
  },
  green: {
    name: 'Green',
    accent: '#35443d',
    img: mod1,
    shades: { dark: '#25302b', main: '#495750', mid: '#868f8b', light: '#d2d8d3' },
    neutrals: [['Cream', '#f1ece2'], ['Tan', '#b89b72'], ['Chocolate', '#4b3226'], ['Black', '#1c1c1a']],
  },
}

const FAMILY_ORDER = ['red', 'pink', 'blue', 'green']

// Dark or light label text, whichever reads better on a given block.
const inkFor = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)
  return lum > 150 ? '#2a1a1e' : '#fff'
}


// ── Color math for the lighting and contrast sections ──
const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbToHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
// Linear mix toward a light source's tint, then scaled by its brightness.
const underLight = (hex, tint, amount, brightness) => {
  const c = hexToRgb(hex), t = hexToRgb(tint)
  return rgbToHex(c.map((v, i) => (v * (1 - amount) + t[i] * amount) * brightness))
}
// WCAG 2.1 relative luminance / contrast ratio.
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const LIGHTS = [
  { name: 'Daylight', kelvin: '5500K', note: 'The color as it truly is. Check shades by a window before you buy.', tint: '#ffffff', amount: 0, brightness: 1, glow: 'rgba(255,255,255,0.35)' },
  { name: 'Office LED', kelvin: '6500K', note: 'Cool and flat. Warm shades lose a little life, cool ones sharpen.', tint: '#dbe6ff', amount: 0.16, brightness: 0.98, glow: 'rgba(214,228,255,0.4)' },
  { name: 'Golden Hour', kelvin: '3000K', note: 'Warm and flattering. Everything picks up a honeyed glow.', tint: '#ffb35c', amount: 0.24, brightness: 1.02, glow: 'rgba(255,190,110,0.45)' },
  { name: 'Candlelight', kelvin: '1900K', note: 'Low and amber. Colors deepen, so go a shade brighter for evenings.', tint: '#ff8a2a', amount: 0.28, brightness: 0.62, glow: 'rgba(255,150,60,0.4)' },
]
const TEXT_DARK = '#1c1a1a'

// Proportions follow the 60-30-10 rule; each block is drawn to scale.
const waysFor = (f) => [
  {
    title: 'Monochrome',
    copy: `Head to toe in ${f.name.toLowerCase()}, varied only by depth. Reads polished and deliberate, never flat.`,
    blocks: [[60, f.shades.main], [30, f.shades.dark], [10, f.shades.light]],
  },
  {
    title: 'As an Accent',
    copy: `One piece in ${f.name.toLowerCase()} against a quiet base. The easiest way to start wearing it.`,
    blocks: [[60, f.neutrals[0][1]], [30, f.neutrals[2][1]], [10, f.shades.main]],
  },
  {
    title: 'Tonal',
    copy: `${f.name} stepped from its lightest tint to its core shade, for a gradient that feels soft but intentional.`,
    blocks: [[50, f.shades.light], [35, f.shades.mid], [15, f.shades.main]],
  },
]

// The same core shade rendered as four finishes, with CSS lighting only.
const finishesFor = (c) => [
  { name: 'Matte', copy: 'True color, no light play. Reads darkest and most grounded.', bg: c },
  {
    name: 'Satin',
    copy: 'A soft sheen along the folds lifts the color a shade lighter.',
    bg: `linear-gradient(115deg, rgba(0,0,0,0.18) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.32) 48%, rgba(255,255,255,0) 64%, rgba(0,0,0,0.15) 100%), ${c}`,
  },
  {
    name: 'Velvet',
    copy: 'Pile absorbs light at the edges, so the color looks deeper and richer.',
    bg: `radial-gradient(ellipse at 45% 40%, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%), ${c}`,
  },
  {
    name: 'Metallic',
    copy: 'Reflective foil turns it high shine, best kept to a single piece.',
    bg: `repeating-linear-gradient(100deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.22) 6px, rgba(255,255,255,0) 14px), linear-gradient(130deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.25) 55%, rgba(255,255,255,0.3) 100%), ${c}`,
  },
]

export default function ExploreMore({ searchResult, onFamilyChange }) {
  const key = FAMILIES[searchResult?.colorFamily] ? searchResult.colorFamily : 'red'
  const f = FAMILIES[key]
  const rootRef = useRef(null)
  const navigate = useNavigate()
  const scale = [['Dark', f.shades.dark], ['Core', f.shades.main], ['Mid', f.shades.mid], ['Light', f.shades.light]]

  // Same eased fade-up as the Inspiration and Editorial pages' sections.
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.xm-reveal') ?? []
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('xm-reveal--visible')
        observer.unobserve(entry.target)
      }),
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const switchFamily = (next) => {
    if (next === key) return
    onFamilyChange(next)
    getLenis()?.scrollTo(0, { duration: 1.4 })
  }

  return (
    <div className="xm" ref={rootRef} style={{ '--xm-accent': f.accent }}>
      {/* ── Wear it three ways ── */}
      <section className="xm-section xm-reveal">
        <div className="xm-head">
          <span className="xm-kicker">Styling</span>
          <h2 className="xm-title">Wear {f.name} Three Ways</h2>
          <p className="xm-lede">Every look follows the 60 30 10 rule: a main color, a supporting one, and a small accent. Each block below is drawn to scale.</p>
        </div>
        <div className="xm-ways">
          {waysFor(f).map((way) => (
            <article className="xm-way" key={way.title}>
              <div className="xm-way-stack">
                {way.blocks.map(([pct, hex], i) => (
                  <div className="xm-way-block" key={i} style={{ flex: pct, background: hex, color: inkFor(hex) }}>
                    <span className="xm-way-pct">{pct}%</span>
                    <span className="xm-way-hex">{hex}</span>
                  </div>
                ))}
              </div>
              <h3 className="xm-card-title">{way.title}</h3>
              <p className="xm-card-copy">{way.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Fabric & finish ── */}
      <section className="xm-section xm-reveal">
        <div className="xm-head">
          <span className="xm-kicker">Texture</span>
          <h2 className="xm-title">Fabric &amp; Finish</h2>
          <p className="xm-lede">The same {f.name.toLowerCase()} ({f.shades.main}) reads differently in every texture. Choose the finish by how much light you want the color to catch.</p>
        </div>
        <div className="xm-finishes">
          {finishesFor(f.shades.main).map((fin) => (
            <article className="xm-finish" key={fin.name}>
              <div className="xm-finish-swatch" style={{ background: fin.bg }} />
              <h3 className="xm-card-title">{fin.name}</h3>
              <p className="xm-card-copy">{fin.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Lighting — the core shade as it reads under four light sources. ── */}
      <section className="xm-section xm-reveal">
        <div className="xm-head">
          <span className="xm-kicker">Lighting</span>
          <h2 className="xm-title">Light Changes Everything</h2>
          <p className="xm-lede">The same {f.name.toLowerCase()} under four light sources. Color temperature, measured in Kelvin, shifts how every shade reads, which is why a lipstick can look different at home than in the store.</p>
        </div>
        <div className="xm-lights">
          {LIGHTS.map((light) => {
            const seen = underLight(f.shades.main, light.tint, light.amount, light.brightness)
            return (
              <article className="xm-light" key={light.name}>
                <div className="xm-light-swatch" style={{ background: `radial-gradient(circle at 50% 0%, ${light.glow} 0%, rgba(0,0,0,0) 60%), ${seen}` }}>
                  <span className="xm-light-kelvin">{light.kelvin}</span>
                  <span className="xm-light-hex" style={{ color: contrast(seen, '#ffffff') >= 3 ? '#fff' : TEXT_DARK }}>{seen}</span>
                </div>
                <h3 className="xm-card-title">{light.name}</h3>
                <p className="xm-card-copy">{light.note}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Design with it — live WCAG contrast for text on each shade. ── */}
      <section className="xm-section xm-reveal">
        <div className="xm-head">
          <span className="xm-kicker">For Designers</span>
          <h2 className="xm-title">Design With It</h2>
          <p className="xm-lede">Using {f.name.toLowerCase()} for a brand, a poster, or a feed? These are the real contrast ratios for white and black text on each shade, checked against the WCAG standard (4.5 to 1 for body text, 3 to 1 for large type).</p>
        </div>
        <div className="xm-contrast">
          {scale.map(([label, hex]) => (
            <article className="xm-contrast-card" key={label} style={{ background: hex }}>
              <span className="xm-contrast-label" style={{ color: contrast(hex, '#ffffff') >= contrast(hex, TEXT_DARK) ? '#fff' : TEXT_DARK }}>{label} · {hex}</span>
              {[['#ffffff', 'White'], [TEXT_DARK, 'Black']].map(([ink, inkName]) => {
                const ratio = contrast(hex, ink)
                // Every row gets its badge; a failing one just drops the grade.
                const grade = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : null
                return (
                  <div className="xm-contrast-row" key={inkName} style={{ color: ink }}>
                    <span className="xm-contrast-sample">Aa</span>
                    <span className="xm-contrast-meta">
                      <span className="xm-contrast-ratio">{ratio.toFixed(2)} : 1</span>
                      <span className="xm-contrast-grade">{inkName} text{grade ? ` · ${grade}` : ''}</span>
                    </span>
                  </div>
                )
              })}
            </article>
          ))}
        </div>
      </section>

      {/* ── Keep exploring — switches the whole page's color family ── */}
      <section className="xm-section xm-section--last xm-reveal">
        <div className="xm-head">
          <span className="xm-kicker">Continue</span>
          <h2 className="xm-title">Keep Exploring</h2>
        </div>
        <div className="xm-families">
          {FAMILY_ORDER.map((fam) => (
            <button
              type="button"
              key={fam}
              className={`xm-family${fam === key ? ' xm-family--active' : ''}`}
              onClick={() => switchFamily(fam)}
              aria-current={fam === key ? 'true' : undefined}
            >
              <img src={FAMILIES[fam].img} alt="" loading="lazy" />
              <span className="xm-family-tint" style={{ background: FAMILIES[fam].accent }} />
              <span className="xm-family-name">{FAMILIES[fam].name}</span>
              <span className="xm-family-cta">{fam === key ? 'you are here' : 'explore'}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
