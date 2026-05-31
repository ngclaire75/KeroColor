import './InfoBar.css'

function todayFormatted() {
  const d = new Date()
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export default function InfoBar({ onDateClick }) {
  return (
    <div className="info-bar">
      <span className="newsletter-link">designed by claire.</span>
      <button className="today-date today-date--btn" onClick={onDateClick}>
        {todayFormatted()}
      </button>
    </div>
  )
}
