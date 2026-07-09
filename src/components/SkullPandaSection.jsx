import folderImg from '../../images/folder.png'
import badImg from '../../images/bad.png.png'
import { useSearch } from '../SearchContext'
import './SkullPandaSection.css'

const COLOR_ITEMS = [
  { label: 'red',  colorFamily: 'red'  },
  { label: 'pink', colorFamily: 'pink' },
  { label: 'blue', colorFamily: 'blue' },
]

export default function SkullPandaSection({ onSearch }) {
  function handleClick(colorFamily, label) {
    onSearch?.({ query: label, valid: true, colorFamily })
  }

  return (
    <section className="skull-section">
      <img src={badImg} alt="" className="skull-model-img" />

      <div className="skull-color-rows">
        {COLOR_ITEMS.map(({ label, colorFamily, filter }) => (
          <div
            key={label}
            className="skull-color-row"
            onClick={() => handleClick(colorFamily, label)}
          >
            <img
              src={folderImg}
              alt=""
              className="skull-folder-img"
            />
            <span className="skull-color-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
