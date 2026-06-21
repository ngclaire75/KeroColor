import { useState, useEffect } from 'react'
import skull1 from '../../images/skull1.jpeg'
import skull2 from '../../images/skull2.jpeg'
import skull3 from '../../images/skull3.jpeg'
import skull4 from '../../images/skull4.jpeg'
import skull5 from '../../images/skull5.jpeg'
import skull6 from '../../images/skull6.jpeg'
import skull7 from '../../images/skull7.jpeg'
import skull8 from '../../images/skull8.jpeg'
import skull9 from '../../images/skull9.jpeg'
import skull10 from '../../images/skull10.jpeg'
import skull11 from '../../images/skull11.jpeg'
import skull12 from '../../images/skull12.jpeg'
import './GallerySection.css'

const allSkulls = [skull1, skull2, skull3, skull4, skull5, skull6, skull7, skull8, skull9, skull10, skull11, skull12]
const mobileSkulls = allSkulls.slice(0, 10)
const circleColors = ['#d7c3c2', '#aa7877', '#9f817f', '#941e1a', '#840f06']
const PAGE_SIZE = 5

export default function GallerySection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  )
  const [mobilePage, setMobilePage] = useState(0)
  const [activeCircleIdx, setActiveCircleIdx] = useState(null)
  const [activeHex, setActiveHex] = useState('')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function handleCircleClick(i) {
    if (activeCircleIdx === i) {
      setActiveCircleIdx(null)
      return
    }
    setActiveHex(circleColors[i].toUpperCase())
    setActiveCircleIdx(i)
  }

  function goToPage(page) {
    setMobilePage(page)
    setActiveIdx(0)
  }

  const totalPages = Math.ceil(mobileSkulls.length / PAGE_SIZE)
  const mobileRects = mobileSkulls.slice(mobilePage * PAGE_SIZE, mobilePage * PAGE_SIZE + PAGE_SIZE)
  const rects = isMobile ? mobileRects : allSkulls

  return (
    <section className="gallery-section">
      <div className="gallery-inner">
        <div className={`gallery-rects${!isMobile ? ' gallery-rects--desktop' : ''}`}>
          {rects.map((src, i) => (
            <div
              key={isMobile ? mobilePage * PAGE_SIZE + i : i}
              className={`gallery-rect${activeIdx === i ? ' gallery-rect--active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        {isMobile && (
          <div className="gallery-pagination">
            <button
              className="gallery-page-btn"
              onClick={() => goToPage(mobilePage - 1)}
              disabled={mobilePage === 0}
            >
              previous
            </button>
            <button
              className="gallery-page-btn"
              onClick={() => goToPage(mobilePage + 1)}
              disabled={mobilePage >= totalPages - 1}
            >
              next
            </button>
          </div>
        )}

        {!isMobile && (
          <div className="gallery-pagination gallery-pagination--desktop">
            <button className="gallery-page-btn">previous</button>
            <button className="gallery-page-btn">next</button>
          </div>
        )}

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
