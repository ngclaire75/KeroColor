import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

// The same core shade rendered as four real fabrics, as SVG filters tinted
// with the active family's color. Cotton and lamé are lighting renders:
// noise builds a height map (drape folds plus fiber grain), diffuse light
// shades it and specular light adds the shine. Satin and velvet use a
// `tone` render instead, mapping smooth fold noise straight to shadow and
// highlight bands, since their glassy surfaces would show the height
// map's 8-bit steps as contour lines under lighting.
//   tone: shadeMin + shadeRange scale the color from fold valley to
//   crest, hl is the highlight curve (only crests light up), grain adds
//   pile texture
//   foldFreq / foldAmp: size and depth of the drape folds
//   grainFreq / grainAmp: fiber texture (weave, pile, foil crinkle)
//   blur: smooths the surface (satin is glassy, cotton is not)
//   relief: surfaceScale, how pronounced the light and shadow are
//   elevation: light angle (lower = deeper shadows)
//   gain: multiplies the lit color back toward the true shade
//   spec: [constant, exponent] for the highlight, null for none
//   specTint: highlight color (metal reflects tinted light)
const FABRICS = [
  {
    name: 'Matte Cotton',
    sheen: 1,
    copy: 'Short, spun fibers scatter light evenly, so the shade reads true and flat. The most accurate way to judge a color.',
    foldFreq: '0.014 0.0025', foldAmp: 0.5, grainFreq: '0.9 0.9', grainAmp: 0.18, grainType: 'turbulence',
    blur: 0, relief: 4, elevation: 58, gain: 1.16, spec: null,
  },
  {
    name: 'Silk Satin',
    sheen: 3,
    copy: 'Long floating threads mirror light in bands along every fold, so highlights run paler and shadows deeper than the true shade.',
    tone: { foldFreq: '0.008 0.0016', blur: 2.5, shadeMin: 0.5, shadeRange: 0.8, hl: '0 0 0 0 0.12 0.55 1', hlStrength: 0.42, grain: 0 },
  },
  {
    name: 'Velvet',
    sheen: 2,
    copy: 'Upright pile traps light, so the color sits deeper and richer, with a soft glow only where the fabric bends toward you.',
    tone: { foldFreq: '0.011 0.0022', blur: 3.5, shadeMin: 0.42, shadeRange: 0.72, hl: '0 0 0 0 0 0.25 0.6', hlStrength: 0.2, grain: 0.28 },
  },
  {
    name: 'Metallic Lamé',
    sheen: 4,
    copy: 'Woven with metallic yarn that reflects like foil. Every crinkle flashes almost white, so keep it to one statement piece.',
    foldFreq: '0.02 0.016', foldAmp: 0.8, grainFreq: '0.07 0.07', grainAmp: 0.22, grainType: 'fractalNoise',
    blur: 1.4, relief: 5, elevation: 48, gain: 1, spec: [1.2, 30], specTint: true,
  },
]

// Mixes a hex color toward white by t (0..1), for the metallic highlight.
const tint = (hex, t) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t))
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function ToneFilter({ id, tone, color }) {
  const curve = (values) => ['R', 'G', 'B'].map((ch) => {
    const Fn = `feFunc${ch}`
    return <Fn key={ch} type="table" tableValues={values} />
  })
  return (
    <filter id={id} x="-30" y="-30" width="360" height="460" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={tone.foldFreq} numOctaves="2" seed="7" result="folds" />
      <feColorMatrix in="folds" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="gray" />
      <feComponentTransfer in="gray" result="stretched">
        <feFuncR type="linear" slope="2.4" intercept="-0.7" />
        <feFuncG type="linear" slope="2.4" intercept="-0.7" />
        <feFuncB type="linear" slope="2.4" intercept="-0.7" />
      </feComponentTransfer>
      <feGaussianBlur in="stretched" stdDeviation={tone.blur} result="shape" />
      <feComponentTransfer in="shape" result="hl">{curve(tone.hl)}</feComponentTransfer>
      <feFlood floodColor={color} result="base" />
      <feComposite in="base" in2="shape" operator="arithmetic" k1={tone.shadeRange} k2={tone.shadeMin} result="shaded" />
      {tone.grain ? (
        <>
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="3" result="pile" />
          <feColorMatrix in="pile" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="pileGray" />
          <feComposite in="shaded" in2="pileGray" operator="arithmetic" k1={tone.grain} k2={1 - tone.grain / 2} result="lit" />
        </>
      ) : (
        <feOffset in="shaded" result="lit" />
      )}
      <feComposite in="lit" in2="hl" operator="arithmetic" k2="1" k3={tone.hlStrength} />
    </filter>
  )
}

