import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { fetchPaletteSwatches } from '../utils/paletteNames'
import { generatePalette, hexSaturation } from '../utils/generatePalette'
import bearImg from '../../images/bear.png'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// and footer are pixel-for-pixel consistent with PalettePage. The tab
// selector itself is intentionally different — see DiscoverPalettesPage.css.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

const PER_TAB_COUNT = 45
const LOAD_MORE_BATCH = 6

// Each category is a base hue/saturation range plus theme word banks —
// generatePalette (see utils/generatePalette.js) combines those into
// PER_TAB_COUNT swatches, ordered low -> high saturation, since at this
// volume per tab hand-authoring every single entry isn't practical.
const CATEGORIES = [
  {
    tab: 'Warm Terracotta', hue: 18, sat: [15, 78],
    nouns: ['Clay', 'Terra', 'Ochre', 'Adobe', 'Canyon', 'Sienna', 'Umber', 'Sandstone', 'Brick', 'Rust'],
    descs: ['Sun-warmed adobe earth', 'Clay lit from within', 'Ember at the edge of ash', 'Deep earth after rain', 'Kiln-fired and settled', 'Where the fire finally rests', 'Weathered metal, quiet glow'],
  },
  {
    tab: 'Cool Slate', hue: 200, sat: [4, 50],
    nouns: ['Slate', 'Fog', 'Mist', 'Frost', 'Basalt', 'Stone', 'Cloud', 'Steel', 'Rain', 'Harbor'],
    descs: ['Thin, clean mountain air', 'First frost on glass', 'Overcast morning light', 'Rain over quiet water', 'Volcanic rock, cooled', 'Where the light runs out', 'Still, deep, and cold'],
  },
  {
    tab: 'Golden Hour', hue: 38, sat: [40, 96],
    nouns: ['Glow', 'Dusk', 'Flame', 'Horizon', 'Amber', 'Ember', 'Marigold', 'Copper', 'Gold', 'Ray'],
    descs: ['The sky just before gold', 'Light through honey glass', 'Warmth held in glass', 'The sun dropping low', 'Coals just past the flame', 'Embers catching wind', 'The last coal of the day'],
  },
  {
    tab: 'Midnight Bloom', hue: 265, sat: [12, 68],
    nouns: ['Violet', 'Shadow', 'Iris', 'Haze', 'Eclipse', 'Petal', 'Bloom', 'Orchid', 'Dusk', 'Ink'],
    descs: ['Soft light on pale petals', 'Perfume on cool air', 'Dusk folding into dusk', 'A bloom seen by moonlight', 'Shadow with a pulse of color', 'The hour past midnight', 'A flower drawn in the dark'],
  },
  {
    tab: 'Rose Quartz', hue: 345, sat: [8, 62],
    nouns: ['Quartz', 'Petal', 'Rosewater', 'Bloom', 'Coral', 'Blush', 'Blossom', 'Rosewood', 'Berry', 'Wine'],
    descs: ['Barely there at all', 'Faint sweetness in the air', 'Faded blossom petal pink', 'Stone holding onto pink', 'Furniture polished by years', 'A color one glass in', 'Pink losing its light'],
  },
  {
    tab: 'Forest Canopy', hue: 140, sat: [8, 58],
    nouns: ['Canopy', 'Moss', 'Forest', 'Fern', 'Pine', 'Grove', 'Leaf', 'Shade', 'Thicket', 'Sage'],
    descs: ['New growth, still soft', 'Herb garden after rain', 'Light breaking through branches', 'Forest at its darkest edge', 'Undergrowth, dense and dark', 'The color between the trees', 'Where the canopy closes over'],
  },
  {
    tab: 'Desert Bloom', hue: 8, sat: [22, 82],
    nouns: ['Mesa', 'Dune', 'Bloom', 'Desert', 'Sand', 'Cactus', 'Coral', 'Canyon', 'Salmon', 'Terra'],
    descs: ['Warm underfoot at noon', 'Sand catching evening color', 'A flower against the odds', 'Petals under a hard sun', 'Rock walls at sundown', 'Where the desert catches fire', 'Earth with a flush of pink'],
  },
  {
    tab: 'Ocean Depth', hue: 205, sat: [24, 88],
    nouns: ['Depth', 'Current', 'Reef', 'Tide', 'Wave', 'Trench', 'Horizon', 'Azure', 'Marine', 'Lagoon'],
    descs: ['Foam catching morning light', 'Water still holding sunlight', 'Spray off a breaking wave', 'Color just past the shallows', 'Where the sunlight stops', 'Pressure, cold, and quiet', 'Past where anything is seen'],
  },
  {
    tab: 'Nude Series', hue: 28, sat: [6, 48],
    nouns: ['Nude', 'Sand', 'Beige', 'Honey', 'Buff', 'Toffee', 'Caramel', 'Cinnamon', 'Cocoa', 'Umber'],
    descs: ['Barely a color at all', 'Warmth without weight', 'Linen left in the sun', 'Skin-warm and quiet', 'Sun-deepened and even', 'Spice settled into skin', 'The last, darkest warmth'],
  },
  {
    tab: 'Autumn Harvest', hue: 26, sat: [26, 88],
    nouns: ['Wheat', 'Pumpkin', 'Maple', 'Harvest', 'Cinnamon', 'Chestnut', 'Rust', 'Umber', 'Mahogany', 'Bark'],
    descs: ['Fields ready for cutting', 'Sap turning to syrup', 'Spice still on the branch', 'Roasted over open coals', 'Leaves giving up their green', 'The last color before the drop', 'The field after the frost'],
  },
  {
    tab: 'Coastal Breeze', hue: 185, sat: [8, 64],
    nouns: ['Foam', 'Aqua', 'Teal', 'Mist', 'Seaglass', 'Lagoon', 'Tidepool', 'Marine', 'Slate', 'Breeze'],
    descs: ['Where the wave just broke', 'Shallow water over sand', 'Spray caught in morning light', 'Smoothed by years of tide', 'Color trapped between the rocks', 'Where the shallows finally end', 'The sea with the sun long gone'],
  },
  {
    tab: 'Berry Wine', hue: 350, sat: [18, 84],
    nouns: ['Berry', 'Raspberry', 'Cranberry', 'Wine', 'Merlot', 'Burgundy', 'Garnet', 'Rosewood', 'Grape', 'Plum'],
    descs: ['The first ripening', 'Fruit still cool from the vine', 'Sweetness with a little bite', 'Fruit past its brightest red', 'Poured and left to breathe', 'Color aged in oak', 'The last color of the harvest'],
  },
]

