import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { fetchPaletteSwatches } from '../utils/paletteNames'
import bearImg from '../../images/bear.png'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// and footer are pixel-for-pixel consistent with PalettePage. The tab
// selector itself is intentionally different — see DiscoverPalettesPage.css.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

// Converts an HSL color to a hex string — swatches are generated from a
// per-category base hue rather than hand-picked, so every category's
// list can be built already sorted light -> dark by construction instead
// of needing to eyeball/reorder hand-chosen hex values.
function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

// Each category is a base hue/saturation range plus 12 names+descs,
// already ordered light -> dark to match the generated lightness steps —
// this is what keeps every tab's grid reading as one smooth arranged
// progression rather than a random scatter of colors.
const CATEGORIES = [
  {
    tab: 'Warm Terracotta', hue: 18, sat: [42, 68],
    items: [
      ['Sandstone', 'Bleached canyon dust'],
      ['Wheat Clay', 'Sun-dried riverbank'],
      ['Honey Terra', 'Golden clay at midday'],
      ['Sunbaked Ochre', 'Desert spice, warmed through'],
      ['Amber Terra', 'Clay lit from within'],
      ['Toasted Adobe', 'Walls warm from the sun'],
      ['Baked Clay', 'Sun-warmed adobe earth'],
      ['Rustic Copper', 'Weathered metal, quiet glow'],
      ['Burnt Sienna', 'Ember at the edge of ash'],
      ['Umber Root', 'Deep earth after rain'],
      ['Deep Terracotta', 'Kiln-fired and settled'],
      ['Charred Earth', 'Where the fire finally rests'],
    ],
  },
  {
    tab: 'Cool Slate', hue: 200, sat: [10, 22],
    items: [
      ['Glacier Air', 'Thin, clean mountain air'],
      ['Pale Frost', 'First frost on glass'],
      ['Winter Haze', 'Breath in cold light'],
      ['Steel Mist', 'Overcast morning light'],
      ['Quiet Fog', 'Mist rolling off the coast'],
      ['Harbor Mist', 'Boats waiting out the rain'],
      ['Storm Slate', 'Rain over quiet water'],
      ['Rainer Grey', 'A sky that won’t decide'],
      ['Slate Water', 'Still, deep, and cold'],
      ['Shadowed Steel', 'Metal under low cloud'],
      ['Deep Basalt', 'Volcanic rock, cooled'],
      ['Void Slate', 'Where the light runs out'],
    ],
  },
  {
    tab: 'Golden Hour', hue: 38, sat: [70, 92],
    items: [
      ['First Blush', 'The sky just before gold'],
      ['Wheat Light', 'Fields at sundown'],
      ['Honey Ray', 'Light through honey glass'],
      ['Amber Glow', 'Warmth held in glass'],
      ['Marigold Dusk', 'The sun dropping low'],
      ['Sunlit Copper', 'Metal catching last light'],
      ['Ember Gold', 'Coals just past the flame'],
      ['Molten Amber', 'Heat still moving'],
      ['Copper Flame', 'Embers catching wind'],
      ['Rust Horizon', 'Where the light finally rests'],
      ['Burnt Marigold', 'Petals scorched by evening'],
      ['Dusk Ember', 'The last coal of the day'],
    ],
  },
  {
    tab: 'Midnight Bloom', hue: 265, sat: [32, 55],
    items: [
      ['Moon Petal', 'Soft light on pale petals'],
      ['Lilac Haze', 'Perfume on cool air'],
      ['Dusty Orchid', 'A bloom losing its color'],
      ['Twilight Iris', 'Dusk folding into dusk'],
      ['Hushed Violet', 'Quiet before the dark'],
      ['Orchid Shadow', 'A bloom seen by moonlight'],
      ['Velvet Bloom', 'Petals thick with night'],
      ['Plum Eclipse', 'Shadow with a pulse of color'],
      ['Deep Amethyst', 'Stone that holds the dark'],
      ['Shadowed Iris', 'Color barely surfacing'],
      ['Void Violet', 'The hour past midnight'],
      ['Ink Bloom', 'A flower drawn in the dark'],
    ],
  },
  {
    tab: 'Rose Quartz', hue: 345, sat: [28, 48],
    items: [
      ['Whispered Pink', 'Barely there at all'],
      ['Sheer Blush', 'Color caught in light fabric'],
      ['Petal Powder', 'Dust from a spent bloom'],
      ['Rosewater', 'Faint sweetness in the air'],
      ['Dusty Rose', 'Faded blossom petal pink'],
      ['Soft Coral', 'Warmth without the heat'],
      ['Blush Quartz', 'Stone holding onto pink'],
      ['Muted Rosewood', 'Wood grain, softly stained'],
      ['Faded Berry', 'Sweetness gone quiet'],
      ['Deep Rosewood', 'Furniture polished by years'],
      ['Wine Blush', 'A color one glass in'],
      ['Shadowed Rose', 'Pink losing its light'],
    ],
  },
  {
    tab: 'Forest Canopy', hue: 140, sat: [24, 42],
    items: [
      ['Pale Fern', 'New growth, still soft'],
      ['Sage Mist', 'Herb garden after rain'],
      ['Quiet Moss', 'Damp stone, undisturbed'],
      ['Dappled Leaf', 'Light breaking through branches'],
      ['Woodland Green', 'The color of standing still'],
      ['Fern Shade', 'Cool, low, and green'],
      ['Mossy Canopy', 'Where the light barely reaches'],
      ['Evergreen Grove', 'Needles holding their color'],
      ['Deep Pine', 'Forest at its darkest edge'],
      ['Shaded Thicket', 'Undergrowth, dense and dark'],
      ['Forest Shadow', 'The color between the trees'],
      ['Hidden Grove', 'Where the canopy closes over'],
    ],
  },
  {
    tab: 'Desert Bloom', hue: 8, sat: [46, 68],
    items: [
      ['Sunlit Sand', 'Warm underfoot at noon'],
      ['Warm Mesa', 'Rock holding the day’s heat'],
      ['Dune Blush', 'Sand catching evening color'],
      ['Cactus Bloom', 'A flower against the odds'],
      ['Desert Coral', 'Warmth in dry air'],
      ['Sunbaked Rose', 'Petals under a hard sun'],
      ['Wild Salmon', 'Color that survives the heat'],
      ['Arid Bloom', 'Beauty in scarce water'],
      ['Canyon Coral', 'Rock walls at sundown'],
      ['Bloomrose Dusk', 'The last color before dark'],
      ['Deep Terra Rose', 'Earth with a flush of pink'],
      ['Sunset Mesa', 'Where the desert catches fire'],
    ],
  },
  {
    tab: 'Ocean Depth', hue: 205, sat: [48, 70],
    items: [
      ['Pale Tide', 'Foam catching morning light'],
      ['Coastal Air', 'Salt on an open window'],
      ['Shallow Current', 'Water still holding sunlight'],
      ['Tidal Blue', 'The pull of an outgoing tide'],
      ['Ocean Mist', 'Spray off a breaking wave'],
      ['Deep Current', 'Water moving with intent'],
      ['Reef Blue', 'Color just past the shallows'],
      ['Sunken Azure', 'Light fading with depth'],
      ['Abyssal Tide', 'Where the sunlight stops'],
      ['Trench Blue', 'Pressure, cold, and quiet'],
      ['Deep Abyss', 'The color has nowhere left to go'],
      ['Void Depth', 'Past where anything is seen'],
    ],
  },
  {
    tab: 'Nude Series', hue: 28, sat: [26, 42],
    items: [
      ['Sheer Nude', 'Barely a color at all'],
      ['Soft Sand', 'Warmth without weight'],
      ['Warm Beige', 'Linen left in the sun'],
      ['Honey Nude', 'Skin-warm and quiet'],
      ['Buff Blush', 'A hush of warmth'],
      ['Toffee Tan', 'Sun-deepened and even'],
      ['Caramel Nude', 'Rich, warm, unhurried'],
      ['Cinnamon Beige', 'Spice settled into skin'],
      ['Cocoa Nude', 'Deep warmth, softly matte'],
      ['Toasted Umber', 'Bronze fading to earth'],
      ['Deep Cocoa', 'Rich, dark, and warm'],
      ['Espresso Nude', 'The last, darkest warmth'],
    ],
  },
  {
    tab: 'Autumn Harvest', hue: 26, sat: [48, 70],
    items: [
      ['Golden Wheat', 'Fields ready for cutting'],
      ['Pumpkin Spice', 'Warmth in a cool month'],
      ['Maple Amber', 'Sap turning to syrup'],
      ['Harvest Gold', 'The color of a full crop'],
      ['Cinnamon Bark', 'Spice still on the branch'],
      ['Toasted Chestnut', 'Roasted over open coals'],
      ['Burnt Pumpkin', 'A gourd left past its season'],
      ['Autumn Rust', 'Leaves giving up their green'],
      ['Spiced Umber', 'Warm earth, lightly dusted'],
      ['Mahogany Leaf', 'The last color before the drop'],
      ['Bark Brown', 'Rough, dry, and grounded'],
      ['Midnight Harvest', 'The field after the frost'],
    ],
  },
  {
    tab: 'Coastal Breeze', hue: 185, sat: [32, 55],
    items: [
      ['Sea Foam', 'Where the wave just broke'],
      ['Pale Aqua', 'Shallow water over sand'],
      ['Breezy Teal', 'Wind off an open deck'],
      ['Coastal Mist', 'Spray caught in morning light'],
      ['Seaglass', 'Smoothed by years of tide'],
      ['Lagoon Blue', 'Calm water, held in by reef'],
      ['Tidepool Teal', 'Color trapped between the rocks'],
      ['Deep Lagoon', 'Where the shallows finally end'],
      ['Marine Teal', 'A color built for depth'],
      ['Ocean Slate', 'Water under a grey sky'],
      ['Deep Teal', 'Past where the light softens'],
      ['Midnight Marine', 'The sea with the sun long gone'],
    ],
  },
  {
    tab: 'Berry Wine', hue: 350, sat: [42, 65],
    items: [
      ['Blush Berry', 'The first ripening'],
      ['Raspberry Mist', 'Fruit still cool from the vine'],
      ['Cranberry Rose', 'Tart color, softly lit'],
      ['Wine Berry', 'Sweetness with a little bite'],
      ['Merlot Blush', 'A color one sip in'],
      ['Deep Cranberry', 'Fruit past its brightest red'],
      ['Burgundy Wine', 'Poured and left to breathe'],
      ['Garnet Berry', 'Stone-dark and glowing'],
      ['Dark Merlot', 'The bottom of the glass'],
      ['Deep Burgundy', 'Color aged in oak'],
      ['Wine Shadow', 'Where the light stops in the glass'],
      ['Midnight Berry', 'The last color of the harvest'],
    ],
  },
]

