import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchLoader from '../components/SearchLoader'
import Footer from '../components/Footer'
import bnd1 from '../../images/bnd1.png'
import bnd2 from '../../images/bnd2.png'
import edp1 from '../../images/edp1.png'
import edp2 from '../../images/edp2.png'
import edp3 from '../../images/edp3.png'
import edt5 from '../../images/edt5.png'
import edt6 from '../../images/edt6.png'
import z10 from '../../images/z10.png'
import z10v2 from '../../images/z10v2.png'
import './EditorialPage.css'

const NAV_ITEMS = ['All', 'Seasonal Edition', 'Editorial', 'Inspiration']

export default function EditorialPage() {
  const navigate = useNavigate()
  const moreRef = useRef(null)
  const galaRef = useRef(null)
  const bndRef = useRef(null)
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [moreVisible, setMoreVisible] = useState(false)
  const [galaVisible, setGalaVisible] = useState(false)
  const [bndVisible, setBndVisible] = useState(false)
  const [bndSwapped, setBndSwapped] = useState(false)

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

  // Fade in the "When the rules become a starting point", Gala grid, and
  // closing image sections as batches once they scroll into view (desktop + mobile).
  useEffect(() => {
    const setters = new Map([
      [moreRef.current, setMoreVisible],
      [galaRef.current, setGalaVisible],
      [bndRef.current, setBndVisible],
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

  const handleNavClick = (item) => {
    if (item === 'Editorial') return
    navigate('/palette', { state: { tab: item } })
  }

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <div className={`ed-page${contentReady ? ' ed-page--revealed' : ' ed-page--hidden'}`}>
      <nav className="ed-nav">
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

      {/* ── Closing image ── */}
      <section ref={bndRef} className={`ed-bnd${bndVisible ? ' ed-fade-in--visible' : ''}`}>
        <p className="ed-bnd-date">July 21, 2026</p>
        <h2 className="ed-intro-heading ed-bnd-city">Z's Mexico City Fan Event Outfit</h2>
        <div
          className={`ed-bnd-imgwrap${bndSwapped ? ' ed-bnd-imgwrap--swapped' : ''}`}
          onClick={() => setBndSwapped(v => !v)}
        >
          <img src={bnd1} alt="" className="ed-bnd-img ed-bnd-img--base" />
          <img src={bnd2} alt="" className="ed-bnd-img ed-bnd-img--alt" />
          <span className="ed-bnd-caption">Close-Up of Z's Audrey Hepburn's Inspired Hairdo</span>
        </div>
        <p className="ed-bnd-credit">Photography by Getty Images</p>

        <div className="ed-intro-text ed-bnd-text">
          <p className="ed-intro-item">The dress Zendaya wore at the Mexico City Spider Man: Brand New Day fan event is Look 26 from Ashi Studio's Spring/Summer 2026 Couture collection, titled "The Beginnings." The designer behind Ashi Studio is Mohammed Ashi, a Saudi couturier and the founder and creative director of the house. The collection was presented during Paris Haute Couture Week in January 2026.</p>
          <p className="ed-intro-item">The Beginnings explores longing, devotion, loss and transformation, drawing heavily from Victorian mourning rituals and historical corsetry. Ashi Studio describes the collection as being concerned with the space between intimacy and dissolution, using distressed materials, unusual embroidery, corsetry and illusion to make clothing feel almost like something psychologically inhabited rather than simply worn.</p>
          <p className="ed-intro-item">The web like detailing is what makes this particular couture look so perfect for Zendaya's Spider Man appearance. The dress incorporates delicate web like knit detailing, antique treated threads, glass tassels and extensive beaded fringe. The embroidery travels across the body and sleeve, while the fringe falls dramatically from the cuffs toward the floor. Fashion coverage specifically noted that the sleeve treatment resembles webs extending from Spider Man's hands, turning an existing couture design into an extremely natural piece of Spider Man method dressing.</p>
          <p className="ed-intro-item">The choice of black also does quiet work color-wise. Black does not compete with skin for attention, it recedes, which lets Zendaya's deep, warm complexion set the visual temperature of the whole look rather than the fabric doing it for her. It is the kind of pairing color analysis would predict: darker, high-contrast neutrals tend to flatter deeper skin tones by sharpening contrast rather than dulling it.</p>
        </div>
      </section>
      <Footer />
    </div>
    </>
  )
}
