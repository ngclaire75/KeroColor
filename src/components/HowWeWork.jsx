import './HowWeWork.css'
import endorse1 from '../../images/endorse1.webp'
import endorse2 from '../../images/endorse2.webp'
import endorse3 from '../../images/endorse3.webp'
import decoImg  from '../../images/deco.webp'

const steps = [
  {
    num: '01',
    title: 'Discover',
    img: endorse1,
    body: 'Wander through images grouped by hue and let a shade find you before you even go looking for it.',
    deco: true,
  },
  {
    num: '02',
    title: 'Explore',
    img: endorse2,
    body: 'Step inside a single image to pull out the colors hiding in it and see how they balance one another.',
    deco: true,
  },
  {
    num: '03',
    title: 'Create',
    img: endorse3,
    body: 'Carry what you found into whatever you make next, whether that is a wardrobe, a brand, a canvas, or a bedroom wall.',
  },
]

export default function HowWeWork() {
  return (
    <section className="hww">
      <p className="hww-label">A seamless journey to your dream palette.</p>
      <h2 className="hww-heading">
        How We Work Together To Build<br />Your Perfect Color Story
      </h2>

      <div className="hww-timeline">
        <div className="hww-line" />
        <img src={decoImg} alt="" className="hww-deco hww-deco-1" aria-hidden="true" loading="lazy" decoding="async" />
        <img src={decoImg} alt="" className="hww-deco hww-deco-2" aria-hidden="true" loading="lazy" decoding="async" />
        {steps.map((s) => (
          <div key={s.num} className="hww-step">
            <div className="hww-node">
              <img src={s.img} alt={s.title} className="hww-node-img" loading="lazy" decoding="async" />
            </div>
            {s.deco && <img src={decoImg} alt="" className="hww-step-deco" aria-hidden="true" loading="lazy" decoding="async" />}
            <div className="hww-step-text">
              <span className="hww-num">{s.num}</span>
              <strong className="hww-title">{s.title}</strong>
              <p className="hww-body">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
