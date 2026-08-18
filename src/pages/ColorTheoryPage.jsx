import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchLoader from '../components/SearchLoader'
import mia from '../../images/mia.jpeg'
import jia from '../../images/jia.jpeg'
import './ColorTheoryPage.css'

const NAV_BATCH_1 = ['All', 'Seasonal Edition', 'Editorial']
const NAV_BATCH_2 = ['Color Theory', 'Inspiration']

export default function ColorTheoryPage() {
  const navigate = useNavigate()
  const navRef = useRef(null)
  const touchStartX = useRef(null)
  const mouseStartX = useRef(null)
  const wheelDeltaX = useRef(0)
  const wheelCooldown = useRef(false)
  const [navReady, setNavReady] = useState(false)
  const [navSwiped, setNavSwiped] = useState(false)
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const t1 = setTimeout(() => { setOverlayFading(true); setContentReady(true) }, 1700)
    const t2 = setTimeout(() => setOverlayGone(true), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (!overlayGone) return
    setNavReady(false)
    const t = setTimeout(() => setNavReady(true), 2000)
    return () => clearTimeout(t)
  }, [overlayGone])

  const handleNavTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleNavTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (deltaX < -40) setNavSwiped(true)
    else if (deltaX > 40) setNavSwiped(false)
    touchStartX.current = null
  }

  // Mouse-drag swipe (trackpad/mouse click-and-drag), same threshold as touch
  const handleNavMouseDown = (e) => {
    mouseStartX.current = e.clientX
  }

  const handleNavMouseUp = (e) => {
    if (mouseStartX.current === null) return
    const deltaX = e.clientX - mouseStartX.current
    if (deltaX < -40) setNavSwiped(true)
    else if (deltaX > 40) setNavSwiped(false)
    mouseStartX.current = null
  }

  // Two-finger trackpad swipe surfaces as a wheel event with a horizontal
  // deltaX. Accumulate it (a single gesture fires many small wheel events)
  // and use a cooldown so one swipe doesn't flip the batch back and forth.
  const handleNavWheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
    e.preventDefault()
    if (wheelCooldown.current) return
    wheelDeltaX.current += e.deltaX
    if (wheelDeltaX.current > 40) {
      setNavSwiped(true)
    } else if (wheelDeltaX.current < -40) {
      setNavSwiped(false)
    } else {
      return
    }
    wheelDeltaX.current = 0
    wheelCooldown.current = true
    setTimeout(() => { wheelCooldown.current = false }, 500)
  }

  const handleNavClick = (item) => {
    if (item === 'Editorial') { navigate('/editorial'); return }
    if (item === 'Color Theory') return
    navigate('/palette', { state: { tab: item } })
  }

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <div className={`ct-page${contentReady ? ' ct-page--revealed' : ' ct-page--hidden'}`}>
      <nav
        ref={navRef}
        className={`ct-nav${navReady ? ' ct-nav--ready' : ''}${navSwiped ? ' ct-nav--swiped' : ''}`}
        onTouchStart={handleNavTouchStart}
        onTouchEnd={handleNavTouchEnd}
        onMouseDown={handleNavMouseDown}
        onMouseUp={handleNavMouseUp}
        onWheel={handleNavWheel}
      >
        <span className={`ct-nav-hint${navReady || navSwiped ? ' ct-nav-hint--hidden' : overlayGone ? ' ct-nav-hint--playing' : ''}`}>Swipe Left for More!</span>
        <div className="ct-nav-batch ct-nav-batch--1">
          {NAV_BATCH_1.map(item => (
            <button
              key={item}
              className="ct-nav-item"
              onClick={() => handleNavClick(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
        <div className="ct-nav-batch ct-nav-batch--2">
          {NAV_BATCH_2.map(item => (
            <button
              key={item}
              className={`ct-nav-item${item === 'Color Theory' ? ' ct-nav-item--active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Masthead hero ── */}
      <section className="ct-hero">
        <div className="ct-hero-block">
          <h1 className="ct-hero-word">Color</h1>
          <div className="ct-hero-imgbox ct-hero-imgbox--mia">
            <img src={mia} alt="" />
          </div>
          <h1 className="ct-hero-word ct-hero-word--wide">&amp; Theories</h1>
          <div className="ct-hero-imgbox ct-hero-imgbox--jia">
            <img src={jia} alt="" />
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
