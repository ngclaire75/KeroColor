import next1 from '../../images/next1.jpeg'
import next2 from '../../images/next2.jpeg'
import next3 from '../../images/next3.jpeg'
import next4 from '../../images/next4.jpeg'
import next5 from '../../images/next5.jpeg'
import next6 from '../../images/next6.jpeg'
import next7 from '../../images/next7.jpeg'
import next8 from '../../images/next8.jpeg'
import next9 from '../../images/next9.jpeg'
import './NextSection.css'

const cards = [
  { img: next1 },
  { img: next2 },
  { img: next3 },
  { img: next4 },
  { img: next5 },
  { img: next6 },
  { img: next7 },
  { img: next8 },
  { img: next9 },
]

function ArrowIcon() {
  return (
    <svg className="next-card-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 7h10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function NextSection() {
  return (
    <section className="next-section">
      <div className="next-grid">
        {cards.map((card, i) => (
          <div key={i} className={`next-card${card.img ? ' next-card--image' : ' next-card--empty'}`}>
            {card.img && <img src={card.img} alt="" className="next-card-img" />}
            <div className="next-card-header">
              <span>KEROCOLOR</span>
              <span>2026</span>
            </div>
            <ArrowIcon />
          </div>
        ))}
      </div>
    </section>
  )
}
