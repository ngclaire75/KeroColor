import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { generatePalette, hexSaturation } from '../utils/generatePalette'
import bearImg from '../../images/bear.png'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// tab style, and footer are pixel-for-pixel consistent with
// DiscoverPalettesPage/PalettePage — this is a scoped variant of the
// same page, just limited to the 4 seasons instead of the broader
// category list.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

// Everything here is generated locally (see utils/generatePalette.js) —
// no external API. TOTAL_COUNT is generated once per tab up front;
// PER_TAB_COUNT is shown right away, and "Discover More Palettes"
// reveals the rest of that same already-generated, already low -> high
// saturation-ordered set.
const PER_TAB_COUNT = 45
const TOTAL_COUNT = 90

// Each season is a base hue/saturation range plus theme word banks (see
// DiscoverPalettesPage.jsx for why — at this volume per tab, generating
// names combinatorially is what keeps them unique without hand-writing
// each one). Saturation ranges are kept wide so adjacent swatches read
// as genuinely different colors rather than the same shade repeated.
// Spring is split into two segments, greens then pinks — new growth
// giving way to blossom — rather than running a single hue.
const SEASONS = [
  {
    tab: 'Spring',
    segments: [
      { hue: 128, sat: [6, 90], count: 48,
        nouns: ['Leaf', 'Sprout', 'Bud', 'Meadow', 'Fern', 'Clover', 'Vine', 'Moss'],
        descs: ['Green still soft from the stem', 'Growth pushing through soil', 'A field waking up', 'Shade under new branches', 'Grass thick with rain', 'Climbing toward the light'] },
      { hue: 340, sat: [8, 90], count: 42,
        nouns: ['Blossom', 'Petal', 'Bloom', 'Cherry', 'Blush'],
        descs: ['The first bud opening', 'Pink just past the bud', 'A branch heavy with flowers', 'Petals catching the wind', 'The last bloom before the leaves take over'] },
    ],
  },
  {
    tab: 'Summer', hue: 42, sat: [8, 98],
    nouns: ['Sun', 'Citrus', 'Mango', 'Marigold', 'Amber', 'Coral', 'Copper', 'Peach', 'Cream'],
    descs: ['Light without any weight', 'Warmth held just under the skin', 'Midday at its brightest', 'Sharp, sweet, and warm', 'The air just before a storm', 'The day, slowing down', 'The last warm hour'],
  },
  {
    tab: 'Autumn', hue: 24, sat: [8, 96],
    nouns: ['Straw', 'Wheat', 'Leaf', 'Maple', 'Pumpkin', 'Cinnamon', 'Acorn', 'Sienna', 'Rust', 'Bark'],
    descs: ['Fields cut and drying', 'A leaf just starting to turn', 'Sap slowing in the cold', 'Warmth against the first chill', 'Gathered before the frost', 'Leaves giving up their green', 'The tree, bare and waiting'],
  },
  {
    tab: 'Winter', hue: 208, sat: [4, 85],
    nouns: ['Frost', 'Ice', 'Snow', 'Mist', 'Steel', 'Glacier', 'Slate', 'Fjord', 'Pine', 'Polar'],
    descs: ['Breath visible in cold light', 'The first freeze on glass', 'Bright, flat, and quiet', 'Clouds holding onto snow', 'Old ice, still moving slowly', 'Stone under a hard freeze', 'Winter at its darkest edge'],
  },
]

const TABS = SEASONS.map((s) => s.tab)

const PALETTES = Object.fromEntries(
  SEASONS.map(({ tab, hue, sat, nouns, descs, segments }) => {
    const list = segments
      // Each segment is already sorted on its own (see generatePalette),
      // but the two segments' saturation ranges overlap, so the merged
      // list needs its own explicit sort to stay truly low -> high
      // across the whole tab, not just within each segment.
      ? segments.flatMap((seg) => generatePalette(seg)).sort((a, b) => hexSaturation(a.color) - hexSaturation(b.color))
      : generatePalette({ hue, sat, nouns, descs, count: TOTAL_COUNT })
    return [tab, list]
  })
)

const FOOTER_PAGES_LEFT = [
  { label: 'Home',           href: '/',        type: 'link'   },
  { label: 'About Us',       href: '/#about',  type: 'link'   },
  { label: 'Color Palette',  href: '/palette', type: 'link'   },
  { label: 'Explore',        href: '/explore', type: 'link'   },
]

const FOOTER_PAGES_RIGHT = [
  { label: 'FAQ',            href: '/#faq',    type: 'link'   },
  { label: 'Contact',        href: '/#contact', type: 'link'  },
]

