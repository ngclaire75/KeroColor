import './SiteHeader.css'
import logoImg from '../../images/kc-logo.svg'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="crest">
        <img loading="lazy" src={logoImg} alt="KeroColor" />
      </div>
    </header>
  )
}
