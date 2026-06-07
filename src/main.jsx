import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadSiteFonts } from './siteFonts'
import App from './App.jsx'

loadSiteFonts()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
