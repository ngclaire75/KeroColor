import { useState } from 'react'
import badImg from '../../images/bad.png.png'
import SearchLoader from './SearchLoader'
import './SkullPandaSection.css'

// Only these basic names are accepted as color name searches
const BASIC_COLOR_FAMILIES = {
  red:    'red',
  pink:   'pink',
  orange: 'orange',
  yellow: 'yellow',
  green:  'green',
  teal:   'teal',
  blue:   'blue',
  purple: 'purple',
  white:  'neutral',
  black:  'neutral',
  gray:   'neutral',
  grey:   'neutral',
}

function processSearch(raw) {
  const lower = raw.toLowerCase().trim()
  if (lower in BASIC_COLOR_FAMILIES) {
    return { valid: true, colorFamily: BASIC_COLOR_FAMILIES[lower] }
  }
  return { valid: false, colorFamily: null }
}

export default function SkullPandaSection({ onSearch }) {
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState(null)

  function handleSearch(e) {
    if (e.key !== 'Enter') return
    const raw = e.target.value.trim()
    if (!raw) return

    setIsSearching(true)
    onSearch?.(null)

    setTimeout(() => {
      const { valid, colorFamily } = processSearch(raw)
      setIsSearching(false)
      setResult({ query: raw, valid })
      onSearch?.({ query: raw, valid, colorFamily })
    }, 2000)
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
          <input
            className="skull-search-input"
            type="text"
            placeholder="search for a color"
            onKeyDown={handleSearch}
          />
        </div>

        <p className={`skull-tagline${result ? ' skull-tagline--result' : ''}`}>
          {result === null ? (
            <>
              <span>our defaults</span><br />
              <span>are red. search</span><br />
              <span>for more.</span>
            </>
          ) : result.valid ? (
            <><span>showing results for</span><br /><span>"{result.query}"</span></>
          ) : (
            <><span>no results found for</span><br /><span>"{result.query}"</span></>
          )}
        </p>

      </section>
    </>
  )
}
