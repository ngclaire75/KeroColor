import './ColorMeaning.css'
import { useEffect, useRef, useState } from 'react'
import textureImg  from '../../images/texture.png'
import frameImg    from '../../images/frame.png'
import redbookImg  from '../../images/redbook.png'
import diamondImg  from '../../images/diamond.png'

const featuresTop = [
  { text: 'Evokes passion, deep desire and romantic intensity' },
  { text: 'Symbolises power, strength and bold authority' },
  { text: 'Commands instant attention wherever it appears' },
]

const featuresBottom = [
  { text: 'Energises the senses and ignites decisive action' },
  { text: 'Radiates warmth, excitement and festive spirit' },
  { text: 'Embodies courage, determination and primal force' },
]

export default function ColorMeaning() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="cm" ref={sectionRef}>

      {/* ── Left panel ── */}
      <div className="cm-left" style={{ backgroundImage: `url(${textureImg})` }}>
<p  className="cm-script">Red</p>
        <h2 className="cm-heading">The Color of Passion,<br />Power &amp; Desire</h2>
        <p  className="cm-body">
          Red is one of the most emotionally charged colors in the spectrum.
          It stirs the senses, signals urgency, and radiates an energy that
          no other hue can replicate. From the blush of romance to the roar
          of revolution — red speaks before words ever can.
        </p>
        <a href="#" className="cm-cta">
          Discover what your colors say &rarr; Explore Color Analyzer
        </a>
      </div>

      {/* ── Right panel ── */}
      <div className="cm-right">

        {/* Top feature row */}
        <div className="cm-features">
          {featuresTop.map((f, i) => (
            <div key={i} className={`cm-feat${visible ? ' cm-feat--visible' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <img src={diamondImg} alt="" className="cm-diamond" aria-hidden="true" />
              <p>{f.text}</p>
            </div>
          ))}
        </div>

        {/* Oval frame */}
        <div className="cm-frame-wrap">
          <img src={redbookImg} alt="" className="cm-redbook" />
          <img src={frameImg}   alt="" className="cm-frame"   />
        </div>

        {/* Bottom feature row */}
        <div className="cm-features">
          {featuresBottom.map((f, i) => (
            <div key={i} className={`cm-feat${visible ? ' cm-feat--visible' : ''}`} style={{ transitionDelay: `${(i + 3) * 0.15}s` }}>
              <img src={diamondImg} alt="" className="cm-diamond" aria-hidden="true" />
              <p>{f.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
