import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FullMenu from '../components/FullMenu'
import { generateShadesFromHex, isValidHex, SAMPLE_HEX_CODES } from '../utils/generatePalette'
import { colorNameToHex } from '../utils/colorNames'
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
  // anchorFirst (sent by Seasonal Edition's Discover button) opens the
  // grid on the passed color itself, followed by its shades light to dark.
  const [palette, setPalette] = useState(() => {
    const shades = generateShadesFromHex(initialHex, TOTAL_COUNT)
    if (!location.state?.anchorFirst) return shades
    const i = shades.findIndex((s) => s.color.toLowerCase() === initialHex.toLowerCase())
    return i > 0 ? [shades[i], ...shades.slice(0, i), ...shades.slice(i + 1)] : shades
  })
  const [hexError, setHexError] = useState(false)
  const giantTextRef = useRef(null)
  const hexInputRef = useRef(null)

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
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

  // Takes a hex or a colour name ("burgundy", "sage"). A name keeps
  // what was typed in the bar; a hex is shown as typed too.
  const runSearch = (query) => {
    const hex = isValidHex(query) ? query : colorNameToHex(query)
    if (!hex) {
      setHexError(true)
      return
    }
    setHexError(false)
    setHexInput(query.trim())
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
            placeholder="Search a hex code or colour"
            value={hexInput}
            onChange={(e) => { setHexInput(e.target.value); setHexError(false) }}
            maxLength={30}
            ref={hexInputRef}
          />
          {hexInput && (
            <button
              type="button"
              className="dp-hex-clear"
              aria-label="Clear search"
              onClick={() => { setHexInput(''); setHexError(false); hexInputRef.current?.focus() }}
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="dp-hex-btn">Search</button>
      </form>
      {hexError && <p className="dp-hex-error">Enter a hex code or colour name, like #7c1a2e or burgundy.</p>}

      {/* ── Palette grid — same swatch layout/fonts as PalettePage, the
          searched color swept light -> dark. ── */}
      <div className="pp-palette-grid">
        {palette.map((item) => (
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
