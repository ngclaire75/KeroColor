import { useEffect } from 'react'
import { getLenis } from '../lenis'
import trail4 from '../../images/trail4.jpg'
import './EntryConsentModal.css'

// Shown once per Inspiration page visit — not persisted across visits
// (no localStorage/sessionStorage flag), so it appears every time the
// page is entered, by design. Scroll-locked the same way FullMenu locks
// it: overflow:hidden alone doesn't hold on iOS Safari or against Lenis,
// which intercepts wheel/touch directly, so both the body and Lenis
// itself need to be stopped/restored together.
export default function EntryConsentModal({ open, onAgree }) {
  useEffect(() => {
    if (!open) return
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
  }, [open])

  if (!open) return null

  return (
    <div className="ecm-overlay" role="dialog" aria-modal="true" aria-label="Before you continue">
      <div className="ecm-panel">
        <div className="ecm-image">
          <img src={trail4} alt="" />
        </div>
        <div className="ecm-content">
          <span className="ecm-brand">KERO</span>
          <h2 className="ecm-heading">Before You Continue</h2>
          <p className="ecm-text">
            This page features clips from creators' full videos on YouTube.
            For the complete look — every step, product, and detail — we
            recommend watching the full version there. Click agree to keep
            browsing here.
          </p>
          <button type="button" className="ecm-agree" onClick={onAgree}>
            Agree
          </button>
        </div>
      </div>
    </div>
  )
}
