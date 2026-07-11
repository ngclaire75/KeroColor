import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SearchProvider } from './SearchContext'
import ExplorePage from './pages/ExplorePage'
import LookPage    from './pages/LookPage'
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
import Footer          from './components/Footer'
import cakeImg    from '../images/model2.jpeg'
import drinkImg   from '../images/model1.jpeg'
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

  const homePage = (
    <div className="site">
      {calOpen && <Calendar onClose={() => setCalOpen(false)} />}
      <Navbar />
      <SiteHeader />
      <InfoBar onDateClick={() => setCalOpen(true)} />
      <div className="mobile-strip mobile-strip--model2">
        <img src={cakeImg} alt="Model" />
      </div>
      <Hero />
      <div className="mobile-strip mobile-strip--model1">
        <img src={drinkImg} alt="Model" />
      </div>
      <Ticker />
      <HowWeWork />
      <ColorMeaning />
      <ContactSection />
      <FaqSection />
      <AboutUs />
      <Footer />
    </div>
  )

  return (
    <SearchProvider>
    <Routes>
      <Route path="/" element={homePage} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/look"    element={<LookPage />} />
    </Routes>
    </SearchProvider>
  )
}
