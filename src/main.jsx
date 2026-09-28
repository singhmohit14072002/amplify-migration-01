import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App.jsx'

fetch('/amplify_outputs.json')
  .then((response) => response.ok ? response.json() : null)
  .then((outputs) => {
    if (outputs) Amplify.configure(outputs)
  })
  .catch(() => {})
  .finally(() => createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ))
