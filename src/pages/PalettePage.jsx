import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../../images/modena.jpeg'
import lipstickImg from '../../images/lipstick.png'
import vogueImg from '../../images/vogue.png'
import bearImg from '../../images/bear.png'
import './PalettePage.css'

const TABS = ['All', 'Seasonal Palettes', 'Editorial', 'Color Theory', 'Inspiration', 'Archive']
const FILTER_TABS = ['All', 'Nude Illusion', 'Ethereal & Serene', 'Muted & Elegant', 'Mauve Mood', 'Strawberry Matcha']

const DUO_ITEMS = [
  { img: lipstickImg, name: 'Velvet Wine Lipstick', desc: 'Deep sultry red warmth', hexes: ['#742833'] },
  { img: vogueImg, name: 'Vogue Editorial Noir', desc: 'Bold statement glamour', hexes: ['#491319'] },
]

const PALETTE_ITEMS = [
  { color: '#371a16', category: 'Earth Tones', name: 'Deep Mahogany', desc: 'Warm earthy dark tone' },
  { color: '#e9d9ca', category: 'Neutrals',    name: 'Linen Blush',   desc: 'Soft creamy neutral hue' },
  { color: '#221616', category: 'Earth Tones', name: 'Espresso Dark', desc: 'Rich deep brown shade' },
  { color: '#1e100f', category: 'Earth Tones', name: 'Night Rider',   desc: 'Near-black warm charcoal tone' },
  { color: '#30050e', category: 'Jewel Tones', name: 'Aubergine',     desc: 'Deep plum-wine richness' },
  { color: '#4d0c12', category: 'Jewel Tones', name: 'Maroon Oak',    desc: 'Rich brownish red depth' },
]

