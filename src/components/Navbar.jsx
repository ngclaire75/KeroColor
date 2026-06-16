import { Link } from 'react-router-dom'
import './Navbar.css'

const row1 = [
  { label: 'home',           href: '/',        type: 'link'   },
  { label: 'about us',       href: '#about',   type: 'anchor' },
  { label: 'color palette',  href: '#',        type: 'anchor' },
  { label: 'explore',        href: '/explore', type: 'link'   },
  { label: 'color analyzer', href: '#',        type: 'anchor' },
]

const row2 = [
  { label: 'faq',     href: '#faq',     type: 'anchor' },
  { label: 'contact', href: '#contact', type: 'anchor' },
]

const renderLink = l =>
  l.type === 'link'
    ? <Link key={l.label} to={l.href} className="nav-link">{l.label}</Link>
    : <a key={l.label} href={l.href} className="nav-link">{l.label}</a>

export default function Navbar() {
  return (
    <nav className="navbar">
      {row1.map(renderLink)}
      <span className="nav-break" />
      {row2.map(renderLink)}
    </nav>
  )
}
