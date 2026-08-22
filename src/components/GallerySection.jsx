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
import bl1  from '../../images/bl1.png'
import g1  from '../../images/g1.jpeg'
import g2  from '../../images/g2.jpeg'
import g3  from '../../images/g3.jpeg'
import g4  from '../../images/g4.jpeg'
import g5  from '../../images/g5.jpeg'
import g6  from '../../images/g6.jpeg'
import g7  from '../../images/g7.jpeg'
import g8  from '../../images/g8.jpeg'
import g9  from '../../images/g9.jpeg'
import g10 from '../../images/g10.jpeg'
import g11 from '../../images/g11.jpeg'
import g12 from '../../images/g12.jpeg'
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

const allSkulls  = [skull1, skull2, skull3, skull4, skull5, skull6, skull11, skull8, skull9, skull10, skull12, skull7]
const allPinks   = [pink1, pink2, pink3, pink4, pink5, pink6, pink11, pink8, pink9, pink10, pink7, pink12]
const allBlues   = [ep1, ep2, ep3, ep4, ep6, ep7, ep8, ep9, ep10, ep11, ep12, bl1]
const allGreens  = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12]

const DEFAULT_COLORS = ['#d7c3c2', '#aa7877', '#9f817f', '#941e1a', '#840f06']
const PINK_COLORS    = ['#feeff5', '#e5d7dd', '#cbbfc4', '#b2a7ac', '#988f93']
const BLUE_COLORS    = ['#15294d', '#2c3e5f', '#445471', '#5b6982', '#737f94']
const GREEN_COLORS   = ['#35443d', '#495750', '#5d6964', '#727c77', '#868f8b']

function getCircleColors(searchResult) {
  if (searchResult?.colorFamily === 'pink')  return PINK_COLORS
  if (searchResult?.colorFamily === 'blue')  return BLUE_COLORS
  if (searchResult?.colorFamily === 'green') return GREEN_COLORS
  return DEFAULT_COLORS
}

function getGridImages(searchResult) {
  if (searchResult?.colorFamily === 'pink')  return allPinks
  if (searchResult?.colorFamily === 'blue')  return allBlues
  if (searchResult?.colorFamily === 'green') return allGreens
  return allSkulls
}

const VISIBLE_DESKTOP = 6
const VISIBLE_MOBILE  = 2
const GAP_DESKTOP     = 18
const GAP_MOBILE      = 8

const COLOR_FAMILIES = ['red', 'pink', 'blue', 'green']

export default function GallerySection({ searchResult, onColorChange }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  )
  const [itemWidth, setItemWidth] = useState(0)
  const viewportRef = useRef(null)

  const [activeCircleIdx, setActiveCircleIdx] = useState(null)
  const [activeHex, setActiveHex] = useState('')

  const currentFamily = searchResult?.colorFamily || 'red'
  const familyIdx = COLOR_FAMILIES.indexOf(currentFamily)

  function cycleColor(dir) {
    const next = COLOR_FAMILIES[familyIdx + dir]
    if (next) onColorChange?.(next)
  }

  const circleColors = getCircleColors(searchResult)
  const gridImages   = getGridImages(searchResult)

  const GAP      = isMobile ? GAP_MOBILE : GAP_DESKTOP
  const VISIBLE  = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP
  const maxSlide = Math.max(0, gridImages.length - VISIBLE)

  const indexedImages = gridImages.map((src, i) => ({ src, i }))
  // Full strip always renders (both mobile and desktop) and the track
  // slides via transform — desktop just moves a bigger step (VISIBLE_DESKTOP
  // items) per click instead of one, same sliding animation either way.
  const displayImages = indexedImages

  // Compute item width from actual rendered rect (mobile slide distance)
  useEffect(() => {
    const compute = () => {
      if (!viewportRef.current) return
      const rect = viewportRef.current.querySelector('.gallery-rect')
      if (rect) {
        setItemWidth(rect.offsetWidth)
      } else {
        const vw = viewportRef.current.clientWidth
        setItemWidth((vw - (VISIBLE - 1) * GAP) / VISIBLE)
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
            style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
          >
            {displayImages.map(({ src, i }) => (
              <div key={i} className="gallery-rect" data-idx={i}>
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

        <div className="gallery-circles-row">
          <button
            className="gallery-color-arrow"
            onClick={() => cycleColor(-1)}
            disabled={familyIdx <= 0}
            aria-label="Previous color"
          >
            <svg width="23" height="23" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0L4.73232 6.45304C4.28525 6.81984 4 7.37663 4 8C4 8.62336 4.28524 9.18015 4.73232 9.54696L12 16L8 8L12 0Z" />
            </svg>
          </button>

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

          <button
            className="gallery-color-arrow"
            onClick={() => cycleColor(1)}
            disabled={familyIdx >= COLOR_FAMILIES.length - 1}
            aria-label="Next color"
          >
            <svg width="23" height="23" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation" style={{ transform: 'rotate(180deg)' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0L4.73232 6.45304C4.28525 6.81984 4 7.37663 4 8C4 8.62336 4.28524 9.18015 4.73232 9.54696L12 16L8 8L12 0Z" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  )
}
