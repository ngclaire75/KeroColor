import './Navbar.css'

const links = [
  { label: 'home',           href: '#'        },
  { label: 'about us',       href: '#about'   },
  { label: 'color palette',  href: '#'        },
  { label: 'explore',        href: '#'        },
  { label: 'color analyzer', href: '#'        },
  { label: 'faq',            href: '#faq'     },
  { label: 'contact',        href: '#contact' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      {links.map(l => (
        <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
      ))}
    </nav>
  )
}
