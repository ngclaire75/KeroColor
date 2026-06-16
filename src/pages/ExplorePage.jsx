import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './ExplorePage.css'

const palettes = [
  {
    name: 'Rosewood Dusk',
    colors: ['#7c1a2e', '#b85470', '#e8a0b0', '#f5d5dc', '#fdf0f2'],
    mood: 'passionate · bold · feminine',
  },
  {
    name: 'Sage & Linen',
    colors: ['#4a5c4e', '#7a9e7e', '#b8d4b8', '#e8f0e8', '#f5f5f0'],
    mood: 'calm · natural · grounded',
  },
  {
    name: 'Midnight Gold',
    colors: ['#1a1a2e', '#2d2d5e', '#7c6a2e', '#c8a84b', '#f5e8c0'],
    mood: 'luxurious · mysterious · refined',
  },
  {
    name: 'Terracotta Sun',
    colors: ['#8b3a2a', '#c05c3a', '#e8956a', '#f5c4a0', '#fdf0e8'],
    mood: 'warm · vibrant · earthy',
  },
  {
    name: 'Lavender Mist',
    colors: ['#4a3a6e', '#7a5ea0', '#b8a0d4', '#e0d4f0', '#f5f0fc'],
    mood: 'dreamy · soft · elegant',
  },
  {
    name: 'Ocean Slate',
    colors: ['#1a3a4e', '#2d6080', '#5a9ab8', '#a0ccd8', '#e8f4f8'],
    mood: 'serene · confident · clean',
  },
]

export default function ExplorePage() {
  return (
    <div className="explore-page">
      <Navbar />
      <div className="explore-hero">
        <p className="explore-label">curated for your brand</p>
        <h1 className="explore-heading">Explore Color Palettes</h1>
        <p className="explore-sub">
          Discover handcrafted color stories designed to elevate your brand identity.
        </p>
      </div>

      <div className="explore-grid">
        {palettes.map((p) => (
          <div key={p.name} className="palette-card">
            <div className="palette-swatches">
              {p.colors.map((c) => (
                <div key={c} className="swatch" style={{ background: c }} />
              ))}
            </div>
            <div className="palette-info">
              <h3 className="palette-name">{p.name}</h3>
              <p className="palette-mood">{p.mood}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="explore-cta">
        <p>Want a palette made just for you?</p>
        <Link to="/#contact" className="explore-btn">book a consultation</Link>
      </div>
    </div>
  )
}
