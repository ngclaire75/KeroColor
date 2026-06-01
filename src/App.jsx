import { useState, useEffect } from 'react'
import Navbar     from './components/Navbar'
import SiteHeader from './components/SiteHeader'
import InfoBar    from './components/InfoBar'
import Hero       from './components/Hero'
import Ticker     from './components/Ticker'
import HowWeWork    from './components/HowWeWork'
import ColorMeaning    from './components/ColorMeaning'
import AboutUs         from './components/AboutUs'
import ContactSection  from './components/ContactSection'
import FaqSection      from './components/FaqSection'
import Calendar        from './components/Calendar'
import cakeImg    from '../images/cake.png'
import drinkImg   from '../images/drink.png'
import './App.css'

export default function App() {
  const [calOpen, setCalOpen] = useState(false)

  useEffect(() => {
    const b = document.body
    if (calOpen) {
      b.style.overflow = 'hidden'
      b.style.position = 'fixed'
      b.style.width    = '100%'
    } else {
      b.style.overflow = ''
      b.style.position = ''
      b.style.width    = ''
    }
    return () => {
      b.style.overflow = ''
      b.style.position = ''
      b.style.width    = ''
    }
  }, [calOpen])

  return (
    <div className="site">
      {calOpen && <Calendar onClose={() => setCalOpen(false)} />}
      <Navbar />
      <SiteHeader />
      <InfoBar onDateClick={() => setCalOpen(true)} />
      <div className="mobile-strip">
        <img src={cakeImg} alt="" />
      </div>
      <Hero />
      <div className="mobile-strip">
        <img src={drinkImg} alt="" />
      </div>
      <Ticker />
      <HowWeWork />
      <ColorMeaning />
      <ContactSection />
      <FaqSection />
      <AboutUs />
    </div>
  )
}
