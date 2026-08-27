import './CalendarPage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bgBeige   from '../../images/beigeglow.webp'
import bgOnyx    from '../../images/onyxblack.webp'
import bgMerlot  from '../../images/deepmerlot.webp'
import bgStone   from '../../images/toastedstone.webp'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

const BACKGROUNDS = [
  { id: 0, img: bgBeige,  dark: false, label: 'Beige Glow'    },
  { id: 1, img: bgOnyx,   dark: true,  label: 'Onyx Black'    },
  { id: 2, img: bgMerlot, dark: true,  label: 'Deep Merlot'   },
  { id: 3, img: bgStone,  dark: true,  label: 'Toasted Stone' },
]

// Entrance stagger step for the day-name headers + date cells (see
// .cal-day-inner/.cal-dayname in the CSS) — same fade-up-from-below
// animation as FullMenu's .fm-item, just noticeably faster: FullMenu
// steps 0.20s per item (fine for its max ~9 rows) but a full month grid
// has up to 42 cells, so the same step would take way too long to
// finish revealing — 0.018s keeps the whole cascade under ~1s even for
// a 6-row month, while still reading as a clear left-to-right,
// top-to-bottom ripple rather than everything popping in at once.
const STAGGER_STEP_S = 0.018

function buildCells(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow    = new Date(year, month, 1).getDay()
  const offset      = firstDow === 0 ? 6 : firstDow - 1
  const cells = Array(offset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [year,    setYear]    = useState(today.getFullYear())
  const [month,   setMonth]   = useState(today.getMonth())
  const [bgIndex, setBgIndex] = useState(() => {
    const saved = localStorage.getItem('kc-bg')
    return saved !== null ? Number(saved) : 2
  })

  const cells = buildCells(year, month)
  const bg    = BACKGROUNDS[bgIndex]
  const light = !bg.dark

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const overlayStyle = bg.img
    ? { backgroundImage: `url(${bg.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <div
      className={`cal-page${light ? ' cal-page--light' : ''}`}
      style={overlayStyle}
    >
      <div className="cal">

        <button className="cal-close" onClick={() => navigate(-1)} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 11 11" fill="none">
            <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="cal-month-name cal-rise">{MONTHS[month]}</h2>

        <div className="cal-nav cal-rise" style={{ animationDelay: '0.06s' }}>
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <span className="cal-year">{year}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>

        <div className="cal-grid">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className="cal-dayname cal-rise"
              style={{ animationDelay: `${i * STAGGER_STEP_S}s` }}
            >
              {d}
            </div>
          ))}
          {cells.map((d, i) => (
            <div key={i} className={`cal-day${d ? '' : ' cal-day--empty'}`}>
              {d && (
                <div
                  className="cal-day-inner cal-rise"
                  style={{ animationDelay: `${(DAYS.length + i) * STAGGER_STEP_S}s` }}
                >
                  <span className={isToday(d) ? 'cal-today' : ''}>
                    <span className="cal-num">{d}</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Background picker ── */}
        <div
          className="cal-picker cal-rise"
          style={{ animationDelay: `${(DAYS.length + cells.length) * STAGGER_STEP_S}s` }}
        >
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              className={`cal-swatch${bgIndex === b.id ? ' cal-swatch--active' : ''}`}
              onClick={() => { setBgIndex(b.id); localStorage.setItem('kc-bg', b.id) }}
              aria-label={b.label}
              style={{ backgroundImage: `url(${b.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
