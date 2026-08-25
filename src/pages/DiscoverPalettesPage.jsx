import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchLoader from '../components/SearchLoader'
import FullMenu from '../components/FullMenu'
import { fetchPaletteNames, FALLBACK_NAMES } from '../utils/paletteNames'
import bearImg from '../../images/bear.png'
// Reused wholesale (not just the class names) so this page is pixel-for-
// pixel consistent with PalettePage — same nav, same tab styling, same
// 6-swatch grid, same fonts, same footer.
import './PalettePage.css'

const TABS = ['Warm Terracotta', 'Cool Slate', 'Golden Hour', 'Midnight Bloom']

const PALETTES = {
  'Warm Terracotta': [
    { color: '#8C4A2F', name: 'Baked Clay',    desc: 'Sun-warmed adobe earth' },
    { color: '#B9764B', name: 'Amber Ochre',   desc: 'Toasted desert spice' },
    { color: '#D9A066', name: 'Honey Terra',   desc: 'Golden clay at midday' },
    { color: '#E8C9A0', name: 'Sandstone',     desc: 'Bleached canyon dust' },
    { color: '#6E3524', name: 'Burnt Sienna',  desc: 'Ember at the edge of ash' },
    { color: '#4A2418', name: 'Umber Root',    desc: 'Deep earth after rain' },
  ],
  'Cool Slate': [
    { color: '#2C3539', name: 'Storm Slate',   desc: 'Rain over quiet water' },
    { color: '#4A5C61', name: 'Harbor Fog',    desc: 'Mist rolling off the coast' },
    { color: '#7C93A0', name: 'Steel Mist',    desc: 'Overcast morning light' },
    { color: '#A9BAC2', name: 'Pale Frost',    desc: 'First frost on glass' },
    { color: '#1B2226', name: 'Deep Basalt',   desc: 'Volcanic rock, cooled' },
    { color: '#C9D6DA', name: 'Glacier Air',   desc: 'Thin, clean mountain air' },
  ],
  'Golden Hour': [
    { color: '#F2B441', name: 'Amber Glow',    desc: 'Light through honey glass' },
    { color: '#E8863C', name: 'Marigold Dusk', desc: 'The sun dropping low' },
    { color: '#C4522B', name: 'Copper Flame',  desc: 'Embers catching wind' },
    { color: '#F6D9A0', name: 'Wheat Light',   desc: 'Fields at sundown' },
    { color: '#8A3A1F', name: 'Rust Horizon',  desc: 'Where the light finally rests' },
    { color: '#FCEBC7', name: 'First Blush',   desc: 'The sky just before gold' },
  ],
  'Midnight Bloom': [
    { color: '#1A0F2E', name: 'Void Violet',   desc: 'The hour past midnight' },
    { color: '#3D1E5C', name: 'Orchid Shadow', desc: 'A bloom seen by moonlight' },
    { color: '#6B3FA0', name: 'Twilight Iris', desc: 'Dusk folding into dusk' },
    { color: '#9B72C9', name: 'Lilac Haze',    desc: 'Perfume on cool air' },
    { color: '#2B1547', name: 'Plum Eclipse',  desc: 'Shadow with a pulse of color' },
    { color: '#D8C4EE', name: 'Moon Petal',    desc: 'Soft light on pale petals' },
  ],
}

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [menuOpen, setMenuOpen] = useState(false)
  const [fullMenuOpen, setFullMenuOpen] = useState(false)
  const [paletteNames, setPaletteNames] = useState(FALLBACK_NAMES.slice(0, 9))
  const [tabLoading, setTabLoading] = useState(false)
  const [tabLoaderFading, setTabLoaderFading] = useState(false)
  const tabTimeoutsRef = useRef([])
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

  useEffect(() => {
    if (!menuOpen) return
    const closeOnScroll = () => setMenuOpen(false)
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    return () => window.removeEventListener('scroll', closeOnScroll)
  }, [menuOpen])

  useEffect(() => {
    let cancelled = false
    fetchPaletteNames(9).then(names => {
      if (!cancelled) setPaletteNames(names)
    })
    return () => { cancelled = true }
  }, [])

  // Same brief SearchLoader flash as PalettePage's own tab switch, so
  // moving between palette categories reads consistently across both
  // pages instead of one feeling instant and the other feeling loaded.
  const handleTabClick = (tab) => {
    if (tab === activeTab) return
    tabTimeoutsRef.current.forEach(clearTimeout)
    setTabLoaderFading(false)
    setTabLoading(true)
    const t1 = setTimeout(() => {
      setActiveTab(tab)
      setTabLoaderFading(true)
    }, 900)
    const t2 = setTimeout(() => setTabLoading(false), 1600)
    tabTimeoutsRef.current = [t1, t2]
  }

  const paletteItems = PALETTES[activeTab]

  return (
    <div className="pp-page">
      <FullMenu open={fullMenuOpen} onClose={() => setFullMenuOpen(false)} items={paletteNames} />

      {tabLoading && <SearchLoader fading={tabLoaderFading} />}

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

      {/* ── Hero content ── */}
      <header className="pp-hero">
        <p className="pp-hero-sub">The KeroColor Studio</p>
        <h1 className="pp-hero-title">Discover More Palettes</h1>
      </header>

      {/* ── Tabs (desktop) ── */}
      <div className="pp-tabs-wrap">
        <div className="pp-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`pp-tab${activeTab === tab ? ' pp-tab--active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu dropdown (mobile) ── */}
      <div className="pp-menu-dropdown">
        <button className="pp-menu-toggle" onClick={() => setMenuOpen(o => !o)}>
          <span>Menu</span>
          <svg
            className={`pp-menu-chevron${menuOpen ? ' pp-menu-chevron--open' : ''}`}
            fill="none" viewBox="0 0 24 24" focusable="false" aria-hidden="true"
          >
            <path fill="#000" d="m11.558 16.505.496.495 7.949-8.01v-.987L19.999 8h-.985l-6.967 7.017L4.992 8H4v.987z"></path>
          </svg>
        </button>
        <div className={`pp-menu-list${menuOpen ? ' pp-menu-list--open' : ''}`}>
          <div className="pp-menu-list-inner">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`pp-menu-item${activeTab === tab ? ' pp-menu-item--active' : ''}`}
                onClick={() => { handleTabClick(tab); setMenuOpen(false) }}
              >
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Palette grid — same 6-swatch layout/fonts as PalettePage ── */}
      <div className="pp-palette-grid">
        {paletteItems.map((item) => (
          <div key={item.color} className="pp-palette-item">
            <div className="pp-palette-swatch" style={{ background: item.color }} />
            <div className="pp-palette-text">
              <p className="pp-palette-desc">{item.desc}</p>
              <h3 className="pp-palette-name">{item.name}</h3>
              <p className="pp-palette-hex">{item.color}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Back to Color Palette ── */}
      <div className="pp-discover-wrap">
        <button className="pp-discover-btn" onClick={() => navigate('/palette')}>Back to Color Palette</button>
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
