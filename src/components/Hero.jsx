import './Hero.css'
import { Link } from 'react-router-dom'
import cakeImg   from '../../images/model2.webp'
import drinkImg  from '../../images/model1.webp'
import starImg   from '../../images/star.webp'
import ribbonImg from '../../images/ribbon.webp'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-img">
        <img src={cakeImg} alt="Model" />
      </div>

      <div className="hero-center">
        <img src={starImg}   alt="" className="star star-tl"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-tr"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-mid"    aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-bl"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-br"     aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cl" aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cl2" aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cr" aria-hidden="true" />

        <p className="hero-script">
          color that<br />
          <span>moves </span><span className="you-clip"><span className="animate-you">you</span></span>
        </p>
        <p className="hero-body">
          If you love bold palettes, expressive art, and colors with a story
          to tell. You're in the right place and we're happy to deliver.
        </p>
        <Link to="/palette" className="hero-btn">view palettes now!</Link>
      </div>

      <div className="hero-img">
        <img src={drinkImg} alt="Model" />
      </div>
    </section>
  )
}
