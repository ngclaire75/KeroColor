import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { fetchPaletteSwatches } from '../utils/paletteNames'
import { generatePalette, hexSaturation } from '../utils/generatePalette'
import bearImg from '../../images/bear.png'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// tab style, and footer are pixel-for-pixel consistent with
// DiscoverPalettesPage/PalettePage — this is a scoped variant of the
// same page, just limited to the 4 seasons instead of the broader
// category list.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

const PER_TAB_COUNT = 45

// Each season is a base hue/saturation range plus theme word banks (see
// DiscoverPalettesPage.jsx for why — at this volume per tab, generating
// names combinatorially is what keeps them unique without hand-writing
// each one). Spring is split into two segments, greens then pinks — new
// growth giving way to blossom — rather than running a single hue.
const SEASONS = [
  {
    tab: 'Spring',
    segments: [
      { hue: 128, sat: [10, 55], count: 24,
        nouns: ['Leaf', 'Sprout', 'Bud', 'Meadow', 'Fern', 'Clover', 'Vine', 'Moss'],
        descs: ['Green still soft from the stem', 'Growth pushing through soil', 'A field waking up', 'Shade under new branches', 'Grass thick with rain', 'Climbing toward the light'] },
      { hue: 340, sat: [12, 55], count: 21,
        nouns: ['Blossom', 'Petal', 'Bloom', 'Cherry', 'Blush'],
        descs: ['The first bud opening', 'Pink just past the bud', 'A branch heavy with flowers', 'Petals catching the wind', 'The last bloom before the leaves take over'] },
    ],
  },
  {
    tab: 'Summer', hue: 42, sat: [30, 96],
    nouns: ['Sun', 'Citrus', 'Mango', 'Marigold', 'Amber', 'Coral', 'Copper', 'Peach', 'Cream'],
    descs: ['Light without any weight', 'Warmth held just under the skin', 'Midday at its brightest', 'Sharp, sweet, and warm', 'The air just before a storm', 'The day, slowing down', 'The last warm hour'],
  },
  {
    tab: 'Autumn', hue: 24, sat: [18, 82],
    nouns: ['Straw', 'Wheat', 'Leaf', 'Maple', 'Pumpkin', 'Cinnamon', 'Acorn', 'Sienna', 'Rust', 'Bark'],
    descs: ['Fields cut and drying', 'A leaf just starting to turn', 'Sap slowing in the cold', 'Warmth against the first chill', 'Gathered before the frost', 'Leaves giving up their green', 'The tree, bare and waiting'],
  },
  {
    tab: 'Winter', hue: 208, sat: [4, 52],
    nouns: ['Frost', 'Ice', 'Snow', 'Mist', 'Steel', 'Glacier', 'Slate', 'Fjord', 'Pine', 'Polar'],
    descs: ['Breath visible in cold light', 'The first freeze on glass', 'Bright, flat, and quiet', 'Clouds holding onto snow', 'Old ice, still moving slowly', 'Stone under a hard freeze', 'Winter at its darkest edge'],
  },
]

const TABS = SEASONS.map((s) => s.tab)

// Spring has two hue segments (greens, then pinks — see above) instead
// of one; "load more" anchors to the first/primary segment's hue rather
// than trying to represent both at once.
const HUE_ANCHOR_BY_TAB = Object.fromEntries(
  SEASONS.map(({ tab, hue, sat, segments }) => {
    const { hue: h, sat: s } = segments ? segments[0] : { hue, sat }
    return [tab, { hue: h, sat: (s[0] + s[1]) / 2 }]
  })
)

const PALETTES = Object.fromEntries(
  SEASONS.map(({ tab, hue, sat, nouns, descs, segments }) => {
    const list = segments
      ? segments.flatMap((seg) => generatePalette({ ...seg, count: seg.count }))
      : generatePalette({ hue, sat, nouns, descs, count: PER_TAB_COUNT })
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
  const [extraByTab, setExtraByTab] = useState({})
  const [loadingMore, setLoadingMore] = useState(false)
  const [exhaustedTabs, setExhaustedTabs] = useState(() => new Set())
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

  const paletteItems = [...PALETTES[activeTab], ...(extraByTab[activeTab] || [])]
    .sort((a, b) => hexSaturation(a.color) - hexSaturation(b.color))

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const more = await fetchPaletteSwatches(6, HUE_ANCHOR_BY_TAB[activeTab])
      const existingNames = new Set(paletteItems.map((p) => p.name))
      const fresh = more.filter((s) => !existingNames.has(s.name))
      if (fresh.length) {
        setExtraByTab((prev) => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), ...fresh],
        }))
      } else {
        setExhaustedTabs((prev) => new Set(prev).add(activeTab))
      }
    } finally {
      setLoadingMore(false)
    }
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
        <div className="dp-tabs">
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

      {/* ── Palette grid — same swatch layout/fonts as PalettePage; each
          season's full, complete set shown immediately. ── */}
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

      {!exhaustedTabs.has(activeTab) && (
        <div className="pp-discover-wrap">
          <button className="pp-discover-btn" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Discover More Palettes'}
          </button>
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
