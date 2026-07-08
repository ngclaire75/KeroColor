import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import tj1 from '../../images/tj1.jpeg'
import tj2 from '../../images/tj2.jpeg'
import tj3 from '../../images/tj3.jpeg'
import tj4 from '../../images/tj4.jpeg'
import tj5 from '../../images/tj5.jpeg'
import tj6 from '../../images/tj6.jpeg'
import tj7 from '../../images/tj7.jpeg'
import tj8 from '../../images/tj8.jpeg'
import tj9 from '../../images/tj9.jpeg'
import pw1 from '../../images/pw1.jpeg'
import pw2 from '../../images/pw2.jpeg'
import pw3 from '../../images/pw3.jpeg'
import pw4 from '../../images/pw4.jpeg'
import pw5 from '../../images/pw5.jpeg'
import pw6 from '../../images/pw6.jpeg'
import pw7 from '../../images/pw7.jpeg'
import pw8 from '../../images/pw8.jpeg'
import pw9 from '../../images/pw9.jpeg'
import ap1 from '../../images/ap1.jpeg'
import ap2 from '../../images/ap2.jpeg'
import ap3 from '../../images/ap3.jpeg'
import ap4 from '../../images/ap4.jpeg'
import ap5 from '../../images/ap5.jpeg'
import ap6 from '../../images/ap6.jpeg'
import ap7 from '../../images/ap7.jpeg'
import ap8 from '../../images/ap8.jpeg'
import ap9 from '../../images/ap9.jpeg'
import tp1 from '../../images/tp1.jpeg'
import tp2 from '../../images/tp2.jpeg'
import tp3 from '../../images/tp3.jpeg'
import tp4 from '../../images/tp4.jpeg'
import tp5 from '../../images/tp5.jpeg'
import tp6 from '../../images/tp6.jpeg'
import tp7 from '../../images/tp7.jpeg'
import tp8 from '../../images/tp8.jpeg'
import tp9 from '../../images/tp9.jpeg'
import nr1 from '../../images/nr1.jpeg'
import nr2 from '../../images/nr2.jpeg'
import nr3 from '../../images/nr3.jpeg'
import nr4 from '../../images/nr4.jpeg'
import nr5 from '../../images/nr5.jpeg'
import nr6 from '../../images/nr6.jpeg'
import nr7 from '../../images/nr7.jpeg'
import nr8 from '../../images/nr8.jpeg'
import nr9 from '../../images/nr9.jpeg'
import wr1 from '../../images/wr1.jpeg'
import wr2 from '../../images/wr2.jpeg'
import wr3 from '../../images/wr3.jpeg'
import wr4 from '../../images/wr4.jpeg'
import wr5 from '../../images/wr5.jpeg'
import wr6 from '../../images/wr6.jpeg'
import wr7 from '../../images/wr7.jpeg'
import wr8 from '../../images/wr8.jpeg'
import wr9 from '../../images/wr9.jpeg'
import r1 from '../../images/r1.jpeg'
import r2 from '../../images/r2.jpeg'
import r3 from '../../images/r3.jpeg'
import r4 from '../../images/r4.jpeg'
import r5 from '../../images/r5.jpeg'
import r6 from '../../images/r6.jpeg'
import r7 from '../../images/r7.jpeg'
import r8 from '../../images/r8.jpeg'
import r9 from '../../images/r9.jpeg'
import j1 from '../../images/j1.jpeg'
import j2 from '../../images/j2.jpeg'
import j3 from '../../images/j3.jpeg'
import j4 from '../../images/j4.jpeg'
import j5 from '../../images/j5.jpeg'
import j6 from '../../images/j6.jpeg'
import j7 from '../../images/j7.jpeg'
import j8 from '../../images/j8.jpeg'
import j9 from '../../images/j9.jpeg'
import galpink1 from '../../images/galpink1.jpeg'
import galpink2 from '../../images/galpink2.jpeg'
import galpink3 from '../../images/galpink3.jpeg'
import galpink4 from '../../images/galpink4.jpeg'
import galpink5 from '../../images/galpink5.jpeg'
import galpink6 from '../../images/galpink6.jpeg'
import galpink7 from '../../images/galpink7.jpeg'
import galpink8 from '../../images/galpink8.jpeg'
import galpink9 from '../../images/galpink9.jpeg'
import pi1 from '../../images/pi1.jpeg'
import pi2 from '../../images/pi2.jpeg'
import pi3 from '../../images/pi3.jpeg'
import pi4 from '../../images/pi4.jpeg'
import pi5 from '../../images/pi5.jpeg'
import pi6 from '../../images/pi6.jpeg'
import pi7 from '../../images/pi7.jpeg'
import pi8 from '../../images/pi8.jpeg'
import pi9 from '../../images/pi9.jpeg'
import pin1 from '../../images/pin1.jpeg'
import pin2 from '../../images/pin2.jpeg'
import pin3 from '../../images/pin3.jpeg'
import pin4 from '../../images/pin4.jpeg'
import pin5 from '../../images/pin5.jpeg'
import pin6 from '../../images/pin6.jpeg'
import pin7 from '../../images/pin7.jpeg'
import pin8 from '../../images/pin8.jpeg'
import pin9 from '../../images/pin9.jpeg'
import p1 from '../../images/p1.jpeg'
import p2 from '../../images/p2.jpeg'
import p3 from '../../images/p3.jpeg'
import p4 from '../../images/p4.jpeg'
import p5 from '../../images/p5.jpeg'
import p6 from '../../images/p6.jpeg'
import p7 from '../../images/p7.jpeg'
import p8 from '../../images/p8.jpeg'
import p9 from '../../images/p9.jpeg'
import './NextSection.css'

