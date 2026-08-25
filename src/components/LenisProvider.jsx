import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { setLenis, getLenis } from '../lenis'

// Mounted once, outside <Routes>, so it survives route changes instead of
// tearing down/recreating the scroll instance on every navigation.
export default function LenisProvider() {
  const location = useLocation()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })
    setLenis(lenis)

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Page content (route-gated images, lazy-loaded page chunks, etc.) can
  // change the document height well after Lenis's own initial measurement,
  // so re-measure on every route change rather than trusting Lenis to
  // notice on its own.
  useEffect(() => {
    const id = requestAnimationFrame(() => getLenis()?.resize())
    return () => cancelAnimationFrame(id)
  }, [location.pathname])

  return null
}
