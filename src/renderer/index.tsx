import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'
import { initTauriApi } from './tauri-api'

// Tauri 환경이면 window.maenggu에 Tauri API 바인딩
initTauriApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
