import './FaqSection.css'
import { useState, useRef } from 'react'
import { getLenis } from '../lenis'

// Matches the accordion's own timing (0.7s grid-row grow + the text's
// 0.6s opacity fade starting 0.15s in, i.e. finishing around 0.75s) plus
// a small buffer.
const TRANSITION_MS = 800

const faqs = [
  {
    q: 'What can I do on KeroColor?',
    a: 'KeroColor is a curated color inspiration site. Explore mood-driven imagery filtered by color family, browse styled looks, discover ready-made palettes with names and hex codes, and read seasonal editorials, all in one place.',
  },
  {
    q: 'How are the color palettes chosen?',
    a: 'The Palette page groups curated collections into tabs, All, Seasonal Edition, Editorial, and Inspiration, each with its own set of swatches, names, and hex codes to browse and reference.',
  },
  {
    q: "What's the difference between Explore, Look, and Inspiration?",
    a: 'Explore lets you browse mood-driven imagery filtered by color family. Look pairs styled outfits with the palettes that inspired them. Inspiration is a video and visual mood board for a closer, more editorial look at color in motion.',
  },
  {
    q: 'Do I need an account to use KeroColor?',
    a: 'No account or sign-up required. Every page, palette, and editorial is open to browse right away.',
  },
  {
    q: 'Is KeroColor free to use?',
    a: 'KeroColor is completely free to use. Explore our palettes, styled looks, and editorials at no cost.',
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState(null)
  const resumeTimeoutRef = useRef(null)

  // The accordion grows/shrinks the page's total height continuously over
  // the whole transition — Lenis reads that height every frame to clamp
  // the scroll position, and a page that's still resizing mid-frame is a
  // moving target for it, which is exactly what showed up as jitter
  // (most visible on the last item, since expanding it is what pushes the
  // page closest to/past its previous scroll limit). Stopping Lenis for
  // the transition's duration, then resizing it once the DOM has actually
  // settled at its new height, avoids that fight entirely.
  const toggle = (i) => {
    setOpen(open === i ? null : i)
    getLenis()?.stop()
    clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = setTimeout(() => {
      const lenis = getLenis()
      lenis?.resize()
      lenis?.start()
    }, TRANSITION_MS)
  }

  return (
    <section className="faq" id="faq">
      <h2 className="faq-heading">FAQs</h2>

      <div className="faq-list">
        {faqs.map((item, i) => (
          <div key={i} className="faq-item">
            <button
              className="faq-q"
              onClick={() => toggle(i)}
              aria-expanded={open === i}
            >
              <span>{item.q}</span>
              <span className="faq-icon">{open === i ? '−' : '+'}</span>
            </button>
            <div className={`faq-a-wrap${open === i ? ' faq-a-wrap--open' : ''}`}>
              <div className="faq-a-inner">
                <p className="faq-a">{item.a}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="faq-bottom-line" />
      </div>
    </section>
  )
}
