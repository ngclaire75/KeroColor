import './Hero.css'
import { useEffect, useRef, forwardRef } from 'react'
import cakeImg   from '../../images/cake.png'
import drinkImg  from '../../images/drink.png'
import starImg   from '../../images/star.png'
import ribbonImg from '../../images/ribbon.png'
import sonnyImg  from '../../images/sonny.png'

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    default: h = ((r - g) / d + 4) / 6
  }
  return [h * 360, s, l]
}

function hslToRgb(h, s, l) {
  h /= 360
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue = (t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  return [Math.round(hue(h + 1/3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1/3) * 255)]
}

const SonnyCanvas = forwardRef(function SonnyCanvas({ onReady }, ref) {
  const canvasRef = useRef(null)

  const setRef = (el) => {
    canvasRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const img = new Image()
    img.src = sonnyImg
    img.onload = () => {
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = imageData

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 10) continue
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
        const isRed = (h <= 20 || h >= 340) && s > 0.45 && l > 0.08 && l < 0.65
        if (isRed) {
          const darkerL = Math.max(0.06, l * 0.70)
          const [nr, ng, nb] = hslToRgb(h, Math.min(1, s * 1.1), darkerL)
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb
        }
      }
      ctx.putImageData(imageData, 0, 0)
      onReady?.()
    }
  }, [onReady])

  return <canvas ref={setRef} className="sonny" aria-hidden="true" />
})

export default function Hero() {
  const sonnyRef  = useRef(null)
  const movesRef  = useRef(null)
  const centerRef = useRef(null)
  const alignRef  = useRef(null)

  useEffect(() => {
    const align = () => {
      if (!sonnyRef.current || !movesRef.current || !centerRef.current) return
      if (window.innerWidth > 640) {
        sonnyRef.current.style.top = ''  // let CSS handle desktop
        return
      }
      const cRect = centerRef.current.getBoundingClientRect()
      const mRect = movesRef.current.getBoundingClientRect()
      const sH    = sonnyRef.current.offsetHeight
      const lineCenter = mRect.top + mRect.height / 2 - cRect.top
      sonnyRef.current.style.top = `${lineCenter - sH / 2}px`
    }

    alignRef.current = align
    align()
    const ro = new ResizeObserver(align)
    ro.observe(document.body)
    if (sonnyRef.current) ro.observe(sonnyRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <section className="hero">
      <div className="hero-img">
        <img src={cakeImg} alt="Cake" />
      </div>

      <div className="hero-center" ref={centerRef}>
        <img src={starImg}   alt="" className="star star-tl"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-tr"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-mid"    aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-bl"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-br"     aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cl" aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cr" aria-hidden="true" />

        <SonnyCanvas ref={sonnyRef} onReady={() => alignRef.current?.()} />

        <p className="hero-script">
          color that<br />
          <span ref={movesRef}>moves </span><span className="you-clip"><span className="animate-you">you</span></span>
        </p>
        <p className="hero-body">
          If you love bold palettes, expressive art, and colors with a story
          to tell — you're in the right place and we're happy to deliver.
        </p>
        <a href="#" className="hero-btn">analyze palette now!</a>
      </div>

      <div className="hero-img">
        <img src={drinkImg} alt="Drink" />
      </div>
    </section>
  )
}
