import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchLoader from '../components/SearchLoader'
import edp1 from '../../images/edp1.png'
import edp2 from '../../images/edp2.png'
import edp3 from '../../images/edp3.png'
import edt5 from '../../images/edt5.png'
import edt6 from '../../images/edt6.png'
import './EditorialPage.css'

const NAV_BATCH_1 = ['All', 'Seasonal Edition', 'Editorial']
const NAV_BATCH_2 = ['Color Theory', 'Inspiration']

export default function EditorialPage() {
  const navigate = useNavigate()
  const navRef = useRef(null)
  const touchStartX = useRef(null)
  const [navReady, setNavReady] = useState(false)
  const [navSwiped, setNavSwiped] = useState(false)
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)

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

  const handleNavClick = (item) => {
    if (item === 'Editorial') return
    navigate('/palette', { state: { tab: item } })
  }

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <div className={`ed-page${contentReady ? ' ed-page--revealed' : ' ed-page--hidden'}`}>
      <nav
        ref={navRef}
        className={`ed-nav${navReady ? ' ed-nav--ready' : ''}${navSwiped ? ' ed-nav--swiped' : ''}`}
        onTouchStart={handleNavTouchStart}
        onTouchEnd={handleNavTouchEnd}
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
        <div className="ed-intro-text">
          <h2 className="ed-intro-heading">A closer look at the facts, myths, and artistry of color analysis.</h2>
          <p className="ed-intro-subheading"><em>Wearing colors outside your palette is wrong.</em></p>

          <div className="ed-intro-columns">
            <div className="ed-intro-column">
              <h3 className="ed-intro-label">The Fact</h3>
              <p className="ed-intro-item">Color analysis is intended as a personal styling guide, not a strict rulebook.</p>
              <p className="ed-intro-item">Wearing colors outside your recommended palette will not necessarily look bad.</p>
              <p className="ed-intro-item">The overall effect depends on many factors, such as the garment's fit, fabric, makeup, hairstyle, and lighting.</p>
            </div>
            <div className="ed-intro-column">
              <h3 className="ed-intro-label">Why?</h3>
              <p className="ed-intro-item">Your recommended palette simply contains shades that are more likely to:</p>
              <ul className="ed-intro-list">
                <li>brighten the complexion,</li>
                <li>reduce the appearance of facial shadows,</li>
                <li>emphasize eye color,</li>
                <li>and create balanced facial contrast.</li>
              </ul>
            </div>
          </div>
        </div>

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

        <p className="ed-intro-footer">Scroll to read more.</p>
      </section>
    </div>
    </>
  )
}
