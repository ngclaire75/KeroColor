import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSearch } from '../SearchContext'
import explore1 from '../../images/explore1.jpeg'
import explore2 from '../../images/explore2.jpeg'
import explore3 from '../../images/explore3.jpeg'
import explorepink1 from '../../images/explorepink1.jpeg'
import explorepink2 from '../../images/explorepink2.jpeg'
import explorepink3 from '../../images/explorepink3.jpeg'
import SkullPandaSection from '../components/SkullPandaSection'
import GallerySection from '../components/GallerySection'
import NextSection from '../components/NextSection'
import Footer from '../components/Footer'
import './ExplorePage.css'

function getExploreImages(searchResult) {
  if (searchResult?.colorFamily === 'pink') return [explorepink2, explorepink1, explorepink3]
  return [explore1, explore2, explore3]
}

function getThemeClass(searchResult) {
  if (!searchResult?.colorFamily) return ''
  if (searchResult.colorFamily === 'pink') return 'theme-pink'
  return ''
}

export default function ExplorePage() {
  const wonderlandRef = useRef(null)
  const { searchResult, setSearchResult } = useSearch()

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

  const themeClass = getThemeClass(searchResult)
  const [img1, img2, img3] = getExploreImages(searchResult)

  return (
    <div className={`explore-page${themeClass ? ' ' + themeClass : ''}`}>
      {/* First section — full screen WONDERLAND */}
      <div className="explore-hero">
        <nav className="explore-nav">
          <Link to="/" className="explore-nav-link">home</Link>
          <a href="#" className="explore-nav-link">color palette</a>
          <a href="#" className="explore-nav-link">color analyzer</a>
        </nav>
        <div className="explore-main">
          <div className="explore-left-group">
            <img src={img2} alt="" className="explore-img--left" />
            <span className="explore-embrace">EMBRACE</span>
          </div>
          <img src={img1} alt="" className="explore-img explore-img--center" />
          <img src={img3} alt="" className="explore-img explore-img--right" />
          <div className="explore-labels">
            <span>NEW IN</span>
            <span>/PALETTE - 25/</span>
            <span>WHEN COLOR SPEAKS</span>
          </div>
          <p ref={wonderlandRef} className="explore-wonderland">FLUORESCENT</p>
        </div>
      </div>

      {/* Second section — search */}
      <SkullPandaSection onSearch={setSearchResult} />

      {/* Third section — gallery grid */}
      <GallerySection searchResult={searchResult} />

      {/* Fourth section — 3x3 card grid */}
      <NextSection searchResult={searchResult} />
      <Footer />
    </div>
  )
}
