import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
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
import PageLoader from './components/PageLoader'
import { PLAY_LOADER_EVENT } from './utils/pageLoader'
import cakeImg    from '../images/model2.webp'
import drinkImg   from '../images/model1.webp'
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
    requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
  }, [location])

  return null
}

// A browser reload (as opposed to a fresh visit) gets the quick loader even
// on the homepage — the full intro with progress bar is for first arrivals.
const IS_RELOAD = performance.getEntriesByType?.('navigation')?.[0]?.type === 'reload'

export default function App() {
  const navigate = useNavigate()
  // Homepage intro loader — shown on the first homepage visit per page
  // load, not again when navigating back to it.
  const [homeLoaderDone, setHomeLoaderDone] = useState(false)
  const handleHomeLoaderDone = useCallback(() => {
    setHomeLoaderDone(true)
    setPageLoaderDonePath('/')
  }, [])

  // Loader for every other page — shown each time you arrive on one (a
  // different path, or the same path again after leaving it).
  const location = useLocation()
  const [pageLoaderDonePath, setPageLoaderDonePath] = useState(null)
  useEffect(() => {
    setPageLoaderDonePath((done) => (done === location.pathname ? done : null))
  }, [location.pathname])
  const handlePageLoaderDone = useCallback(
    () => setPageLoaderDonePath(location.pathname),
    [location.pathname],
  )
  // The homepage uses its own intro loader the first time; after that,
  // returning to it plays the quick loader like every other page.
  const showPageLoader =
    pageLoaderDonePath !== location.pathname && (location.pathname !== '/' || homeLoaderDone)

  // In-page switches (Explore colours, Palette tabs) ask for the loader via
  // playPageLoader(); each request mounts a fresh quick loader.
  const [manualLoader, setManualLoader] = useState(0)
  useEffect(() => {
    const play = () => setManualLoader((n) => n + 1)
    window.addEventListener(PLAY_LOADER_EVENT, play)
    return () => window.removeEventListener(PLAY_LOADER_EVENT, play)
  }, [])
  const handleManualLoaderDone = useCallback(() => setManualLoader(0), [])

  const homePage = (
    <div className="site">
      {!homeLoaderDone && <PageLoader fast={IS_RELOAD} onDone={handleHomeLoaderDone} />}
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
    <ScrollToHash />
    {showPageLoader && <PageLoader key={location.pathname} fast onDone={handlePageLoaderDone} />}
    {!showPageLoader && manualLoader > 0 && (
      <PageLoader key={`manual-${manualLoader}`} fast onDone={handleManualLoaderDone} />
    )}
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
