import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { animate } from 'animejs'
import Footer from '../components/Footer'
import { generateShadesFromHex, isValidHex } from '../utils/generatePalette'
import './PalettePage.css'
import './DiscoverPalettesPage.css'

const TOTAL_COUNT = 12
const DEFAULT_HEX = '#4d0c12'

export default function DiscoverPalettesPage() {
  const location = useLocation()
  const initialHex = isValidHex(location.state?.hex || '') ? location.state.hex : DEFAULT_HEX
  const [hexInput, setHexInput] = useState(initialHex)
  const [activeHex, setActiveHex] = useState(initialHex)
  const [palette, setPalette] = useState(() => {
    const shades = generateShadesFromHex(initialHex, TOTAL_COUNT)
    if (!location.state?.anchorFirst) return shades
    const i = shades.findIndex((s) => s.color.toLowerCase() === initialHex.toLowerCase())
    return i > 0 ? [shades[i], ...shades.slice(0, i), ...shades.slice(i + 1)] : shades
  })
  const [hexError, setHexError] = useState(false)
  const pageRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => gsap.from('.dp-reveal', { y: 24, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out' }), pageRef)
    return () => context.revert()
  }, [])

  const handleHexSearch = (e) => {
    e.preventDefault()
    if (!isValidHex(hexInput)) { setHexError(true); return }
    const query = hexInput.trim()
    setHexError(false); setHexInput(query); setActiveHex(query.startsWith('#') ? query : `#${query}`)
    setPalette(generateShadesFromHex(query, TOTAL_COUNT))
  }
  useEffect(() => {
    if (!gridRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animation = animate(gridRef.current.querySelectorAll('.dp-swatch'), { opacity: [0, 1], translateY: [18, 0], delay: (_, i) => i * 35, duration: 500, ease: 'outQuad' })
    return () => animation.cancel()
  }, [palette])


  return (
    <div ref={pageRef} className="pp-page pp-editorial dp-page">
      <nav className="pp-editorial-nav" aria-label="Palette navigation">
        <Link to="/" className="pp-editorial-nav-item"><span>home</span></Link>
        <Link to="/palette" state={{ tab: 'All' }} className="pp-editorial-nav-item"><span>all</span></Link>
        <Link to="/palette" state={{ tab: 'Seasonal Edition' }} className="pp-editorial-nav-item"><span>seasonal edition</span></Link>
        <Link to="/editorial" className="pp-editorial-nav-item"><span>editorial</span></Link>
        <Link to="/inspiration" className="pp-editorial-nav-item"><span>inspiration</span></Link>
      </nav>
      <main>
        <section className="dp-hero" aria-labelledby="dp-title">
          
          <div className="dp-hero-content">
            <div className="dp-hero-top dp-reveal"><span>KEROCOLOR / COLOR STUDY</span><span>AN EXPLORATION IN SHADE</span></div>
            <div className="dp-hero-main dp-reveal">
              <p className="dp-eyebrow">A LITTLE COLOR GOES A LONG WAY</p>
              <h1 id="dp-title">One color.<br /><em>Endless</em> possibilities.</h1>
              <p className="dp-intro">Start with a shade you love. Discover all the colors it can become.</p>
            </div>
          </div>
        </section>
        <section className="dp-workspace" id="shade-collection" aria-labelledby="dp-collection-title">
          <div className="dp-search-heading"><div><p className="dp-section-label">THE COLOR LAB / YOUR STARTING POINT</p><h2 id="dp-collection-title">Find your <em>shade.</em></h2></div></div>
          <form className="dp-search" onSubmit={handleHexSearch}>
            <label htmlFor="dp-hex">YOUR HEX CODE</label>
            <div className="dp-search-row"><span className="dp-current-color" style={{ background: activeHex }} aria-hidden="true" /><input id="dp-hex" value={hexInput} onChange={(e) => { setHexInput(e.target.value); setHexError(false) }} placeholder="#4D0C12" maxLength={7} spellCheck="false" aria-invalid={hexError} aria-describedby={hexError ? 'dp-error' : undefined} /><button type="submit" aria-label="Search color"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></button></div>
            {hexError && <p id="dp-error" className="dp-error" role="alert">Enter a hex code, like #7c1a2e.</p>}
          </form>
          <div className="dp-collection-header"><div><p className="dp-section-label">THE SHADE COLLECTION</p><h3>From light to deep</h3></div><p>12 SHADES / {activeHex.toUpperCase()}</p></div>
          <div ref={gridRef} className="dp-grid">{palette.map((item, index) => <div className="dp-swatch" key={`${item.color}-${index}`}><span className="dp-swatch-color" style={{ backgroundColor: item.color }}><span className="dp-swatch-number">{String(index + 1).padStart(2, '0')}</span></span><span className="dp-swatch-meta"><span><strong>{item.name}</strong><small>{item.desc}</small></span><span className="dp-swatch-hex">{item.color}</span></span></div>)}</div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
