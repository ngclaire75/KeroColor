import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSearch } from '../SearchContext'
import explore1 from '../../images/explore1.webp'
import explore2 from '../../images/explore2.webp'
import explore3 from '../../images/explore3.webp'
import explorepink1 from '../../images/explorepink1.webp'
import explorepink2 from '../../images/explorepink2.webp'
import explorepink3 from '../../images/explorepink3.webp'
import exploreblue1 from '../../images/exploreblue1.webp'
import exploreblue2 from '../../images/exploreblue2.webp'
import exploreblue3 from '../../images/exploreblue3.webp'
import mod1 from '../../images/mod1.webp'
import mod2 from '../../images/mod2.webp'
import mod3 from '../../images/mod3.webp'
import GallerySection from '../components/GallerySection'
import NextSection from '../components/NextSection'
import Footer from '../components/Footer'
import './ExplorePage.css'

function getExploreImages(searchResult) {
  if (searchResult?.colorFamily === 'pink')  return [explorepink2, explorepink1, explorepink3]
  if (searchResult?.colorFamily === 'blue')  return [exploreblue1, exploreblue2, exploreblue3]
  if (searchResult?.colorFamily === 'green') return [mod1, mod2, mod3]
  return [explore1, explore2, explore3]
}

function getThemeClass(searchResult) {
  if (!searchResult?.colorFamily) return ''
  if (searchResult.colorFamily === 'pink')  return 'theme-pink'
  if (searchResult.colorFamily === 'blue')  return 'theme-blue'
  if (searchResult.colorFamily === 'green') return 'theme-green'
  return ''
}

export default function ExplorePage() {
  const wonderlandRef = useRef(null)
  const { searchResult, setSearchResult } = useSearch()

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
          <Link to="/#about" className="explore-nav-link">about us</Link>
          <Link to="/palette" className="explore-nav-link">color palette</Link>
          <Link to="/explore" className="explore-nav-link">explore</Link>
          <Link to="/#faq" className="explore-nav-link">faq</Link>
          <Link to="/#contact" className="explore-nav-link">contact</Link>
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

      {/* Third section — gallery grid */}
      <GallerySection
        searchResult={searchResult}
        onColorChange={(family) => setSearchResult({ query: family, valid: true, colorFamily: family })}
      />

      {/* Fourth section — 3x3 card grid */}
      <NextSection searchResult={searchResult} />
      <Footer />
    </div>
  )
}
