import badImg from '../../images/bad.png.webp'
import './SearchLoader.css'

export default function SearchLoader({ fading }) {
  return (
    <div className={`search-loader-overlay${fading ? ' search-loader-overlay--fading' : ''}`}>
      <div className="search-loader-center">
        <img loading="lazy" src={badImg} alt="" className="search-loader-img" />
      </div>
      <p className="search-loader-text">
        loading
        <span className="search-loader-dot">.</span>
        <span className="search-loader-dot">.</span>
        <span className="search-loader-dot">.</span>
      </p>
    </div>
  )
}