// Last tab is powered by the live Colormind API instead of a hand-curated
// list — see the fetch in the component below.
const FRESH_MIX_TAB = 'Fresh Mix'
const TABS = [...CATEGORIES.map((c) => c.tab), FRESH_MIX_TAB]

const FRESH_MIX_FALLBACK = [
  { color: '#3a2a2f', name: 'Deep Mahogany', desc: 'A shade freshly drawn' },
  { color: '#7c5b52', name: 'Rich Umber',    desc: 'Color, undiluted' },
  { color: '#b98f7a', name: 'Warm Clay',     desc: 'Straight from the source' },
  { color: '#e3c9b6', name: 'Pale Linen',    desc: 'A tone worth pausing on' },
  { color: '#4a5c52', name: 'Deep Sage',     desc: 'Unmixed and exact' },
  { color: '#8fae9c', name: 'Soft Sage',     desc: 'A color in its own right' },
]

// Built once at module load, not per-render — the palette lists never
// change, only which tab/how many of each are currently shown.
const PALETTES = Object.fromEntries(
  CATEGORIES.map(({ tab, hue, sat, items }) => {
    const n = items.length
    const list = items.map(([name, desc], i) => {
      const l = 82 - i * (68 / (n - 1)) // lightness: light -> dark across the set
      const s = sat[0] + (sat[1] - sat[0]) * (i / (n - 1))
      return { color: hslToHex(hue, s, l), name, desc }
    })
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
    fetchPaletteSwatches(12).then((swatches) => {
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
  const paletteItems = [...baseItems, ...(extraByTab[activeTab] || [])]

  // Fetches another batch of real Colormind colors and appends them to
  // whichever tab is active — every tab can grow this way, not just
  // Fresh Mix. Names are deduped against what's already showing so a
  // repeat click can't add a visible duplicate.
  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const more = await fetchPaletteSwatches(6)
      const existingNames = new Set(paletteItems.map((p) => p.name))
      const fresh = more.filter((s) => !existingNames.has(s.name))
      if (fresh.length) {
        setExtraByTab((prev) => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), ...fresh],
        }))
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

      <div className="pp-discover-wrap">
        <button className="pp-discover-btn" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Discover More Palettes'}
        </button>
      </div>

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
