import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { SearchProvider } from './SearchContext'
import { HeroVideoProvider } from './HeroVideoContext'
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
import LenisProvider    from './components/LenisProvider'
import { getLenis } from './lenis'
import cakeImg    from '../images/model2.jpeg'
import drinkImg   from '../images/model1.jpeg'
import './App.css'

// Lazy — each page's JS (and everything it imports) now ships in its own
// chunk, fetched only when that route is actually visited, instead of
// every page's code being bundled into the one JS file every visitor
// downloads regardless of which page they land on.
const ExplorePage  = lazy(() => import('./pages/ExplorePage'))
const LookPage     = lazy(() => import('./pages/LookPage'))
const PalettePage  = lazy(() => import('./pages/PalettePage'))
const EditorialPage = lazy(() => import('./pages/EditorialPage'))
const InspirationPage = lazy(() => import('./pages/InspirationPage'))

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.querySelector(location.hash)
    if (!el) return
    // Route through Lenis rather than native scrollIntoView, so the jump
    // is smoothed by the same engine handling wheel/touch scroll — two
    // different smoothing systems both trying to own the scroll position
    // at once is what causes stutter/fighting.
    requestAnimationFrame(() => {
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(el, { offset: 0 })
      else el.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location])

  return null
}

export default function App() {
  const [calOpen, setCalOpen] = useState(false)

  useEffect(() => {
    const b = document.body
    // Lenis intercepts wheel/touch and drives scroll itself, so it
    // doesn't respect the body's overflow:hidden the way native scroll
    // does — it needs to be explicitly stopped too, or the page keeps
    // smooth-scrolling underneath the open calendar.
    if (calOpen) {
      b.style.overflow = 'hidden'
      b.style.position = 'fixed'
      b.style.width    = '100%'
      getLenis()?.stop()
    } else {
      b.style.overflow = ''
      b.style.position = ''
      b.style.width    = ''
      getLenis()?.start()
    }
    return () => {
      b.style.overflow = ''
      b.style.position = ''
      b.style.width    = ''
      getLenis()?.start()
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
    <HeroVideoProvider>
    <LenisProvider />
    <ScrollToHash />
    {/* Each lazy page already shows its own SearchLoader overlay once it
        starts mounting — this fallback only covers the brief window
        before that (fetching the route's JS chunk), so it stays empty
        rather than introducing a second, different-looking loading
        state. */}
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={homePage} />
        <Route path="/explore"  element={<ExplorePage />} />
        <Route path="/look"     element={<LookPage />} />
        <Route path="/palette"  element={<PalettePage />} />
        <Route path="/editorial" element={<EditorialPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
      </Routes>
    </Suspense>
    </HeroVideoProvider>
    </SearchProvider>
  )
}
