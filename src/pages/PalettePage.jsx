import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import SearchLoader from '../components/SearchLoader'
import FullMenu from '../components/FullMenu'
import { fetchPaletteNames, FALLBACK_NAMES } from '../utils/paletteNames'
import heroImg from '../../images/fire.jpg'
import springImg from '../../images/spr.jpg'
import lipstickImg from '../../images/girlofmydreams.jpg'
import vogueImg from '../../images/vogue.jpg'
import deerImg from '../../images/deer.jpg'
import petalImg from '../../images/petal.jpg'
import bearImg from '../../images/bear.png'
import './PalettePage.css'

const TABS = ['All', 'Seasonal Edition', 'Editorial', 'Inspiration']

const DUO_ITEMS = [
  { img: lipstickImg, name: 'Velvet Keepsake', desc: 'A heart kept safe in ruby velvet', hexes: ['#742833'] },
  { img: vogueImg, name: 'Neon Nocturne', desc: 'The city hums beneath amber light', hexes: ['#491319'] },
]

const SEASONAL_DUO_ITEMS = [
  { img: deerImg, name: 'Matcha Daydream', desc: 'Sweetness steeped in a quiet afternoon', hexes: ['#A9805E'] },
  { img: petalImg, name: 'Lace & Latte', desc: 'Soft indulgence, savored slow', hexes: ['#E7B8C2'] },
]

const SEASONAL_PALETTE_ITEMS = [
  { color: '#484537', category: 'Spring Blossom', name: 'Forest Umber', desc: 'Deep mossy woodland shadow' },
  { color: '#908A6E', category: 'Spring Blossom', name: 'Sage Khaki',   desc: 'Muted olive garden green' },
  { color: '#C4B5A6', category: 'Spring Blossom', name: 'Warm Taupe',  desc: 'Soft sunlit meadow beige' },
  { color: '#B78989', category: 'Spring Blossom', name: 'Dusty Rose',  desc: 'Faded blossom petal pink' },
  { color: '#CFADAB', category: 'Spring Blossom', name: 'Blush Petal', desc: 'Delicate pale cherry blossom' },
  { color: '#B89F9F', category: 'Spring Blossom', name: 'Rosy Mauve',  desc: 'Gentle dusky spring bloom' },
]

const SEASONAL_CONTENT = {
  heroImg: springImg,
  featuredLabel: '- Blossom Reverie',
  featuredTitle: <>Petal Symphony<br className="pp-featured-title-break" /> Secret Sonata</>,
  oxbloodTitle: 'Our Spring Blossom Picks',
  oxbloodDesc: 'A delicate blend of rosy pinks and leafy greens that captures the beauty of spring blossoms and new beginnings.',
  paletteItems: SEASONAL_PALETTE_ITEMS,
  duoItems: SEASONAL_DUO_ITEMS,
}

