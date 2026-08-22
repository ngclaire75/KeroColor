import { Link } from 'react-router-dom'
import './Navbar.css'

const row1 = [
  { label: 'home',           href: '/',        type: 'link'   },
  { label: 'about us',       href: '#about',   type: 'anchor' },
  { label: 'color palette',  href: '/palette', type: 'link'   },
  { label: 'explore',        href: '/explore', type: 'link'   },
]

const row2 = [
  { label: 'faq',     href: '#faq',     type: 'anchor' },
  { label: 'contact', href: '#contact', type: 'anchor' },
]

const renderLink = (l, extraClass = '') =>
  l.type === 'link'
    ? <Link key={l.label} to={l.href} className={`nav-link ${extraClass}`.trim()}>{l.label}</Link>
    : <a key={l.label} href={l.href} className={`nav-link ${extraClass}`.trim()}>{l.label}</a>

export default function Navbar() {
  return (
    <nav className="navbar">
      {row1.map(l => renderLink(l))}
      <span className="nav-break" />
      {row2.map(l => renderLink(l, 'nav-link--secondary'))}
    </nav>
  )
}
