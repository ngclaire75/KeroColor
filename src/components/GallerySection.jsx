import { useState, useEffect, useRef } from 'react'
import skull1  from '../../images/skull1.jpeg'
import skull2  from '../../images/skull2.jpeg'
import skull3  from '../../images/skull3.jpeg'
import skull4  from '../../images/skull4.jpeg'
import skull5  from '../../images/skull5.jpeg'
import skull6  from '../../images/skull6.jpeg'
import skull7  from '../../images/skull7.jpeg'
import skull8  from '../../images/skull8.jpeg'
import skull9  from '../../images/skull9.jpeg'
import skull10 from '../../images/skull10.jpeg'
import skull11 from '../../images/skull11.jpeg'
import skull12 from '../../images/skull12.jpeg'
import ep1  from '../../images/ep1.jpeg'
import ep2  from '../../images/ep2.jpeg'
import ep3  from '../../images/ep3.jpeg'
import ep4  from '../../images/ep4.jpeg'
import ep6  from '../../images/ep6.jpeg'
import ep7  from '../../images/ep7.jpeg'
import ep8  from '../../images/ep8.jpeg'
import ep9  from '../../images/ep9.jpeg'
import ep10 from '../../images/ep10.jpeg'
import ep11 from '../../images/ep11.jpeg'
import ep12 from '../../images/ep12.jpeg'
import pink1   from '../../images/pink1.jpeg'
import pink2   from '../../images/pink2.jpeg'
import pink3   from '../../images/pink3.jpeg'
import pink4   from '../../images/pink4.jpeg'
import pink5   from '../../images/pink5.jpeg'
import pink6   from '../../images/pink6.jpeg'
import pink7   from '../../images/pink7.jpeg'
import pink8   from '../../images/pink8.jpeg'
import pink9   from '../../images/pink9.jpeg'
import pink10  from '../../images/pink10.jpeg'
import pink11  from '../../images/pink11.jpeg'
import pink12  from '../../images/pink12.jpeg'
import './GallerySection.css'

const allSkulls = [skull1, skull2, skull3, skull4, skull5, skull6, skull11, skull8, skull9, skull10, skull12, skull7]
const allPinks  = [pink1, pink2, pink3, pink4, pink5, pink6, pink7, pink8, pink9, pink10, pink11, pink12]
const allBlues  = [ep1, ep2, ep3, ep4, ep6, ep7, ep8, ep9, ep10, ep11, ep12]

const DEFAULT_COLORS = ['#d7c3c2', '#aa7877', '#9f817f', '#941e1a', '#840f06']
const PINK_COLORS    = ['#feeff5', '#e5d7dd', '#cbbfc4', '#b2a7ac', '#988f93']
const BLUE_COLORS    = ['#15294d', '#2c3e5f', '#445471', '#5b6982', '#737f94']

function getCircleColors(searchResult) {
  if (searchResult?.colorFamily === 'pink') return PINK_COLORS
  if (searchResult?.colorFamily === 'blue') return BLUE_COLORS
  return DEFAULT_COLORS
}

function getGridImages(searchResult) {
  if (searchResult?.colorFamily === 'pink') return allPinks
  if (searchResult?.colorFamily === 'blue') return allBlues
  return allSkulls
}

const VISIBLE_DESKTOP = 6
const VISIBLE_MOBILE  = 2
const GAP_DESKTOP     = 18
const GAP_MOBILE      = 8

export default function GallerySection({ searchResult }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  )
  const [itemWidth, setItemWidth] = useState(0)
  const viewportRef = useRef(null)

  const [activeCircleIdx, setActiveCircleIdx] = useState(null)
  const [activeHex, setActiveHex] = useState('')
  const circleColors = getCircleColors(searchResult)
  const gridImages   = getGridImages(searchResult)

  const GAP      = isMobile ? GAP_MOBILE : GAP_DESKTOP
  const VISIBLE  = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP
  const maxSlide = gridImages.length - VISIBLE

  // Compute item width from actual rendered rect
  useEffect(() => {
    const compute = () => {
      if (!viewportRef.current) return
      const rect = viewportRef.current.querySelector('.gallery-rect')
      if (rect) {
        setItemWidth(rect.offsetWidth)
      } else {
        const vw = viewportRef.current.clientWidth
        const g  = isMobile ? GAP_MOBILE : GAP_DESKTOP
        const v  = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP
        setItemWidth((vw - (v - 1) * g) / v)
      }
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [isMobile])

  // Reset slide on layout switch
  useEffect(() => { setSlideIndex(0) }, [isMobile])

  const slideNext = () => setSlideIndex(i => Math.min(i + 1, maxSlide))
  const slidePrev = () => setSlideIndex(i => Math.max(i - 1, 0))

  function handleCircleClick(i) {
    if (activeCircleIdx === i) { setActiveCircleIdx(null); return }
    setActiveHex(circleColors[i].toUpperCase())
    setActiveCircleIdx(i)
  }

  const translateX = -(slideIndex * (itemWidth + GAP))

  return (
    <section className="gallery-section">
      <div className="gallery-inner">

        <div className="gallery-rects" ref={viewportRef}>
          <div
            className="gallery-rects-track"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {gridImages.map((src, i) => (
              <div key={i} className="gallery-rect">
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="gallery-pagination">
          <button className="gallery-page-btn" onClick={slidePrev} disabled={slideIndex === 0}>
            previous
          </button>
          <button className="gallery-page-btn" onClick={slideNext} disabled={slideIndex >= maxSlide}>
            next
          </button>
        </div>

        <div className="gallery-circles">
          {circleColors.map((color, i) => (
            <div
              key={i}
              className={`gallery-circle-wrap${activeCircleIdx === i ? ' gallery-circle-wrap--active' : ''}`}
              onClick={() => handleCircleClick(i)}
            >
              <div className="gallery-circle" style={{ background: color }} />
              <span className="gallery-circle-hex">{activeHex}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
