import { useEffect } from 'react'
import { getLenis } from '../lenis'
import './FullMenu.css'

export default function FullMenu({ open, onClose, items, onItemClick }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // overflow:hidden alone doesn't reliably block scroll on its own —
    // iOS Safari still lets the body rubber-band/scroll behind a fixed
    // overlay unless it's also taken out of normal flow (position:fixed
    // + width:100%), and Lenis intercepts wheel/touch directly to drive
    // scroll itself, so it ignores the body's overflow entirely unless
    // explicitly stopped too. Needed for both desktop (Lenis) and mobile
    // (the iOS quirk) to actually stop scroll behind the menu.
    //
    // position:fixed takes the body out of flow, which snaps it to
    // scrollY 0 — offsetting it by -scrollY (via top) keeps the page
    // looking exactly where it was instead of visibly jumping to the
    // top the instant the menu opens, then jumping again on close.
    const b = document.body
    const scrollY = window.scrollY
    const prev = { overflow: b.style.overflow, position: b.style.position, width: b.style.width, top: b.style.top }
    b.style.overflow = 'hidden'
    b.style.position = 'fixed'
    b.style.width = '100%'
    b.style.top = `-${scrollY}px`
    getLenis()?.stop()
    return () => {
      document.removeEventListener('keydown', onKey)
      b.style.overflow = prev.overflow
      b.style.position = prev.position
      b.style.width = prev.width
      b.style.top = prev.top
      window.scrollTo(0, scrollY)
      getLenis()?.start()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fm-overlay" role="dialog" aria-modal="true" aria-label="Menu">
      <button className="fm-close" onClick={onClose} aria-label="Close menu">
        <svg width="18" height="18" viewBox="0 0 11 11" fill="none">
          <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </button>
      <div className="fm-header">
        <span className="fm-brand">KeroColor</span>
        <span className="fm-subtitle">Menu</span>
      </div>
      <div className="fm-list-wrap">
        <nav className="fm-list">
          {items.map((name, i) => {
            // Keyed by position, not name: swapping fallback names for the
            // fetched Colormind names should update text in place, not
            // remount the row and restart its slide-in/fade-in animation.
            const Tag = onItemClick ? 'button' : 'div'
            return (
              <Tag
                className={`fm-item${onItemClick ? ' fm-item--clickable' : ''}`}
                key={i}
                type={onItemClick ? 'button' : undefined}
                onClick={onItemClick ? () => onItemClick(name, i) : undefined}
              >
                <span className="fm-num">{String(i + 1).padStart(3, '0')}</span>
                <span className="fm-name">{name}</span>
              </Tag>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
