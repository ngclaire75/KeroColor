import { useState, useEffect, useRef } from 'react'
import { getLenis } from '../lenis'
import trail2 from '../../images/trail2.jpg'
import './EntryConsentModal.css'

const CLOSE_ANIM_MS = 600

// Shown once per Inspiration page visit — not persisted across visits
// (no localStorage/sessionStorage flag), so it appears every time the
// page is entered, by design. Stays mounted for a beat after `open`
// goes false so the zoom/fade-out transition can actually play instead
// of the panel just vanishing — `mounted` (not `open`) is what decides
// whether anything renders at all.
const DEFAULT_LABEL = 'agree to our terms & conditions'
const NUDGE_LABEL = 'click here to agree'
const LABEL_FADE_MS = 200 // must match the CSS transition duration below
const LABEL_HOLD_MS = 1600

export default function EntryConsentModal({ open, onAgree }) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  // Closing is gated on this — the X can't dismiss the overlay until
  // the user has actually pressed Agree at least once.
  const [agreed, setAgreed] = useState(false)
  // Only the label inside the pill crossfades — the pill itself (shape,
  // background, position) never moves or animates.
  const [agreeLabel, setAgreeLabel] = useState(DEFAULT_LABEL)
  const [labelHidden, setLabelHidden] = useState(false)
  const labelTimeoutsRef = useRef([])

  useEffect(() => {
    if (open) {
      clearTimeout(closeTimeoutRef.current)
      setMounted(true)
      setClosing(false)
      // Fresh consent required every time the banner reappears.
      setAgreed(false)
      setAgreeLabel(DEFAULT_LABEL)
      setLabelHidden(false)
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

  useEffect(() => () => {
    labelTimeoutsRef.current.forEach(clearTimeout)
  }, [])

  // X pressed before Agree: refuse to close. Instead the label fades
  // out, swaps to the nudge copy, fades back in, holds, then fades back
  // to "Agree" again — the pill itself never moves.
  const handleCloseAttempt = () => {
    if (agreed) {
      onAgree()
      return
    }
    labelTimeoutsRef.current.forEach(clearTimeout)
    labelTimeoutsRef.current = []
    setLabelHidden(true)
    labelTimeoutsRef.current.push(setTimeout(() => {
      setAgreeLabel(NUDGE_LABEL)
      setLabelHidden(false)
      labelTimeoutsRef.current.push(setTimeout(() => {
        setLabelHidden(true)
        labelTimeoutsRef.current.push(setTimeout(() => {
          setAgreeLabel(DEFAULT_LABEL)
          setLabelHidden(false)
        }, LABEL_FADE_MS))
      }, LABEL_HOLD_MS))
    }, LABEL_FADE_MS))
  }

  // Real Agree press: closes the overlay directly, same as before.
  const handleAgreeClick = () => {
    setAgreed(true)
    onAgree()
  }

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
        <button type="button" className="ecm-close" onClick={handleCloseAttempt} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 11 11" fill="none">
            <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>
        <div className="ecm-image">
          <img src={trail2} alt="" />
        </div>
        <div className="ecm-content">
          <h2 className="ecm-heading">Before You Continue</h2>
          <p className="ecm-text">
            This page features clips from creators' full videos on YouTube.
            For the complete look, every step, product, and detail, we
            recommend watching the full version on their respective
            channels.
          </p>
          {/* Agree closes the overlay directly, like before. The pill
              itself never animates — only the label inside it crossfades,
              and only when X is pressed before Agree (see
              handleCloseAttempt). */}
          <button type="button" className="ecm-agree" onClick={handleAgreeClick}>
            <span className={`ecm-agree-label${labelHidden ? ' ecm-agree-label--hidden' : ''}`}>
              {agreeLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
