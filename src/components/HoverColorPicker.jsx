import { useEffect, useRef, useState, useCallback } from 'react'
import './HoverColorPicker.css'

function samplePixel(canvas, ctx, clientX, clientY, rect) {
  if (!canvas || !ctx || canvas.width === 0) return null
  const cx = Math.floor((clientX - rect.left) * (canvas.width  / rect.width))
  const cy = Math.floor((clientY - rect.top)  * (canvas.height / rect.height))
  if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) return null
  const [r, g, b, a] = ctx.getImageData(cx, cy, 1, 1).data
  if (a < 10) return null
  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  return { hex, color: `rgb(${r},${g},${b})` }
}

function getPos(clientX, clientY, offsetY = 0) {
  const tipW  = 110
  const flipX = clientX + 18 + tipW > window.innerWidth
  return {
    x: flipX ? clientX - tipW - 10 : clientX + 18,
    y: clientY - 22 + offsetY,
  }
}

export default function HoverColorPicker({ src, alt }) {
  const canvasRef  = useRef(null)
  const ctxRef     = useRef(null)
  const tipRef     = useRef(null)   // direct DOM ref for smooth touch updates
  const wrapRef    = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const hide = () => setTooltip(null)
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  // Register touchmove as non-passive so e.preventDefault() can block scroll
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onMove = (e) => {
      if (e.touches.length !== 1) return
      e.preventDefault()
      const touch = e.touches[0]
      const rect  = el.getBoundingClientRect()
      updateTip(touch, rect)
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [updateTip])

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

  /* ── Desktop: mousemove (state-based, already fast) ── */
  const handleMouseMove = useCallback((e) => {
    const rect   = e.currentTarget.getBoundingClientRect()
    const sample = samplePixel(canvasRef.current, ctxRef.current, e.clientX, e.clientY, rect)
    if (!sample) { setTooltip(null); return }
    const { x, y } = getPos(e.clientX, e.clientY)
    setTooltip({ ...sample, x, y })
  }, [])

  /* ── Mobile: imperatively update DOM for zero-jank finger tracking ── */
  const updateTip = useCallback((touch, rect) => {
    const sample = samplePixel(canvasRef.current, ctxRef.current, touch.clientX, touch.clientY, rect)
    const tip    = tipRef.current
    if (!sample || !tip) return

    const { x, y } = getPos(touch.clientX, touch.clientY, -28)
    tip.style.left        = x + 'px'
    tip.style.top         = y + 'px'
    tip.style.display     = 'flex'
    tip.style.animation   = 'none'

    const swatch = tip.querySelector('.hcp-swatch')
    const label  = tip.querySelector('.hcp-hex')
    if (swatch) swatch.style.background = sample.color
    if (label)  label.textContent       = sample.hex
  }, [])

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    const rect  = wrapRef.current.getBoundingClientRect()
    // Show tooltip via state once (mounts the DOM node)
    const sample = samplePixel(canvasRef.current, ctxRef.current, touch.clientX, touch.clientY, rect)
    if (!sample) return
    const { x, y } = getPos(touch.clientX, touch.clientY, -28)
    setTooltip({ ...sample, x, y })
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault() // stop page scroll while finger is on image
    const touch = e.touches[0]
    const rect  = wrapRef.current.getBoundingClientRect()
    updateTip(touch, rect)
  }, [updateTip])

  const handleTouchEnd = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="hcp-wrap"
      style={{ cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img src={src} alt={alt} />
      <canvas ref={canvasRef} className="hcp-canvas" />
      {tooltip && (
        <div
          ref={tipRef}
          className="hcp-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="hcp-swatch" style={{ background: tooltip.color }} />
          <span className="hcp-hex">{tooltip.hex}</span>
        </div>
      )}
    </div>
  )
}
