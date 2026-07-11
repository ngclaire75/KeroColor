import './Ticker.css'

const unit = 'get your free color guide ♥ analyze colors now ♥ explore palettes ♥ '
const copy = unit.repeat(6)

export default function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-track">
        <span>{copy}</span>
        <span aria-hidden="true">{copy}</span>
      </div>
    </div>
  )
}
