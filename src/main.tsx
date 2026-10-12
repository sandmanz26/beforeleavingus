import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/atkinson-hyperlegible-next/400.css'
import '@fontsource/atkinson-hyperlegible-next/600.css'
import '@fontsource/atkinson-hyperlegible-next/700.css'
import '@fontsource/atkinson-hyperlegible-next/800.css'
import '@fontsource/atkinson-hyperlegible-mono/500.css'
import '@fontsource/atkinson-hyperlegible-mono/700.css'
import '@fontsource/caprasimo/400.css'
import './styles/base.css'
import './styles/site.css'
import './styles/app.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