const DEFAULT_CONTENT = {
  heroImg,
  featuredLabel: '- Rouge de Rêve',
  featuredTitle: <>The Language of<br className="pp-featured-title-break" /> Natural Color</>,
  oxbloodTitle: 'Our Oxblood Picks',
  oxbloodDesc: 'Meet our Oxblood color palette - a curated collection of deep, velvety shades that redefine classic elegance.',
  paletteItems: null,
  duoItems: DUO_ITEMS,
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

const PALETTE_ITEMS = [
  { color: '#371a16', category: 'Earth Tones', name: 'Deep Mahogany', desc: 'Warm earthy dark tone' },
  { color: '#e9d9ca', category: 'Neutrals',    name: 'Linen Blush',   desc: 'Soft creamy neutral hue' },
  { color: '#221616', category: 'Earth Tones', name: 'Espresso Dark', desc: 'Rich deep brown shade' },
  { color: '#1e100f', category: 'Earth Tones', name: 'Night Rider',   desc: 'Near-black warm charcoal tone' },
  { color: '#30050e', category: 'Jewel Tones', name: 'Aubergine',     desc: 'Deep plum-wine richness' },
  { color: '#4d0c12', category: 'Jewel Tones', name: 'Maroon Oak',    desc: 'Rich brownish red depth' },
]

export default function PalettePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'All')
  const [barOpen, setBarOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [fullMenuOpen, setFullMenuOpen] = useState(false)
  const [paletteNames, setPaletteNames] = useState(FALLBACK_NAMES.slice(0, 9))
  const [animPaused, setAnimPaused] = useState(false)
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

  // Flashlight hover effect on the giant footer "kero." text — tracks the
  // cursor via CSS custom properties so the spotlight overlay's radial-gradient
  // mask can follow it without triggering a React re-render per mousemove.
  // Tracked globally (not just while the cursor is over the text) so the
  // spotlight is already correctly positioned the moment the cursor enters
  // the text, rather than snapping from a stale last-known position.
  // Visibility itself still fades in/out purely via CSS :hover on the text.
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

  const content = activeTab === 'Seasonal Edition' ? SEASONAL_CONTENT : DEFAULT_CONTENT
  const paletteItems = content.paletteItems || PALETTE_ITEMS
  const duoItems = content.duoItems

  useEffect(() => {
    if (!menuOpen) return
    const closeOnScroll = () => setMenuOpen(false)
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    return () => window.removeEventListener('scroll', closeOnScroll)
  }, [menuOpen])

  // Fetch real Colormind-generated palette names once, in the background,
  // as soon as the page loads — so by the time the hamburger menu is
  // opened the real names are already in place instead of swapping in
  // after the fallback list has already animated onto screen.
  useEffect(() => {
    let cancelled = false
    fetchPaletteNames(9).then(names => {
      if (!cancelled) setPaletteNames(names)
    })
    return () => { cancelled = true }
  }, [])

  const handleTabClick = (tab) => {
    if (tab === 'Editorial') { navigate('/editorial'); return }
    if (tab === 'Inspiration') { navigate('/inspiration'); return }
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

  return (
    <div className="pp-page">
      <FullMenu open={fullMenuOpen} onClose={() => setFullMenuOpen(false)} items={paletteNames} />

      {tabLoading && <SearchLoader fading={tabLoaderFading} />}

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
            <span className="pp-bar-text pp-bar-text--1">Discover the new <span className="pp-bar-underline">Kerocolor Nude Series.</span></span>
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
        <h1 className="pp-hero-title">Color Palettes</h1>
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

      {/* ── Feature image ── */}
      <div className="pp-feature">
        <img src={content.heroImg} alt="" className={`pp-feature-img${activeTab === 'Seasonal Edition' ? ' pp-feature-img--spring' : ''}`} />
      </div>

      {/* ── Featured content ── */}
      <div className="pp-featured">
        <p className="pp-featured-label">{content.featuredLabel}</p>
        <h2 className="pp-featured-title">{content.featuredTitle}</h2>
        <p className="pp-featured-date">{new Date().getFullYear()}</p>
      </div>

      {/* ── Oxblood promo ── */}
      <div className="pp-oxblood">
        <h2 className="pp-oxblood-title">{content.oxbloodTitle}</h2>
        <p className="pp-oxblood-desc">{content.oxbloodDesc}</p>
      </div>

      {/* ── Palette grid ── */}
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

      {/* ── Duo grid ── */}
      <div className={`pp-duo-grid${activeTab === 'Seasonal Edition' ? ' pp-duo-grid--seasonal' : ''}`}>

        {duoItems.map((item) => (
          <div key={item.name} className="pp-palette-item">
            <div className="pp-duo-swatch">
              <img src={item.img} alt={item.name} className={`pp-duo-img${item.name === 'Musical Daydream' ? ' pp-duo-img-desat' : ''}`} loading="lazy" decoding="async" />
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
        <button className="pp-discover-btn" onClick={() => navigate('/palette/discover')}>Discover More Palettes</button>
      </div>

      {/* ── Footer ── */}
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
