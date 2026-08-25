import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { generatePalette } from '../utils/generatePalette'
import bearImg from '../../images/bear.png'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// and footer are pixel-for-pixel consistent with PalettePage. The tab
// selector itself is intentionally different — see DiscoverPalettesPage.css.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

// Everything here is generated locally (see utils/generatePalette.js) —
// no external API. TOTAL_COUNT is generated once per tab up front;
// PER_TAB_COUNT is shown right away, and "Discover More Palettes"
// reveals the rest of that same already-generated, already low -> high
// saturation-ordered set — never a fresh/different fetch.
const PER_TAB_COUNT = 45
const TOTAL_COUNT = 90

// Each category is a base hue/saturation range plus theme word banks —
// generatePalette combines those into TOTAL_COUNT swatches, ordered
// low -> high saturation, since at this volume per tab hand-authoring
// every single entry isn't practical. Saturation ranges are kept wide
// (not just a narrow band) so adjacent swatches read as genuinely
// different colors rather than the same shade repeated.
const CATEGORIES = [
  {
    tab: 'Warm Terracotta', hue: 18, sat: [28, 92],
    nouns: ['Clay', 'Terra', 'Ochre', 'Adobe', 'Canyon', 'Sienna', 'Umber', 'Sandstone', 'Brick', 'Rust'],
    descs: ['Sun-warmed adobe earth', 'Clay lit from within', 'Ember at the edge of ash', 'Deep earth after rain', 'Kiln-fired and settled', 'Where the fire finally rests', 'Weathered metal, quiet glow'],
  },
  {
    tab: 'Cool Slate', hue: 200, sat: [26, 88],
    nouns: ['Slate', 'Fog', 'Mist', 'Frost', 'Basalt', 'Stone', 'Cloud', 'Steel', 'Rain', 'Harbor'],
    descs: ['Thin, clean mountain air', 'First frost on glass', 'Overcast morning light', 'Rain over quiet water', 'Volcanic rock, cooled', 'Where the light runs out', 'Still, deep, and cold'],
  },
  {
    tab: 'Golden Hour', hue: 38, sat: [32, 98],
    nouns: ['Glow', 'Dusk', 'Flame', 'Horizon', 'Amber', 'Ember', 'Marigold', 'Copper', 'Gold', 'Ray'],
    descs: ['The sky just before gold', 'Light through honey glass', 'Warmth held in glass', 'The sun dropping low', 'Coals just past the flame', 'Embers catching wind', 'The last coal of the day'],
  },
  {
    tab: 'Midnight Bloom', hue: 265, sat: [28, 92],
    nouns: ['Violet', 'Shadow', 'Iris', 'Haze', 'Eclipse', 'Petal', 'Bloom', 'Orchid', 'Dusk', 'Ink'],
    descs: ['Soft light on pale petals', 'Perfume on cool air', 'Dusk folding into dusk', 'A bloom seen by moonlight', 'Shadow with a pulse of color', 'The hour past midnight', 'A flower drawn in the dark'],
  },
  {
    tab: 'Rose Quartz', hue: 345, sat: [28, 90],
    nouns: ['Quartz', 'Petal', 'Rosewater', 'Bloom', 'Coral', 'Blush', 'Blossom', 'Rosewood', 'Berry', 'Wine'],
    descs: ['Barely there at all', 'Faint sweetness in the air', 'Faded blossom petal pink', 'Stone holding onto pink', 'Furniture polished by years', 'A color one glass in', 'Pink losing its light'],
  },
  {
    tab: 'Forest Canopy', hue: 140, sat: [26, 88],
    nouns: ['Canopy', 'Moss', 'Forest', 'Fern', 'Pine', 'Grove', 'Leaf', 'Shade', 'Thicket', 'Sage'],
    descs: ['New growth, still soft', 'Herb garden after rain', 'Light breaking through branches', 'Forest at its darkest edge', 'Undergrowth, dense and dark', 'The color between the trees', 'Where the canopy closes over'],
  },
  {
    tab: 'Desert Bloom', hue: 8, sat: [30, 95],
    nouns: ['Mesa', 'Dune', 'Bloom', 'Desert', 'Sand', 'Cactus', 'Coral', 'Canyon', 'Salmon', 'Terra'],
    descs: ['Warm underfoot at noon', 'Sand catching evening color', 'A flower against the odds', 'Petals under a hard sun', 'Rock walls at sundown', 'Where the desert catches fire', 'Earth with a flush of pink'],
  },
  {
    tab: 'Ocean Depth', hue: 205, sat: [30, 96],
    nouns: ['Depth', 'Current', 'Reef', 'Tide', 'Wave', 'Trench', 'Horizon', 'Azure', 'Marine', 'Lagoon'],
    descs: ['Foam catching morning light', 'Water still holding sunlight', 'Spray off a breaking wave', 'Color just past the shallows', 'Where the sunlight stops', 'Pressure, cold, and quiet', 'Past where anything is seen'],
  },
  {
    tab: 'Nude Series', hue: 28, sat: [22, 75],
    nouns: ['Nude', 'Sand', 'Beige', 'Honey', 'Buff', 'Toffee', 'Caramel', 'Cinnamon', 'Cocoa', 'Umber'],
    descs: ['Barely a color at all', 'Warmth without weight', 'Linen left in the sun', 'Skin-warm and quiet', 'Sun-deepened and even', 'Spice settled into skin', 'The last, darkest warmth'],
  },
  {
    tab: 'Autumn Harvest', hue: 26, sat: [30, 96],
    nouns: ['Wheat', 'Pumpkin', 'Maple', 'Harvest', 'Cinnamon', 'Chestnut', 'Rust', 'Umber', 'Mahogany', 'Bark'],
    descs: ['Fields ready for cutting', 'Sap turning to syrup', 'Spice still on the branch', 'Roasted over open coals', 'Leaves giving up their green', 'The last color before the drop', 'The field after the frost'],
  },
  {
    tab: 'Coastal Breeze', hue: 185, sat: [28, 90],
    nouns: ['Foam', 'Aqua', 'Teal', 'Mist', 'Seaglass', 'Lagoon', 'Tidepool', 'Marine', 'Slate', 'Breeze'],
    descs: ['Where the wave just broke', 'Shallow water over sand', 'Spray caught in morning light', 'Smoothed by years of tide', 'Color trapped between the rocks', 'Where the shallows finally end', 'The sea with the sun long gone'],
  },
  {
    tab: 'Berry Wine', hue: 350, sat: [30, 95],
    nouns: ['Berry', 'Raspberry', 'Cranberry', 'Wine', 'Merlot', 'Burgundy', 'Garnet', 'Rosewood', 'Grape', 'Plum'],
    descs: ['The first ripening', 'Fruit still cool from the vine', 'Sweetness with a little bite', 'Fruit past its brightest red', 'Poured and left to breathe', 'Color aged in oak', 'The last color of the harvest'],
  },
  {
    // The one tab that isn't a single color family — cycles through
    // several hues (generatePalette accepts an array) while saturation
    // still runs low -> high across the whole set, same as every other
    // tab. Fully local, same as the rest — no external API involved.
    tab: 'Fresh Mix', hue: [18, 200, 38, 265, 345, 140, 8, 205, 26, 350], sat: [26, 96],
    nouns: ['Hue', 'Tone', 'Shade', 'Mix', 'Blend', 'Cast', 'Note'],
    descs: ['A shade freshly drawn', 'Color, undiluted', 'Straight from the source', 'A tone worth pausing on', 'A color found, not chosen', 'A color in its own right'],
  },
]

