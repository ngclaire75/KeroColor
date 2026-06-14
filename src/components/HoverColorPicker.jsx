import { useEffect, useRef, useState, useCallback } from 'react'
import './HoverColorPicker.css'

function samplePixel(canvas, ctx, clientX, clientY, rect) {
  if (!canvas || !ctx || canvas.width === 0) return null
  const cx = Math.floor((clientX - rect.left) * (canvas.width  / rect.width))
  const cy = Math.floor((clientY - rect.top)  * (canvas.height / rect.height))
  const [r, g, b, a] = ctx.getImageData(cx, cy, 1, 1).data
  if (a < 10) return null
  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  return { hex, color: `rgb(${r},${g},${b})` }
}

function tooltipPos(clientX, clientY) {
  const tipW = 110
  const flipX = clientX + 18 + tipW > window.innerWidth
  return {
    x: flipX ? clientX - tipW - 10 : clientX + 18,
    y: clientY - 22,
  }
}

export default function HoverColorPicker({ src, alt }) {
  const canvasRef  = useRef(null)
  const ctxRef     = useRef(null)
  const tapTimer   = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const hide = () => setTooltip(null)
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctxRef.current = ctx
    const img = new Image()
    img.src = src
    img.onload = () => {
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
    }
  }, [src])

  // Desktop — continuous on mousemove
  const handleMouseMove = useCallback((e) => {
    const rect   = e.currentTarget.getBoundingClientRect()
    const sample = samplePixel(canvasRef.current, ctxRef.current, e.clientX, e.clientY, rect)
    if (!sample) { setTooltip(null); return }
    const { x, y } = tooltipPos(e.clientX, e.clientY)
    setTooltip({ ...sample, x, y })
  }, [])

  // Mobile — show on tap, auto-hide after 2.5 s
  const handleTouchStart = useCallback((e) => {
    const touch  = e.touches[0]
    const rect   = e.currentTarget.getBoundingClientRect()
    const sample = samplePixel(canvasRef.current, ctxRef.current, touch.clientX, touch.clientY, rect)
    if (!sample) return
    const { x, y } = tooltipPos(touch.clientX, touch.clientY - 28)
    setTooltip({ ...sample, x, y })
    clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => setTooltip(null), 2500)
  }, [])

  return (
    <div
      className="hcp-wrap"
      style={{ cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
      onTouchStart={handleTouchStart}
    >
      <img src={src} alt={alt} />
      <canvas ref={canvasRef} className="hcp-canvas" />
      {tooltip && (
        <div className="hcp-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <span className="hcp-swatch" style={{ background: tooltip.color }} />
          {tooltip.hex}
        </div>
      )}
    </div>
  )
}
