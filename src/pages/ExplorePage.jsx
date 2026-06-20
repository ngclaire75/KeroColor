import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import explore1 from '../../images/explore1.jpeg'
import explore2 from '../../images/explore2.jpeg'
import explore3 from '../../images/explore3.jpeg'
import SkullPandaSection from '../components/SkullPandaSection'
import GallerySection from '../components/GallerySection'
import NextSection from '../components/NextSection'
import './ExplorePage.css'

export default function ExplorePage() {
  const wonderlandRef = useRef(null)

  useEffect(() => {
    const fit = () => {
      const el = wonderlandRef.current
      if (!el) return
      el.style.fontSize = '100px'
      const ratio = window.innerWidth / el.scrollWidth
      const finalSize = 205 * ratio
      el.style.fontSize = finalSize + 'px'
      document.documentElement.style.setProperty('--wonderland-size', finalSize + 'px')
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="explore-page">
      {/* First section — full screen WONDERLAND */}
      <div className="explore-hero">
        <nav className="explore-nav">
          <Link to="/" className="explore-nav-link">home</Link>
          <a href="#" className="explore-nav-link">color palette</a>
          <a href="#" className="explore-nav-link">color analyzer</a>
        </nav>
        <div className="explore-main">
          <div className="explore-left-group">
            <img src={explore2} alt="" className="explore-img--left" />
            <span className="explore-embrace">EMBRACE</span>
          </div>
          <img src={explore1} alt="" className="explore-img explore-img--center" />
          <img src={explore3} alt="" className="explore-img explore-img--right" />
          <div className="explore-labels">
            <span>NEW IN</span>
            <span>/PALETTE - 25/</span>
            <span>WHEN COLOR SPEAKS</span>
          </div>
          <p ref={wonderlandRef} className="explore-wonderland">FLUORESCENT</p>
        </div>
      </div>

      {/* Second section — skull panda 3D */}
      <SkullPandaSection />

      {/* Third section — gallery grid */}
      <GallerySection />

      {/* Fourth section — 3x3 card grid */}
      <NextSection />
    </div>
  )
}
