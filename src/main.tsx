import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadMenuFromApi } from './lib/loadMenu'
import { loadPromosFromApi } from './lib/loadPromos'
import { loadSettingsFromApi } from './lib/loadSettings'
import { applyTheme } from './lib/theme'
import { siteSettings } from './data/siteSettings'
import { initPwa } from './lib/pwa'

// Oculta el body para evitar el flash de emojis nativos
document.body.style.visibility = 'hidden'

initPwa()

async function start() {
  // Trae el menu actualizado antes de pintar (si falla, usa el menu local)
  await Promise.all([loadMenuFromApi(), loadPromosFromApi(), loadSettingsFromApi()])
  applyTheme(siteSettings)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  // Aplica Twemoji y muestra la pagina
  requestAnimationFrame(() => {
    // @ts-ignore
    if (window.twemoji) {
      // @ts-ignore
      window.twemoji.parse(document.body, { folder: 'svg', ext: '.svg' })
    }
    document.body.style.visibility = 'visible'
  })
}

start()
