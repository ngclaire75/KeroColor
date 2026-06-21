import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <span className="footer-brand">KeroColor</span>
      <span className="footer-copy">© {year} KeroGroup. All rights reserved.</span>
      <span className="footer-tag">color made personal.</span>
    </footer>
  )
}
