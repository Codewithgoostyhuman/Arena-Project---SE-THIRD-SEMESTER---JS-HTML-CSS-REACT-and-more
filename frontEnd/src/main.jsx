import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArenaApp from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ArenaApp />
  </StrictMode>,
)
