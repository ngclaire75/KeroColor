import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { getLenis } from '../lenis'
import { generateShadesFromHex, isValidHex, SAMPLE_HEX_CODES } from '../utils/generatePalette'
import bearImg from '../../images/bear.webp'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// and footer are pixel-for-pixel consistent with PalettePage.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

// 4 rows worth at the grid's 3-column desktop layout — too many close
// light->dark steps of the same hex read as near-duplicate swatches.
const TOTAL_COUNT = 12
const DEFAULT_HEX = '#4d0c12' // same red as the hamburger menu overlay background

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
  const initialHex = isValidHex(location.state?.hex || '') ? location.state.hex : DEFAULT_HEX
  const [fullMenuOpen, setFullMenuOpen] = useState(false)
  const [hexInput, setHexInput] = useState(initialHex)
  const [palette, setPalette] = useState(() => generateShadesFromHex(initialHex, TOTAL_COUNT))
  const [hexError, setHexError] = useState(false)
  const giantTextRef = useRef(null)

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default). Resets Lenis's own scroll state too, not just
  // the native one — Lenis drives scrolling itself, so without this it
  // can animate back toward wherever it still thinks the page is.
  useEffect(() => {
    window.scrollTo(0, 0)
    getLenis()?.scrollTo(0, { immediate: true })
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

  const runSearch = (hex) => {
    if (!isValidHex(hex)) {
      setHexError(true)
      return
    }
    setHexError(false)
    setHexInput(hex)
    setPalette(generateShadesFromHex(hex, TOTAL_COUNT))
  }

  const handleHexSearch = (e) => {
    e.preventDefault()
    runSearch(hexInput)
  }

  // Hamburger menu items are hex codes, not category names — picking one
  // opens that color's own light -> dark grid, same as typing it in.
  const handleMenuItemClick = (hex) => {
    setFullMenuOpen(false)
    runSearch(hex)
  }

  return (
    <div className="pp-page">
      {/* Capped at 9 — FullMenu's own entrance animation only staggers
          up to 9 rows (see .fm-item:nth-child in FullMenu.css). */}
      <FullMenu open={fullMenuOpen} onClose={() => setFullMenuOpen(false)} items={SAMPLE_HEX_CODES} onItemClick={handleMenuItemClick} />

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
          <div className="pp-nav-brand">
            <Link to="/" className="pp-nav-brand-text-link">
              <span className="pp-nav-brand-text">KEROCOLOR</span>
            </Link>
            {/* Back to the All tab on Color Palette, not home — this page
                is reached from there, so the bear leads back to it. */}
            <Link to="/palette" state={{ tab: 'All' }}>
              <img loading="lazy" src={bearImg} alt="KeroColor" className="pp-nav-brand-img" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hex search — the only way to choose what's shown below now.
          Type a color and see it swept light -> dark; the hamburger menu
          (9 sample hex codes) is the other way in. ── */}
      <form className="dp-hex-search" onSubmit={handleHexSearch}>
        {/* Wrapper exists for mobile only (see .dp-hex-input-wrap) — it's
            what actually participates in the row's flex layout there,
            clipping the input's own compensating scale-up/scale-down
            trick (same technique as ContactSection's fields) so the
            visible size/placement never changes while its real
            font-size stays >=16px, which is what stops the browser's
            zoom-on-focus. */}
        <div className="dp-hex-input-wrap">
          <input
            type="text"
            className="dp-hex-input"
            placeholder="Search a hex code, e.g. #7c1a2e"
            value={hexInput}
            onChange={(e) => { setHexInput(e.target.value); setHexError(false) }}
            maxLength={7}
          />
        </div>
        <button type="submit" className="dp-hex-btn">Search</button>
      </form>
      {hexError && <p className="dp-hex-error">Enter a valid hex code, like #7c1a2e or #b06.</p>}

      {/* ── Palette grid — same swatch layout/fonts as PalettePage, the
          searched color swept light -> dark. ── */}
      <div className="pp-palette-grid">
        {palette.map((item) => (
          <div key={item.color} className="pp-palette-item">
            <div className="pp-palette-swatch" style={{ background: item.color }} />
            <div className="pp-palette-text">
              {/* Just the hex now — name/desc removed, sized to match
                  where .pp-palette-name used to read (see .dp-hex-big
                  in DiscoverPalettesPage.css). */}
              <p className="pp-palette-hex dp-hex-big">{item.color}</p>
            </div>
          </div>
        ))}
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