const TABS = CATEGORIES.map((c) => c.tab)

// Built once at module load, not per-render — the palette lists never
// change, only how many of each are currently shown.
const PALETTES = Object.fromEntries(
  CATEGORIES.map(({ tab, hue, sat, nouns, descs }) =>
    [tab, generatePalette({ hue, sat, nouns, descs, count: TOTAL_COUNT })]
  )
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

export default function DiscoverPalettesPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(
    TABS.includes(location.state?.tab) ? location.state.tab : TABS[0]
  )
  const [fullMenuOpen, setFullMenuOpen] = useState(false)
  // How many of each tab's already-generated TOTAL_COUNT swatches are
  // currently shown — starts at PER_TAB_COUNT, "Discover More Palettes"
  // bumps it to TOTAL_COUNT. No fetching involved either way.
  const [visibleCountByTab, setVisibleCountByTab] = useState({})
  const giantTextRef = useRef(null)

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Same flashlight hover effect on the giant footer "kero." text as
  // PalettePage — tracked globally via CSS custom properties so the
  // spotlight is already correctly positioned the instant the cursor
  // enters the text, rather than snapping from a stale last-known spot.
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

  // Menu items are this page's own tab names, not decorative Colormind
  // names — picking one switches straight to that tab and closes the menu.
  const handleMenuItemClick = (tab) => {
    setFullMenuOpen(false)
    handleTabClick(tab)
  }

  const visibleCount = visibleCountByTab[activeTab] ?? PER_TAB_COUNT
  const paletteItems = PALETTES[activeTab].slice(0, visibleCount)
  const isFullyShown = visibleCount >= TOTAL_COUNT

  const loadMore = () => {
    setVisibleCountByTab((prev) => ({ ...prev, [activeTab]: TOTAL_COUNT }))
  }

  return (
    <div className="pp-page">
      {/* Capped at 9 — FullMenu's own entrance animation only staggers
          up to 9 rows (see .fm-item:nth-child in FullMenu.css), same as
          every other page's hamburger menu. */}
      <FullMenu open={fullMenuOpen} onClose={() => setFullMenuOpen(false)} items={TABS.slice(0, 9)} onItemClick={handleMenuItemClick} />

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

      {/* ── Tabs — filled chip style, different from PalettePage's
          underlined text tabs on purpose (see DiscoverPalettesPage.css).
          Wraps naturally so no separate mobile dropdown is needed. ── */}
      <div className="dp-tabs-wrap">
        {/* data-lenis-prevent — Lenis intercepts touch/wheel at the
            window level to drive its own smooth scroll, which otherwise
            fights this row's own native horizontal scroll on mobile
            (two things trying to own the same gesture each frame is
            what read as jitter while sliding). This attribute tells
            Lenis to leave gestures starting inside this element alone. */}
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
          -> high saturation across the whole set. "Discover More
          Palettes" reveals the rest of this same generated set. ── */}
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
