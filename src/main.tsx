import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA: registra el service worker sólo en PRODUCCIÓN y servido por http/https.
// En dev se omite a propósito: el SW cacheaba módulos y servía la app vieja
// (interfería con el desarrollo). En el archivo único (file://) tampoco aplica.
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