const nextImages = [next1, next2, next3, next4, next5, next6, next7, next8, next9]
const wsImages   = [ws1,   ws2,   ws3,   ws4,   ws5,   ws6,   ws7,   ws8,   ws9]
const npImages   = [np1,   np2,   np3,   np4,   np5,   np6,   np7,   np8,   np9]
const tjImages   = [tj1,   tj2,   tj3,   tj4,   tj5,   tj6,   tj7,   tj8,   tj9]
const pwImages   = [pw1,   pw2,   pw3,   pw4,   pw5,   pw6,   pw7,   pw8,   pw9]
const apImages   = [ap1,   ap2,   ap3,   ap4,   ap5,   ap6,   ap7,   ap8,   ap9]
const tpImages   = [tp1,   tp2,   tp3,   tp4,   tp5,   tp6,   tp7,   tp8,   tp9]
const nrImages   = [nr1,   nr2,   nr3,   nr4,   nr5,   nr6,   nr7,   nr8,   nr9]
const wrImages   = [wr1,   wr2,   wr3,   wr4,   wr5,   wr6,   wr7,   wr8,   wr9]
const rImages    = [r1,    r2,    r3,    r4,    r5,    r6,    r7,    r8,    r9]
const jImages      = [j1,       j2,       j3,       j4,       j5,       j6,       j7,       j8,       j9]
const galpinkImages = [galpink1, galpink2, galpink3, galpink4, galpink5, galpink6, galpink7, galpink8, galpink9]
const pImages       = [pi1, pi2, pi3, pi4, pi5, pi6, pi7, pi8, pi9]
const pinImages     = [pin1, pin2, pin3, pin4, pin5, pin6, pin7, pin8, pin9]
const p1Images      = [p1,   p2,  p3,  p4,  p5,  p6,  p7,  p8,  p9]

