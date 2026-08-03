import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import edt1 from '../../images/edt1.png'
import edt2 from '../../images/edt2.png'
import edt3 from '../../images/edt3.png'
import edt5 from '../../images/edt5.png'
import edt6 from '../../images/edt6.png'
import './EditorialPage.css'

const NAV_ITEMS = ['All', 'Seasonal Edition', 'Editorial', 'Color Theory', 'Inspiration']

export default function EditorialPage() {
  const navigate = useNavigate()
  const [navReady, setNavReady] = useState(false)

  useEffect(() => {
    setNavReady(false)
    const t = setTimeout(() => setNavReady(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleNavClick = (item) => {
    if (item === 'Editorial') return
    navigate('/palette', { state: { tab: item } })
  }

  return (
    <div className="ed-page">
      <nav className={`ed-nav${navReady ? ' ed-nav--ready' : ''}`}>
        {!navReady && <span className="ed-nav-hint">Swipe Left for More!</span>}
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            className={`ed-nav-item${item === 'Editorial' ? ' ed-nav-item--active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <span>{item}</span>
          </button>
        ))}
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
              <img src={edt1} alt="" />
              <img src={edt2} alt="" />
              <img src={edt3} alt="" />
            </div>
            <div className="ed-intro-grid-row">
              <div className="ed-intro-red-block">
                <p>The Science Behind Color Analysis</p>
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
  )
}