export default function PalettePage() {
  const [activeTab, setActiveTab] = useState('All')
  const [activeFilter, setActiveFilter] = useState('All')
  const [barOpen, setBarOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [animPaused, setAnimPaused] = useState(false)
  const [brandSplit, setBrandSplit] = useState(50)
  const brandTextRef = useRef(null)
  const brandBgRef = useRef(null)

  useEffect(() => {
    function computeBrandSplit() {
      const textEl = brandTextRef.current
      const bgEl = brandBgRef.current
      if (!textEl || !bgEl) return
      // Measure the real line-box height from font-size × line-height instead of
      // textEl.offsetHeight — the raised <sup>© stretches the inline box taller
      // than the "kerocolor" letters actually are, which threw the split off
      // (and by a different amount at every viewport, since the sup doesn't
      // scale in lockstep with the main text).
      const fontSize = parseFloat(getComputedStyle(textEl).fontSize)
      const textHeight = fontSize * 0.9
      const bgHeight = bgEl.offsetHeight
      if (textHeight === 0) return
      const pct = ((textHeight - bgHeight) / textHeight) * 100
      setBrandSplit(Math.max(0, Math.min(100, pct)))
    }
    computeBrandSplit()
    const ro = new ResizeObserver(computeBrandSplit)
    if (brandTextRef.current) ro.observe(brandTextRef.current)
    if (brandBgRef.current) ro.observe(brandBgRef.current)
    window.addEventListener('resize', computeBrandSplit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', computeBrandSplit)
    }
  }, [])

  return (
    <div className="pp-page">

      {/* ── Announcement bar ── */}
      {barOpen && (
        <div className="pp-bar">
          <button className="pp-bar-playpause" onClick={() => setAnimPaused(p => !p)} aria-label={animPaused ? 'Play' : 'Pause'}>
            {animPaused ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path fill="#fff" d="M4 3.857c0-1.48 1.66-2.364 2.898-1.542l12.273 8.142a1.85 1.85 0 0 1 0 3.086L6.898 21.686C5.659 22.507 4 21.623 4 20.142z"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path fill="#fff" d="M8 3a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-3 0v-15A1.5 1.5 0 0 1 8 3m8 0a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-3 0v-15A1.5 1.5 0 0 1 16 3"/>
              </svg>
            )}
          </button>
          <div className={`pp-bar-texts${animPaused ? ' pp-bar-texts--paused' : ''}`}>
            <span className="pp-bar-text pp-bar-text--1">Discover the new <span className="pp-bar-underline">Kerocolor Chromatic Series.</span></span>
            <span className="pp-bar-text pp-bar-text--2">Have a Look at Our <span className="pp-bar-underline">Color Analyzer</span><span className="pp-bar-text-tail"> to Unlock Your True Colors</span></span>
          </div>
          <button className="pp-bar-close" onClick={() => setBarOpen(false)} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="pp-nav">
        <div className="pp-nav-left">
          <button className="pp-nav-action">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect width="17" height="1.3" rx="0.65" fill="#111"/>
              <rect y="5.35" width="17" height="1.3" rx="0.65" fill="#111"/>
              <rect y="10.7" width="17" height="1.3" rx="0.65" fill="#111"/>
            </svg>
            <span>Menu</span>
          </button>
          <button className="pp-nav-action">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="#111" strokeWidth="1.3"/>
              <path d="M10.5 10.5L13.5 13.5" stroke="#111" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span>Search</span>
          </button>
        </div>

        <div className="pp-nav-center">
          <Link to="/" className="pp-nav-brand">
            <span className="pp-nav-brand-text">KEROCOLOR</span>
            <img src={bearImg} alt="KeroColor" className="pp-nav-brand-img" />
          </Link>
        </div>

        <div className="pp-nav-right">
          <button className="pp-nav-action pp-nav-icon-only">
            <svg width="19" height="17" viewBox="0 0 24 22" fill="none">
              <path d="M12 20.5C12 20.5 2 13.2 2 7.5C2 4.46 4.46 2 7.5 2C9.28 2 10.91 2.84 12 4.17C13.09 2.84 14.72 2 16.5 2C19.54 2 22 4.46 22 7.5C22 13.2 12 20.5 12 20.5Z" stroke="#111" strokeWidth="1.4"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Hero content ── */}
      <header className="pp-hero">
        <p className="pp-hero-sub">The KeroColor Studio</p>
        <h1 className="pp-hero-title">Color Palettes</h1>
      </header>

      {/* ── Tabs (desktop) ── */}
      <div className="pp-tabs-wrap">
        <div className="pp-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`pp-tab${activeTab === tab ? ' pp-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
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
        {menuOpen && (
          <div className="pp-menu-list">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`pp-menu-item${activeTab === tab ? ' pp-menu-item--active' : ''}`}
                onClick={() => { setActiveTab(tab); setMenuOpen(false) }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Feature image ── */}
      <div className="pp-feature">
        <img src={heroImg} alt="" className="pp-feature-img" />
      </div>

      {/* ── Featured content ── */}
      <div className="pp-featured">
        <p className="pp-featured-label">- Showcase</p>
        <h2 className="pp-featured-title">The Language of<br className="pp-featured-title-break" /> Natural Color</h2>
        <p className="pp-featured-date">{new Date().getFullYear()}</p>
      </div>

      <div className="pp-separator" />

      {/* ── Filter tabs ── */}
      <div className="pp-filters">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            className={`pp-filter${activeFilter === tab ? ' pp-filter--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Palette grid ── */}
      <div className="pp-palette-grid">
        {PALETTE_ITEMS.map((item) => (
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

      {/* ── Duo grid ── */}
      <div className="pp-duo-grid">

        {DUO_ITEMS.map((item) => (
          <div key={item.name} className="pp-palette-item">
            <div className="pp-duo-swatch">
              <img src={item.img} alt={item.name} className="pp-duo-img" />
            </div>
            <div className="pp-duo-text">
              <p className="pp-palette-desc">{item.desc}</p>
              <h3 className="pp-palette-name">{item.name}</h3>
              {item.hexes && item.hexes.map(hex => (
                <p key={hex} className="pp-palette-hex">{hex}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Discover more button ── */}
      <div className="pp-discover-wrap">
        <button className="pp-discover-btn">Discover More Palettes</button>
      </div>

      {/* ── Brand outro — text auto-detects the black background and switches to white ── */}
      <div className="pp-brand-outro">
        <div className="pp-brand-outro-bg" ref={brandBgRef} />
        <div className="pp-brand-outro-wrap">
          <span
            className="pp-brand-outro-text"
            ref={brandTextRef}
            style={{ '--split': `${brandSplit}%` }}
          >
            kerocolor<sup className="pp-brand-outro-copyright">&copy;</sup>
          </span>
        </div>
      </div>

    </div>
  )
}
