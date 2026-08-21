import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Block the right-click menu on images site-wide (Save Image As / Copy
// Image) — pairs with the user-select/drag CSS on `img` in index.css.
document.addEventListener('contextmenu', e => {
  if (e.target.matches('img')) e.preventDefault()
})

// Prevent iOS Safari from auto-zooming on input focus without changing visual font size
const viewport = document.querySelector('meta[name=viewport]')
if (viewport) {
  document.addEventListener('focusin', e => {
    if (e.target.matches('input, textarea, select'))
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1')
  })
  document.addEventListener('focusout', e => {
    if (e.target.matches('input, textarea, select'))
      viewport.setAttribute('content', 'width=device-width, initial-scale=1')
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
