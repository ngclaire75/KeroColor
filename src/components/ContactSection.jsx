import './ContactSection.css'
import { useState } from 'react'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export default function ContactSection() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const f = e.target
    const subject = encodeURIComponent(f.subject.value || 'Message from KeroColor')
    const body    = encodeURIComponent(
      `Name: ${f.name.value}\nEmail: ${f.email.value}\n\nMessage:\n${f.message.value}`
    )
    window.location.href = `mailto:ngclaire75@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
    f.reset()
  }

  return (
    <section className="ct" id="contact">
      <div className="ct-form-col">
        <form className="ct-form" onSubmit={handleSubmit}>
          <input  type="text"  name="name"    placeholder="NAME"          className="ct-input"    required />
          <input  type="email" name="email"   placeholder="EMAIL ADDRESS"  className="ct-input"    required />
          <input  type="text"  name="subject" placeholder="SUBJECT"        className="ct-input"    required />
          <textarea            name="message" placeholder="MESSAGE"        className="ct-textarea" rows={6} required />
          <button type="submit" className="ct-btn">SEND</button>
          {sent && <p className="ct-feedback ct-feedback--ok">Your email client has opened. Just hit send!</p>}
        </form>
      </div>

      <div className="ct-info">
        <div className="ct-info-group">
          <h4 className="ct-info-label">Email</h4>
          <p className="ct-info-value">NGCLAIRE75@GMAIL.COM</p>
        </div>
        <div className="ct-info-group">
          <h4 className="ct-info-label">Headquarters</h4>
          <p className="ct-info-value">KERO GROUP<br />WEST SURABAYA</p>
        </div>
        <div className="ct-info-group">
          <h4 className="ct-info-label">Follow Us</h4>
          <div className="ct-socials">
            <a href="https://www.instagram.com/darynn.ng?utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          </div>
        </div>
      </div>
    </section>
  )
}
