import './AboutUs.css'
import laceImg    from '../../images/lace.png'
import bettyImg   from '../../images/bettyboop.png'
import cloudImg   from '../../images/cloud.png'

export default function AboutUs() {
  return (
    <section className="au" id="about">
      <div className="au-lace" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <img key={i} src={laceImg} alt="" className="au-lace-img" />
        ))}
      </div>
      <div className="au-content">
        <div className="au-text">
          <h2 className="au-heading">meet our designer.</h2>
          <p className="au-role">Designer &amp; Programmer — Kero Group</p>
          <p className="au-desc">
            Hi, I'm Claire. I'm the designer behind KeroColor, the color
            consultancy arm of Kero Group. I believe that color is one of the
            most quietly powerful decisions a brand can make — and I've built
            my practice around helping people make it with intention.
          </p>
          <p className="au-desc">
            Whether you're building a brand from scratch or refining an
            existing identity, I work closely with every client to craft
            palettes that feel personal, cohesive, and built to last. Every
            shade I recommend has a reason behind it.
          </p>
        </div>
        <div className="au-img-wrap">
          <img src={bettyImg} alt="Betty Boop" className="au-betty" />
          <img src={cloudImg} alt="" aria-hidden="true" className="au-cloud" />
        </div>
      </div>
    </section>
  )
}
