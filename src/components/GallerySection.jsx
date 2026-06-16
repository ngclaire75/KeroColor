import { useState } from 'react'
import skull1 from '../../images/skull1.jpeg'
import skull2 from '../../images/skull2.jpeg'
import skull3 from '../../images/skull3.jpeg'
import skull4 from '../../images/skull4.jpeg'
import skull5 from '../../images/skull5.jpeg'
import './GallerySection.css'

const rects = [skull1, skull2, skull3, skull4, skull5]
const circleColors = ['#d7c3c2', '#aa7877', '#9f817f', '#941e1a', '#840f06']

export default function GallerySection() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <section className="gallery-section">
      <div className="gallery-inner">
        {/* top row — rectangles */}
        <div className="gallery-rects">
          {rects.map((src, i) => (
            <div
              key={i}
              className={`gallery-rect${activeIdx === i ? ' gallery-rect--active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        {/* bottom row — circles */}
        <div className="gallery-circles">
          {circleColors.map((color, i) => (
            <div key={i} className="gallery-circle" style={{ background: color }} />
          ))}
        </div>
      </div>
    </section>
  )
}