function ArrowIcon() {
  return (
    <svg className="next-card-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 7h10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function getBatch(phase, progress, i) {
  if (phase === 'next') return 'next'
  if (phase === 'ws')   return 'ws'
  if (phase === 'np')   return 'np'
  if (phase === 'tj')   return 'tj'
  if (phase === 'pw')   return 'pw'
  if (phase === 'ap')   return 'ap'
  if (phase === 'tp')   return 'tp'
  if (phase === 'nr')   return 'nr'
  if (phase === 'wr')   return 'wr'
  if (phase === 'r')    return 'r'
  if (phase === 'j')    return 'j'
  if (phase === 'to-ws')   return progress > i ? 'ws'   : 'next'
  if (phase === 'to-np')   return progress > i ? 'np'   : 'ws'
  if (phase === 'to-tj')   return progress > i ? 'tj'   : 'np'
  if (phase === 'to-pw')   return progress > i ? 'pw'   : 'tj'
  if (phase === 'to-ap')   return progress > i ? 'ap'   : 'pw'
  if (phase === 'to-tp')   return progress > i ? 'tp'   : 'ap'
  if (phase === 'to-nr')   return progress > i ? 'nr'   : 'tp'
  if (phase === 'to-wr')   return progress > i ? 'wr'   : 'nr'
  if (phase === 'to-r')    return progress > i ? 'r'    : 'wr'
  if (phase === 'to-j')    return progress > i ? 'j'    : 'r'
  if (phase === 'to-next') return progress > i ? 'next' : 'j'
  return 'next'
}

// cycle: next → ws → np → tj → pw → ap → tp → nr → wr → r → j → next (5s each)
export default function NextSection({ searchResult }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [phase, setPhase] = useState(state?.resumeBatch ?? 'next')
  const [progress, setProgress] = useState(0)
  const [pinkPhase, setPinkPhase] = useState('pi')
  const [pinkProgress, setPinkProgress] = useState(0)

  useEffect(() => {
    if (searchResult?.colorFamily !== 'pink') return
    let t
    if (pinkPhase === 'pi') {
      t = setTimeout(() => { setPinkPhase('to-pin'); setPinkProgress(0) }, 5000)
    } else if (pinkPhase === 'to-pin') {
      if (pinkProgress < 9) {
        t = setTimeout(() => setPinkProgress(p => p + 1), 350)
      } else {
        setPinkPhase('pin'); setPinkProgress(0)
      }
    } else if (pinkPhase === 'pin') {
      t = setTimeout(() => { setPinkPhase('to-p'); setPinkProgress(0) }, 5000)
    } else if (pinkPhase === 'to-p') {
      if (pinkProgress < 9) {
        t = setTimeout(() => setPinkProgress(p => p + 1), 350)
      } else {
        setPinkPhase('p'); setPinkProgress(0)
      }
    } else if (pinkPhase === 'p') {
      t = setTimeout(() => { setPinkPhase('to-pi'); setPinkProgress(0) }, 5000)
    } else if (pinkPhase === 'to-pi') {
      if (pinkProgress < 9) {
        t = setTimeout(() => setPinkProgress(p => p + 1), 350)
      } else {
        setPinkPhase('pi'); setPinkProgress(0)
      }
    }
    return () => clearTimeout(t)
  }, [searchResult, pinkPhase, pinkProgress])

  function getPinkImage(i) {
    if (pinkPhase === 'pi')     return pImages[i]
    if (pinkPhase === 'pin')    return pinImages[i]
    if (pinkPhase === 'p')      return p1Images[i]
    if (pinkPhase === 'to-pin') return pinkProgress > i ? pinImages[i] : pImages[i]
    if (pinkPhase === 'to-p')   return pinkProgress > i ? p1Images[i]  : pinImages[i]
    if (pinkPhase === 'to-pi')  return pinkProgress > i ? pImages[i]   : p1Images[i]
    return pImages[i]
  }

  useEffect(() => {
    const allImages = [
      ...nextImages, ...wsImages, ...npImages, ...tjImages, ...pwImages,
      ...apImages,  ...tpImages, ...nrImages, ...wrImages, ...rImages, ...jImages
    ]
    allImages.forEach(src => { const img = new window.Image(); img.src = src })
  }, [])

  useEffect(() => {
    let t

    if (phase === 'next') {
      t = setTimeout(() => { setPhase('to-ws'); setProgress(0) }, 5000)
    } else if (phase === 'to-ws') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('ws')
        setProgress(0)
      }
    } else if (phase === 'ws') {
      t = setTimeout(() => { setPhase('to-np'); setProgress(0) }, 5000)
    } else if (phase === 'to-np') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('np')
        setProgress(0)
      }
    } else if (phase === 'np') {
      t = setTimeout(() => { setPhase('to-tj'); setProgress(0) }, 5000)
    } else if (phase === 'to-tj') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('tj')
        setProgress(0)
      }
    } else if (phase === 'tj') {
      t = setTimeout(() => { setPhase('to-pw'); setProgress(0) }, 5000)
    } else if (phase === 'to-pw') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('pw')
        setProgress(0)
      }
    } else if (phase === 'pw') {
      t = setTimeout(() => { setPhase('to-ap'); setProgress(0) }, 5000)
    } else if (phase === 'to-ap') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('ap')
        setProgress(0)
      }
    } else if (phase === 'ap') {
      t = setTimeout(() => { setPhase('to-tp'); setProgress(0) }, 5000)
    } else if (phase === 'to-tp') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('tp')
        setProgress(0)
      }
    } else if (phase === 'tp') {
      t = setTimeout(() => { setPhase('to-nr'); setProgress(0) }, 5000)
    } else if (phase === 'to-nr') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('nr')
        setProgress(0)
      }
    } else if (phase === 'nr') {
      t = setTimeout(() => { setPhase('to-wr'); setProgress(0) }, 5000)
    } else if (phase === 'to-wr') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('wr')
        setProgress(0)
      }
    } else if (phase === 'wr') {
      t = setTimeout(() => { setPhase('to-r'); setProgress(0) }, 5000)
    } else if (phase === 'to-r') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('r')
        setProgress(0)
      }
    } else if (phase === 'r') {
      t = setTimeout(() => { setPhase('to-j'); setProgress(0) }, 5000)
    } else if (phase === 'to-j') {
      if (progress < 9) {
        t = setTimeout(() => setProgress(p => p + 1), 350)
      } else {
        setPhase('j')
        setProgress(0)
      }
    } else if (phase === 'j') {
      t = setTimeout(() => { setPhase('to-next'); setProgress(0) }, 5000)
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
    if (phase === 'tj')   return tjImages[i]
    if (phase === 'pw')   return pwImages[i]
    if (phase === 'ap')   return apImages[i]
    if (phase === 'tp')   return tpImages[i]
    if (phase === 'nr')   return nrImages[i]
    if (phase === 'wr')   return wrImages[i]
    if (phase === 'r')    return rImages[i]
    if (phase === 'j')    return jImages[i]

    if (phase === 'to-ws')   return progress > i ? wsImages[i]   : nextImages[i]
    if (phase === 'to-np')   return progress > i ? npImages[i]   : wsImages[i]
    if (phase === 'to-tj')   return progress > i ? tjImages[i]   : npImages[i]
    if (phase === 'to-pw')   return progress > i ? pwImages[i]   : tjImages[i]
    if (phase === 'to-ap')   return progress > i ? apImages[i]   : pwImages[i]
    if (phase === 'to-tp')   return progress > i ? tpImages[i]   : apImages[i]
    if (phase === 'to-nr')   return progress > i ? nrImages[i]   : tpImages[i]
    if (phase === 'to-wr')   return progress > i ? wrImages[i]   : nrImages[i]
    if (phase === 'to-r')    return progress > i ? rImages[i]    : wrImages[i]
    if (phase === 'to-j')    return progress > i ? jImages[i]    : rImages[i]
    if (phase === 'to-next') return progress > i ? nextImages[i] : jImages[i]

    return nextImages[i]
  }

  return (
    <section className="next-section">
      <p className="next-gallery-label">gallery</p>
      <div className="next-grid">
        {nextImages.map((_, i) => {
          const isPink = searchResult?.colorFamily === 'pink'
          const src    = isPink ? getPinkImage(i) : getImage(i)
          const card = (
            <div
              className="next-card next-card--image"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/look', { state: { imgSrc: src, batch: isPink ? 'p' : getBatch(phase, progress, i), cardIndex: i } })}
            >
              <img src={src} alt="" className="next-card-img" />
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
