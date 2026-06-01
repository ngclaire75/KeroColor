import './AboutKeroColor.css'
import beigeGlowImg    from '../../images/beigeglow.png'
import deepMerlotImg   from '../../images/deepmerlot.png'
import onyxBlackImg    from '../../images/onyxblack.png'
import toastedStoneImg from '../../images/toastedstone.png'

const cards = [
  {
    title: 'Color Discovery',
    img: beigeGlowImg,
    body: 'rare palette insights and exclusive color analysis tools for every aesthetic.',
    featured: false,
  },
  {
    title: 'Palette Curation',
    img: deepMerlotImg,
    body: 'crafted palettes by color experts, designers, and visual artists.',
    featured: true,
  },
  {
    title: 'Style Analysis',
    img: onyxBlackImg,
    body: 'a blend of color psychology, trends, and deep visual inspiration.',
    featured: false,
  },
  {
    title: 'Monthly Palette',
    img: toastedStoneImg,
    body: 'for those who truly value the art of color and self-expression.',
    featured: false,
  },
]

export default function AboutKeroColor() {
  return (
    <section className="ak">

      <div className="ak-header">
        <h2 className="ak-heading">
          About the <span className="ak-accent">KeroColor</span>
        </h2>
        <p className="ak-desc">
          KeroColor is a color discovery platform born from the belief that every hue
          tells a story. Inspired by the warmth of cream, the passion of crimson, and
          the richness of earthy neutrals — we exist to help you analyze, understand,
          and own the colors that define who you are.
        </p>
      </div>

      <div className="ak-cards">
        {cards.map((c) => (
          <div key={c.title} className={`ak-card${c.featured ? ' ak-card--featured' : ''}`}>
            <h3 className="ak-card-title">{c.title}</h3>
            <div className="ak-card-img-wrap">
              <img src={c.img} alt={c.title} className="ak-card-img" />
            </div>
            <p className="ak-card-body">{c.body}</p>
          </div>
        ))}
      </div>

    </section>
  )
}
