import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Oculta el body para evitar el flash de emojis nativos
document.body.style.visibility = 'hidden'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Aplica Twemoji y muestra la página
requestAnimationFrame(() => {
  // @ts-ignore
  if (window.twemoji) {
    // @ts-ignore
    window.twemoji.parse(document.body, { folder: 'svg', ext: '.svg' })
  }
  document.body.style.visibility = 'visible'
})