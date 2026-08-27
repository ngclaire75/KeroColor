import { useState, useEffect, useRef } from 'react'
import { getLenis } from '../lenis'
import trail4 from '../../images/trail4.jpg'
import './EntryConsentModal.css'

const CLOSE_ANIM_MS = 350

// Shown once per Inspiration page visit — not persisted across visits
// (no localStorage/sessionStorage flag), so it appears every time the
// page is entered, by design. Stays mounted for a beat after `open`
// goes false so the zoom/fade-out transition can actually play instead
// of the panel just vanishing — `mounted` (not `open`) is what decides
// whether anything renders at all.
export default function EntryConsentModal({ open, onAgree }) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    if (open) {
      clearTimeout(closeTimeoutRef.current)
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      closeTimeoutRef.current = setTimeout(() => {
        setMounted(false)
        setClosing(false)
      }, CLOSE_ANIM_MS)
    }
    return () => clearTimeout(closeTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Scroll-locked the same way FullMenu locks it: overflow:hidden alone
  // doesn't hold on iOS Safari or against Lenis, which intercepts
  // wheel/touch directly, so both the body and Lenis itself need to be
  // stopped/restored together. Locked for as long as the banner is
  // actually on screen, including the closing animation.
  useEffect(() => {
    if (!mounted) return
    const b = document.body
    const scrollY = window.scrollY
    const prev = { overflow: b.style.overflow, position: b.style.position, width: b.style.width, top: b.style.top }
    b.style.overflow = 'hidden'
    b.style.position = 'fixed'
    b.style.width = '100%'
    b.style.top = `-${scrollY}px`
    getLenis()?.stop()
    return () => {
      b.style.overflow = prev.overflow
      b.style.position = prev.position
      b.style.width = prev.width
      b.style.top = prev.top
      window.scrollTo(0, scrollY)
      getLenis()?.start()
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className={`ecm-overlay${closing ? ' ecm-overlay--closing' : ''}`} role="dialog" aria-modal="true" aria-label="Before you continue">
      <div className="ecm-panel">
        {/* Same X design as the KeroColor hamburger menu's close button —
            two crossed diagonal lines, currentColor, no fill/border. */}
        <button type="button" className="ecm-close" onClick={onAgree} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 11 11" fill="none">
            <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>
        <div className="ecm-image">
          <img src={trail4} alt="" />
          <span className="ecm-image-word">kero</span>
        </div>
        <div className="ecm-content">
          <h2 className="ecm-heading">Before You Continue</h2>
          <p className="ecm-text">
            This page features clips from creators' full videos on YouTube.
            For the complete look, every step, product, and detail, we
            recommend watching the full version on their respective
            channels. Click agree to keep browsing here.
          </p>
          <button type="button" className="ecm-agree" onClick={onAgree}>
            Agree
          </button>
        </div>
      </div>
    </div>
  )
}
