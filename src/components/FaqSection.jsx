import './FaqSection.css'
import { useState } from 'react'

const faqs = [
  {
    q: 'How does the color analyzer work?',
    a: 'Our color analyzer uses advanced algorithms to evaluate your uploaded images or selected swatches, identifying dominant hues, tones, and complementary shades that form your unique color profile.',
  },
  {
    q: 'What is a color palette analysis?',
    a: 'A color palette analysis breaks down your chosen or detected colors into a cohesive system, including primary, secondary, and accent tones, helping you understand how each hue works together.',
  },
  {
    q: 'How do I find my signature color?',
    a: 'Start by exploring our color analyzer tool. Upload an inspiration image or browse our curated palettes. We will identify recurring hues and suggest a signature color that best represents your aesthetic.',
  },
  {
    q: 'Can I save and export my palettes?',
    a: 'Yes, all generated palettes can be saved to your KeroColor profile and exported in multiple formats including HEX, RGB, and PNG swatches for use across design tools.',
  },
  {
    q: 'Is KeroColor free to use?',
    a: 'KeroColor is completely free to use. Explore our color analyzer, build palettes, and discover your signature colors, all at no cost.',
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState(null)

  const toggle = (i) => setOpen(open === i ? null : i)

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
            {open === i && (
              <p className="faq-a">{item.a}</p>
            )}
          </div>
        ))}
        <div className="faq-bottom-line" />
      </div>
    </section>
  )
}
