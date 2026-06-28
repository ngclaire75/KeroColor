import badImg from '../../images/bad.png.png'
import './SearchLoader.css'

export default function SearchLoader() {
  return (
    <div className="search-loader-overlay">
      <div className="search-loader-center">
        <img src={badImg} alt="" className="search-loader-img" />
      </div>
      <p className="search-loader-text">
        finding your color
        <span className="search-loader-dot">.</span>
        <span className="search-loader-dot">.</span>
        <span className="search-loader-dot">.</span>
      </p>
    </div>
  )
}
