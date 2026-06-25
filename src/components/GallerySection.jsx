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
import './GallerySection.css'

const allSkulls    = [skull1, skull2, skull3, skull4, skull5, skull6, skull11, skull8, skull9, skull10, skull12, skull7]
const circleColors = ['#d7c3c2', '#aa7877', '#9f817f', '#941e1a', '#840f06']

const VISIBLE_DESKTOP = 6
const VISIBLE_MOBILE  = 2
const GAP_DESKTOP     = 18
const GAP_MOBILE      = 8

export default function GallerySection() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  )
  const [itemWidth, setItemWidth] = useState(0)
  const viewportRef = useRef(null)

  const [activeCircleIdx, setActiveCircleIdx] = useState(null)
  const [activeHex, setActiveHex] = useState('')

  const GAP      = isMobile ? GAP_MOBILE : GAP_DESKTOP
  const VISIBLE  = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP
  const maxSlide = allSkulls.length - VISIBLE

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
            {allSkulls.map((src, i) => (
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