// Last tab is powered by the live Colormind API instead of a hand-curated
// list — see the fetch in the component below.
const FRESH_MIX_TAB = 'Fresh Mix'
const TABS = [...CATEGORIES.map((c) => c.tab), FRESH_MIX_TAB]

// Generated the same way as the curated categories (not themed to any
// one hue, since Fresh Mix is meant to stay open-ended) — used only
// until the real Colormind fetch below resolves.
const FRESH_MIX_FALLBACK = generatePalette({
  hue: 20, sat: [10, 90],
  nouns: ['Hue', 'Tone', 'Shade', 'Mix', 'Blend', 'Cast', 'Note'],
  descs: ['A shade freshly drawn', 'Color, undiluted', 'Straight from the source', 'A tone worth pausing on', 'A color found, not chosen', 'A color in its own right'],
  count: PER_TAB_COUNT,
})

// Built once at module load, not per-render — the palette lists never
// change, only which tab/how many of each are currently shown.
const PALETTES = Object.fromEntries(
  CATEGORIES.map(({ tab, hue, sat, nouns, descs }) =>
    [tab, generatePalette({ hue, sat, nouns, descs, count: PER_TAB_COUNT })]
  )
)

// Each curated tab's hue/sat, used to anchor "load more" fetches to the
// same color family (see loadMore in the component below) — Fresh Mix
// has no entry here on purpose, since it's meant to stay unthemed.
const HUE_ANCHOR_BY_TAB = Object.fromEntries(
  CATEGORIES.map(({ tab, hue, sat }) => [tab, { hue, sat: (sat[0] + sat[1]) / 2 }])
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
  const [freshMix, setFreshMix] = useState(FRESH_MIX_FALLBACK)
  // Extra swatches fetched live from Colormind and appended onto a tab's
  // base list via "Discover More Palettes" — keyed by tab name so each
  // tab keeps its own growing set independently.
  const [extraByTab, setExtraByTab] = useState({})
  const [loadingMore, setLoadingMore] = useState(false)
  // Tabs where a load-more attempt came back with nothing new — the
  // generator's own combinatorial space for that hue is finite, so once
  // a tab hits this the button hides there instead of inviting more
  // clicks that can't add anything.
  const [exhaustedTabs, setExhaustedTabs] = useState(() => new Set())
  const giantTextRef = useRef(null)

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Fresh Mix is the one tab backed by the live Colormind API rather
  // than a hand-curated list — fetched once in the background so it's
  // ready by the time anyone actually switches to it, falling back to
  // the static set above if the API is unreachable.
  useEffect(() => {
    let cancelled = false
    fetchPaletteSwatches(PER_TAB_COUNT).then((swatches) => {
      if (!cancelled && swatches.length) setFreshMix(swatches)
    })
    return () => { cancelled = true }
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

  const baseItems = activeTab === FRESH_MIX_TAB ? freshMix : PALETTES[activeTab]
  // Re-sorted by saturation ascending every time, not just relying on
  // baseItems' own construction order — "load more" appends real
  // Colormind colors that need folding into the same low -> high order,
  // not just tacked on at the end.
  const paletteItems = [...baseItems, ...(extraByTab[activeTab] || [])]
    .sort((a, b) => hexSaturation(a.color) - hexSaturation(b.color))

  // Fetches another batch of real Colormind colors (anchored to this
  // tab's own hue family — see HUE_ANCHOR_BY_TAB) and appends them to
  // whichever tab is active — every tab can grow this way, not just
  // Fresh Mix. Names are deduped against what's already showing so a
  // repeat click can't add a visible duplicate.
  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const more = await fetchPaletteSwatches(LOAD_MORE_BATCH, HUE_ANCHOR_BY_TAB[activeTab])
      const existingNames = new Set(paletteItems.map((p) => p.name))
      const fresh = more.filter((s) => !existingNames.has(s.name))
      if (fresh.length) {
        setExtraByTab((prev) => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), ...fresh],
        }))
      }
      // A short batch (fewer unique results than asked for) means this
      // tab's family is effectively drained — treat it as exhausted now
      // instead of waiting for a next click that would just come back
      // empty anyway.
      if (fresh.length < LOAD_MORE_BATCH) {
        setExhaustedTabs((prev) => new Set(prev).add(activeTab))
      }
    } finally {
      setLoadingMore(false)
    }
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

      {/* ── Palette grid — same swatch layout/fonts as PalettePage. Every
          tab starts with its full, complete curated set, and "Discover
          More Palettes" below fetches more real Colormind colors and
          appends them, per tab. ── */}
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
