import { useState, useEffect } from 'react'
import next1 from '../../images/next1.jpeg'
import next2 from '../../images/next2.jpeg'
import next3 from '../../images/next3.jpeg'
import next4 from '../../images/next4.jpeg'
import next5 from '../../images/next5.jpeg'
import next6 from '../../images/next6.jpeg'
import next7 from '../../images/next7.jpeg'
import next8 from '../../images/next8.jpeg'
import next9 from '../../images/next9.jpeg'
import ws1 from '../../images/ws1.jpeg'
import ws2 from '../../images/ws2.jpeg'
import ws3 from '../../images/ws3.jpeg'
import ws4 from '../../images/ws4.jpeg'
import ws5 from '../../images/ws5.jpeg'
import ws6 from '../../images/ws6.jpeg'
import ws7 from '../../images/ws7.jpeg'
import ws8 from '../../images/ws8.jpeg'
import ws9 from '../../images/ws9.jpeg'
import np1 from '../../images/np1.jpeg'
import np2 from '../../images/np2.jpeg'
import np3 from '../../images/np3.jpeg'
import np4 from '../../images/np4.jpeg'
import np5 from '../../images/np5.jpeg'
import np6 from '../../images/np6.jpeg'
import np7 from '../../images/np7.jpeg'
import np8 from '../../images/np8.jpeg'
import np9 from '../../images/np9.jpeg'
import buldak from '../../images/buldak.png'
import './NextSection.css'

const nextImages = [next1, next2, next3, next4, next5, next6, next7, next8, next9]
const wsImages   = [ws1,   ws2,   ws3,   ws4,   ws5,   ws6,   ws7,   ws8,   ws9]
const npImages   = [np1,   np2,   np3,   np4,   np5,   np6,   np7,   np8,   np9]

function ArrowIcon() {
  return (
    <svg className="next-card-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 7h10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// cycle: next (7s) → stagger to ws (7s) → stagger to np (7s) → stagger back to next → loop
export default function NextSection() {
  const [phase, setPhase] = useState('next')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let t

    if (phase === 'next') {
      t = setTimeout(() => { setPhase('to-ws'); setProgress(0) }, 7000)
    } else if (phase === 'to-ws') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('ws')
        setProgress(0)
      }
    } else if (phase === 'ws') {
      t = setTimeout(() => { setPhase('to-np'); setProgress(0) }, 7000)
    } else if (phase === 'to-np') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('np')
        setProgress(0)
      }
    } else if (phase === 'np') {
      t = setTimeout(() => { setPhase('to-next'); setProgress(0) }, 7000)
    } else if (phase === 'to-next') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('next')
        setProgress(0)
      }
    }

    return () => clearTimeout(t)
  }, [phase, progress])

  function getImage(i) {
    if (phase === 'next') return nextImages[i]
    if (phase === 'ws')   return wsImages[i]
    if (phase === 'np')   return npImages[i]

    if (phase === 'to-ws') return progress > i ? wsImages[i] : nextImages[i]
    if (phase === 'to-np') return progress > i ? npImages[i] : wsImages[i]
    if (phase === 'to-next') return progress > i ? nextImages[i] : npImages[i]

    return nextImages[i]
  }

  return (
    <section className="next-section">
      <div className="next-grid">
        {nextImages.map((_, i) => {
          const card = (
            <div className="next-card next-card--image">
              <img src={getImage(i)} alt="" className="next-card-img" />
              <div className="next-card-header">
                <span>KEROCOLOR</span>
                <span>2026</span>
              </div>
              <ArrowIcon />
            </div>
          )

          if (i === 2) {
            return (
              <div key={i} className="next-card-buldak-wrap">
                <img src={buldak} alt="" className="next-buldak-bg" />
                {card}
              </div>
            )
          }

          return <div key={i}>{card}</div>
        })}
      </div>
    </section>
  )
}
