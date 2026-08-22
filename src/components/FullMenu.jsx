import { useEffect } from 'react'
import './FullMenu.css'

export default function FullMenu({ open, onClose, items }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
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
          {items.map((name, i) => (
            // Keyed by position, not name: swapping fallback names for the
            // fetched Colormind names should update text in place, not
            // remount the row and restart its slide-in/fade-in animation.
            <div className="fm-item" key={i}>
              <span className="fm-num">{String(i + 1).padStart(3, '0')}</span>
              <span className="fm-name">{name}</span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
