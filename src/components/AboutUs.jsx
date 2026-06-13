import './AboutUs.css'
import { useEffect, useRef } from 'react'
import laceImg      from '../../images/lace.png'
import meetSonnyImg from '../../images/meetsonny.png'
import meetBgImg    from '../../images/meetbg.jpeg'

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

function MeetSonnyCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const img = new Image()
    img.src = meetSonnyImg
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
          const darkerL = Math.max(0.06, l * 0.60)
          const [nr, ng, nb] = hslToRgb(h, Math.min(1, s * 1.1), darkerL)
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }, [])

  return <canvas ref={canvasRef} className="au-betty" aria-hidden="true" />
}

export default function AboutUs() {
  return (
    <section className="au" id="about">
      {/* meetsonny sits above the section — outside au-inner so it isn't clipped */}
      <div className="au-img-wrap">
        <MeetSonnyCanvas />
      </div>

      <div className="au-inner">
        <div className="au-bg" aria-hidden="true" style={{ backgroundImage: `url(${meetBgImg})` }} />
        <div className="au-dim" aria-hidden="true" />

        <div className="au-lace" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <img key={i} src={laceImg} alt="" className="au-lace-img" />
          ))}
        </div>

        <div className="au-content">
          <div className="au-text">
            <h2 className="au-heading">meet our designer.</h2>
            <p className="au-role">Designer &amp; Programmer — Kero Group</p>
            <p className="au-desc">
              Hi, I'm Claire. I'm the designer behind KeroColor, the color
              consultancy arm of Kero Group. I believe that color is one of the
              most quietly powerful decisions a brand can make — and I've built
              my practice around helping people make it with intention.
            </p>
            <p className="au-desc">
              Whether you're building a brand from scratch or refining an
              existing identity, I work closely with every client to craft
              palettes that feel personal, cohesive, and built to last. Every
              shade I recommend has a reason behind it.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
