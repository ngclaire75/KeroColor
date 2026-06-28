import { useState } from 'react'
import badImg from '../../images/bad.png.png'
import SearchLoader from './SearchLoader'
import './SkullPandaSection.css'

export default function SkullPandaSection() {
  const [isSearching, setIsSearching] = useState(false)

  function handleSearch(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setIsSearching(true)
    }
  }

  return (
    <>
    {isSearching && <SearchLoader />}
    <section className="skull-section">
      <img src={badImg} alt="" className="skull-model-img" />

      <div className="skull-search-wrap">
        <svg className="skull-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input className="skull-search-input" type="text" placeholder="search for a color" onKeyDown={handleSearch} />
      </div>

      <p className="skull-tagline">
        <span>our defaults</span><br />
        <span>are red. search</span><br />
        <span>for more.</span>
      </p>
    </section>
    </>
  )
}
