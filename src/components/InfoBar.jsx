import './InfoBar.css'
import { useState, useEffect } from 'react'

function todayFormatted() {
  const d = new Date()
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export default function InfoBar({ onDateClick }) {
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const hide = () => setShowHint(false)
    document.addEventListener('touchstart', hide, { once: true })
    return () => document.removeEventListener('touchstart', hide)
  }, [])

  return (
    <div className="info-bar">
      <span className="newsletter-link">designed by claire.</span>
      <div className="today-date-wrap">
        {showHint && (
          <div className="today-date-float">
            <span className="today-date-hint">view calendar</span>
            <svg className="today-date-arrow" viewBox="0 0 10 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5" y1="0" x2="5" y2="24" stroke="currentColor" strokeWidth="0.5"/>
              <polyline points="1,18 5,24 9,18" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>
        )}
        <button className="today-date today-date--btn" onClick={onDateClick}>
          {todayFormatted()}
        </button>
      </div>
    </div>
  )
}
