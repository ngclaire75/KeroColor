import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import { generateShadesFromHex, isValidHex } from '../utils/generatePalette'
// Reused wholesale (not just the class names) so the nav, grid, fonts,
// and footer are consistent with PalettePage.
import './PalettePage.css'
import './DiscoverPalettesPage.css'

// 4 rows worth at the grid's 3-column desktop layout — too many close
// light->dark steps of the same hex read as near-duplicate swatches.
const TOTAL_COUNT = 12
const DEFAULT_HEX = '#4d0c12' // same red as the hamburger menu overlay background

export default function DiscoverPalettesPage() {
  const location = useLocation()
  const initialHex = isValidHex(location.state?.hex || '') ? location.state.hex : DEFAULT_HEX
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
  const hexInputRef = useRef(null)

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Hex codes only (#7c1a2e, 7c1a2e or #c12); shown as typed.
  const runSearch = (query) => {
    if (!isValidHex(query)) {
      setHexError(true)
      return
    }
    setHexError(false)
    setHexInput(query.trim())
    setPalette(generateShadesFromHex(query, TOTAL_COUNT))
  }

  const handleHexSearch = (e) => {
    e.preventDefault()
    runSearch(hexInput)
  }

  return (
    <div className="pp-page pp-editorial dp-page">
      <nav className="pp-editorial-nav" aria-label="Palette navigation">
        <Link to="/" className="pp-editorial-nav-item"><span>home</span></Link>
        <Link to="/palette" state={{ tab: 'All' }} className="pp-editorial-nav-item"><span>all</span></Link>
        <Link to="/palette" state={{ tab: 'Seasonal Edition' }} className="pp-editorial-nav-item"><span>seasonal edition</span></Link>
        <Link to="/editorial" className="pp-editorial-nav-item"><span>editorial</span></Link>
        <Link to="/inspiration" className="pp-editorial-nav-item"><span>inspiration</span></Link>
      </nav>

      <h1 className="dp-heading">From one shade to many. Start exploring different shades.</h1>


      {/* Search for a color and display its shades. */}
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
            placeholder="Search a hex code..."
            value={hexInput}
            onChange={(e) => { setHexInput(e.target.value); setHexError(false) }}
            maxLength={7}
            ref={hexInputRef}
          />
          <button type="submit" className="dp-hex-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </form>
      {hexError && <p className="dp-hex-error">Enter a hex code, like #7c1a2e.</p>}

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

      <Footer />

    </div>
  )
}
