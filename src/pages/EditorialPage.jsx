import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchLoader from '../components/SearchLoader'
import edp1 from '../../images/edp1.png'
import edp2 from '../../images/edp2.png'
import edp3 from '../../images/edp3.png'
import edt5 from '../../images/edt5.png'
import edt6 from '../../images/edt6.png'
import z10 from '../../images/z10.png'
import z10v2 from '../../images/z10v2.png'
import './EditorialPage.css'

const NAV_BATCH_1 = ['All', 'Seasonal Edition', 'Editorial']
const NAV_BATCH_2 = ['Color Theory', 'Inspiration']

export default function EditorialPage() {
  const navigate = useNavigate()
  const navRef = useRef(null)
  const touchStartX = useRef(null)
  const mouseStartX = useRef(null)
  const wheelDeltaX = useRef(0)
  const wheelCooldown = useRef(false)
  const moreRef = useRef(null)
  const galaRef = useRef(null)
  const [navReady, setNavReady] = useState(false)
  const [navSwiped, setNavSwiped] = useState(false)
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [moreVisible, setMoreVisible] = useState(false)
  const [galaVisible, setGalaVisible] = useState(false)

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

  // Fade in the "When the rules become a starting point" and Gala grid
  // sections as batches once they scroll into view (desktop + mobile).
  useEffect(() => {
    const setters = new Map([
      [moreRef.current, setMoreVisible],
      [galaRef.current, setGalaVisible],
    ])
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          setters.get(entry.target)?.(true)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.15 }
    )
    setters.forEach((_, el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
    if (item === 'Editorial') return
    navigate('/palette', { state: { tab: item } })
  }

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <div className={`ed-scroll-hint${contentReady ? ' ed-scroll-hint--revealed' : ' ed-scroll-hint--hidden'}`}>
      <span className="ed-scroll-hint-text">Keep<br />Readin'</span>
    </div>
    <div className={`ed-page${contentReady ? ' ed-page--revealed' : ' ed-page--hidden'}`}>
      <nav
        ref={navRef}
        className={`ed-nav${navReady ? ' ed-nav--ready' : ''}${navSwiped ? ' ed-nav--swiped' : ''}`}
        onTouchStart={handleNavTouchStart}
        onTouchEnd={handleNavTouchEnd}
        onMouseDown={handleNavMouseDown}
        onMouseUp={handleNavMouseUp}
        onWheel={handleNavWheel}
      >
        <span className={`ed-nav-hint${navReady || navSwiped ? ' ed-nav-hint--hidden' : overlayGone ? ' ed-nav-hint--playing' : ''}`}>Swipe Left for More!</span>
        <div className="ed-nav-batch ed-nav-batch--1">
          {NAV_BATCH_1.map(item => (
            <button
              key={item}
              className={`ed-nav-item${item === 'Editorial' ? ' ed-nav-item--active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
        <div className="ed-nav-batch ed-nav-batch--2">
          {NAV_BATCH_2.map(item => (
            <button
              key={item}
              className="ed-nav-item"
              onClick={() => handleNavClick(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Intro section ── */}
      <section className="ed-intro">
        <h2 className="ed-intro-heading">A closer look at the facts, myths, and artistry of color analysis.</h2>

        <div className="ed-intro-media">
          <div className="ed-intro-media-big">
            <img src={edt5} alt="" />
          </div>

          <div className="ed-intro-media-col">
            <div className="ed-intro-grid-row ed-intro-grid-row--images">
              <img src={edp1} alt="" />
              <div className="ed-intro-img-zoom">
                <img src={edp2} alt="" />
              </div>
              <img src={edp3} alt="" className="ed-intro-img--edp3" />
            </div>
            <div className="ed-intro-grid-row ed-intro-grid-row--bottom">
              <div className="ed-intro-red-block">
                <p>The Science Behind<br />Color Analysis</p>
              </div>
              <div className="ed-intro-phone-block">
                <img src={edt6} alt="" />
              </div>
            </div>
          </div>
        </div>

        <div className="ed-intro-text">
          <p className="ed-intro-item">It is a common myth that wearing colors outside your palette will look wrong. In fact, color analysis is intended as a personal styling guide rather than a strict rulebook, and stepping outside your recommended shades will not automatically look unflattering. The overall effect depends on far more than color alone, including a garment's fit and fabric, your makeup, hairstyle, and the surrounding lighting.</p>
          <p className="ed-intro-item">Your recommended palette simply contains shades that are more likely to brighten your complexion, soften facial shadows, accentuate your eye color, and create balanced contrast across your face.</p>
        </div>

        <p className="ed-intro-footer">Scroll to read more.</p>
      </section>

      {/* ── "When the rules become a starting point" section ── */}
      <section ref={moreRef} className={`ed-more${moreVisible ? ' ed-fade-in--visible' : ''}`}>
        <h2 className="ed-intro-heading">When the rules<br className="ed-more-break" /> become a starting point</h2>
        <div className="ed-intro-text">
          <p className="ed-intro-item">If color analysis tells us which shades are most naturally harmonious, fashion asks a more interesting question: what happens when we deliberately step outside them? Zendaya offers an especially compelling case study. Her red-carpet wardrobe moves between warm metallics, vivid greens, icy whites, electric blues, silver, black, pink, and red, often within the same few years. Rather than proving that color analysis is useless, these looks demonstrate something more nuanced: a color can be visually successful for reasons that extend beyond whether it belongs to a predetermined seasonal palette.</p>
          <p className="ed-intro-item">It is important to note that Zendaya does not have a scientifically established "official" seasonal classification. Some online color-analysis systems describe her as a Deep Autumn because of her perceived warm coloring and high contrast, but this should be treated as an interpretation rather than an objective fact. What can be observed directly, however, is how differently her appearance responds to color, texture, contrast, lighting, and styling.</p>
          <p className="ed-intro-item">And that is where the artistry begins.</p>
        </div>
      </section>

      {/* ── Gala case-study grid ── */}
      <section ref={galaRef} className={`ed-gala${galaVisible ? ' ed-fade-in--visible' : ''}`}>
        <div className="ed-gala-media">
          <img src={z10v2} alt="" className="ed-gala-img" />
        </div>
        <div className="ed-gala-text">
          <img src={z10} alt="" className="ed-gala-text-bg" />
          <div className="ed-gala-text-overlay" />
          <div className="ed-gala-text-content">
            <h2 className="ed-intro-heading">The 2016 "Manus x Machina: Fashion in an Age of Technology" Gala</h2>
            <p className="ed-gala-body">Zendaya wore a one-shoulder bronze sequined Michael Kors dress, accompanied by a sleek bob and brown-toned smoky eye. Vogue's beauty retrospective specifically notes the bronze dress and coordinated makeup.</p>
            <p className="ed-gala-body">The effect is almost tonal. Bronze reflects light without creating an aggressive temperature contrast against the skin. The shiny surface also changes constantly as she moves, meaning the color is never visually flat.</p>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
