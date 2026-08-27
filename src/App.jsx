import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
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
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const DiscoverPalettesPage = lazy(() => import('./pages/DiscoverPalettesPage'))

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
  const navigate = useNavigate()

  const homePage = (
    <div className="site">
      <Navbar />
      <SiteHeader />
      <InfoBar onDateClick={() => navigate('/calendar')} />
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
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/palette/discover" element={<DiscoverPalettesPage />} />
      </Routes>
    </Suspense>
    </HeroVideoProvider>
    </SearchProvider>
  )
}