export default function SeasonalPalettesPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(
    TABS.includes(location.state?.tab) ? location.state.tab : TABS[0]
  )
  const [fullMenuOpen, setFullMenuOpen] = useState(false)
  // How many of each tab's already-generated set are currently shown —
  // starts at PER_TAB_COUNT, "Discover More Palettes" bumps it to the
  // tab's full length. No fetching involved either way.
  const [visibleCountByTab, setVisibleCountByTab] = useState({})
  const giantTextRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const handleMove = (e) => {
      const el = giantTextRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
      el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  const handleTabClick = (tab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
  }

  const handleMenuItemClick = (tab) => {
    setFullMenuOpen(false)
    handleTabClick(tab)
  }

  const fullList = PALETTES[activeTab]
  const visibleCount = visibleCountByTab[activeTab] ?? PER_TAB_COUNT
  const paletteItems = fullList.slice(0, visibleCount)
  const isFullyShown = visibleCount >= fullList.length

  const loadMore = () => {
    setVisibleCountByTab((prev) => ({ ...prev, [activeTab]: fullList.length }))
  }

  return (
    <div className="pp-page">
      <FullMenu open={fullMenuOpen} onClose={() => setFullMenuOpen(false)} items={TABS} onItemClick={handleMenuItemClick} />

      {/* ── Navigation — identical to PalettePage's ── */}
      <nav className="pp-nav">
        <div className="pp-nav-left">
          <button className="pp-nav-action" onClick={() => setFullMenuOpen(true)} aria-label="Open menu">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect width="17" height="1.6" rx="0.8" fill="#371a16"/>
              <rect y="5.2" width="17" height="1.6" rx="0.8" fill="#371a16"/>
              <rect y="10.4" width="17" height="1.6" rx="0.8" fill="#371a16"/>
            </svg>
          </button>
        </div>

        <div className="pp-nav-center">
          <Link to="/" className="pp-nav-brand">
            <span className="pp-nav-brand-text">KEROCOLOR</span>
            <img src={bearImg} alt="KeroColor" className="pp-nav-brand-img" />
          </Link>
        </div>
      </nav>

      {/* ── Tabs — just the 4 seasons, same red-chip style as
          DiscoverPalettesPage's tabs. ── */}
      <div className="dp-tabs-wrap">
        {/* data-lenis-prevent — see DiscoverPalettesPage.jsx: stops
            Lenis's own touch/wheel handling from fighting this row's
            native horizontal scroll on mobile. */}
        <div className="dp-tabs" data-lenis-prevent>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`dp-tab${activeTab === tab ? ' dp-tab--active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Palette grid — same swatch layout/fonts as PalettePage, low
          -> high saturation across the whole set. ── */}
      <div className="pp-palette-grid">
        {paletteItems.map((item) => (
          <div key={item.name} className="pp-palette-item">
            <div className="pp-palette-swatch" style={{ background: item.color }} />
            <div className="pp-palette-text">
              <p className="pp-palette-desc">{item.desc}</p>
              <h3 className="pp-palette-name">{item.name}</h3>
              <p className="pp-palette-hex">{item.color}</p>
            </div>
          </div>
        ))}
      </div>

      {!isFullyShown && (
        <div className="pp-discover-wrap">
          <button className="pp-discover-btn" onClick={loadMore}>Discover More Palettes</button>
        </div>
      )}

      {/* ── Footer — identical to PalettePage's ── */}
      <footer className="pp-footer">
        <div className="pp-footer-top">
          <nav className="pp-footer-nav">
            {FOOTER_PAGES_LEFT.map(p =>
              p.type === 'link'
                ? <Link key={p.label} to={p.href} className="pp-footer-nav-link">{p.label}</Link>
                : <a key={p.label} href={p.href} className="pp-footer-nav-link">{p.label}</a>
            )}
          </nav>
          <nav className="pp-footer-nav pp-footer-nav--right">
            {FOOTER_PAGES_RIGHT.map(p =>
              p.type === 'link'
                ? <Link key={p.label} to={p.href} className="pp-footer-nav-link">{p.label}</Link>
                : <a key={p.label} href={p.href} className="pp-footer-nav-link">{p.label}</a>
            )}
          </nav>
        </div>
        <div className="pp-footer-giant-wrap">
          <div
            ref={giantTextRef}
            className="pp-footer-giant-inner"
          >
            <span className="pp-footer-giant-text">k<span className="pp-footer-giant-text-e">e</span><span className="pp-footer-giant-text-e">r</span>o<span className="pp-footer-giant-dot">.</span></span>
            <span className="pp-footer-giant-text pp-footer-giant-text--spotlight" aria-hidden="true">k<span className="pp-footer-giant-text-e">e</span><span className="pp-footer-giant-text-e">r</span>o<span className="pp-footer-giant-dot">.</span></span>
          </div>
        </div>
      </footer>

    </div>
  )
}