function FabricSwatch({ fabric, color, uid }) {
  const id = `xm-fab-${uid}`
  const light = (el) => <feDistantLight azimuth="235" elevation={fabric.elevation}>{el}</feDistantLight>
  return (
    <svg className="xm-finish-swatch" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${fabric.name} in ${color}`}>
      <defs>
        {fabric.tone ? <ToneFilter id={id} tone={fabric.tone} color={color} /> : (
        <filter id={id} x="-30" y="-30" width="360" height="460" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={fabric.foldFreq} numOctaves="2" seed="7" result="folds" />
          <feColorMatrix in="folds" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${fabric.foldAmp} 0 0 0 0`} result="foldH" />
          <feTurbulence type={fabric.grainType} baseFrequency={fabric.grainFreq} numOctaves="2" seed="3" result="grain" />
          <feColorMatrix in="grain" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${fabric.grainAmp} 0 0 0 0`} result="grainH" />
          <feComposite in="foldH" in2="grainH" operator="arithmetic" k2="1" k3="1" result="rawH" />
          <feGaussianBlur in="rawH" stdDeviation={fabric.blur} result="height" />
          <feDiffuseLighting in="height" surfaceScale={fabric.relief} diffuseConstant="1" lightingColor="#ffffff" result="shade">
            {light()}
          </feDiffuseLighting>
          <feFlood floodColor={color} result="base" />
          <feComposite in="base" in2="shade" operator="arithmetic" k1={fabric.gain} result="lit" />
          {fabric.spec ? (
            <>
              <feSpecularLighting in="height" surfaceScale={fabric.relief} specularConstant={fabric.spec[0]} specularExponent={fabric.spec[1]} lightingColor={fabric.specTint ? tint(color, 0.7) : '#ffffff'} result="spec">
                {light()}
              </feSpecularLighting>
              <feComposite in="lit" in2="spec" operator="arithmetic" k2="1" k3="1" />
            </>
          ) : null}
        </filter>
        )}
      </defs>
      {/* Oversized so the lighting's edge falloff lands outside the crop. */}
      <rect x="-30" y="-30" width="360" height="460" fill="#000" filter={`url(#${id})`} />
    </svg>
  )
}

export default function ExploreMore({ searchResult, onFamilyChange }) {
  const key = FAMILIES[searchResult?.colorFamily] ? searchResult.colorFamily : 'red'
  const f = FAMILIES[key]
  const rootRef = useRef(null)
  const navigate = useNavigate()

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          {FABRICS.map((fab, i) => (
            <article className="xm-finish" key={fab.name}>
              <FabricSwatch fabric={fab} color={f.shades.main} uid={`${key}-${i}`} />
              <h3 className="xm-card-title">{fab.name}</h3>
              <div className="xm-sheen" aria-label={`Sheen ${fab.sheen} of 4`}>
                <span className="xm-sheen-label">Sheen</span>
                {[1, 2, 3, 4].map((n) => <i key={n} className={n <= fab.sheen ? 'xm-sheen-on' : undefined} />)}
              </div>
              <p className="xm-card-copy">{fab.copy}</p>
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
