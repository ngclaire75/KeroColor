import './SiteHeader.css'
import bearImg from '../../images/bear.webp'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="crest">
        <img loading="lazy" src={bearImg} alt="KeroColor crest" />
      </div>
      <h1 className="brand-name">KEROCOLOR</h1>
    </header>
  )
}
