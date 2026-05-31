import './Hero.css'
import { useEffect, useRef } from 'react'
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

// Replaces only red-hued pixels with crimson #7c1a2e, preserving original lightness
function SonnyCanvas() {
  const canvasRef = useRef(null)

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
        if (data[i + 3] < 10) continue // skip transparent
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
        // Red hue: 0–20° or 340–360°, high saturation, mid-dark lightness only
        // Excludes skin tones (lower sat, higher lightness) and near-black/white
        const isRed = (h <= 20 || h >= 340) && s > 0.55 && l > 0.08 && l < 0.60
        if (isRed) {
          // Scale lightness toward text colour's L≈0.29 so result stays dark crimson
          const adjustedL = Math.max(0.10, Math.min(0.42, l * 0.78))
          const [nr, ng, nb] = hslToRgb(348, 0.65, adjustedL)
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }, [])

  return <canvas ref={canvasRef} className="sonny" aria-hidden="true" />
}

export default function Hero() {
  return (
    <section className="hero">
      {/* Left image column */}
      <div className="hero-img">
        <img src={cakeImg} alt="Cake" />
      </div>

      {/* Center content */}
      <div className="hero-center">
        {/* Decorative stars */}
        <img src={starImg}   alt="" className="star star-tl"      aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-tr"      aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-mid"     aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-bl"      aria-hidden="true" />
        <img src={starImg}   alt="" className="star star-br"      aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cl"  aria-hidden="true" />
        <img src={ribbonImg} alt="" className="ribbon ribbon-cr"  aria-hidden="true" />
        <SonnyCanvas />
        <p className="hero-script">color that<br />moves <span className="you-clip"><span className="animate-you">you</span></span></p>
        <p className="hero-body">
          If you love bold palettes, expressive art, and colors with a story
          to tell — you're in the right place and we're happy to deliver.
        </p>
        <a href="#" className="hero-btn">analyze colors now!</a>
      </div>

      {/* Right image column */}
      <div className="hero-img">
        <img src={drinkImg} alt="Drink" />
      </div>
    </section>
  )
}
