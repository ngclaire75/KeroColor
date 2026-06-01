import './SiteHeader.css'
import bearImg from '../../images/bear.png'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="crest">
        <img src={bearImg} alt="KeroColor crest" />
      </div>
      <h1 className="brand-name">KEROCOLOR</h1>
    </header>
  )
}
