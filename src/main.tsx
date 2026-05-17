import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Side-effect import: initialises i18next before the first render so the
// detected locale is already active when components first call useTranslation().
import './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
