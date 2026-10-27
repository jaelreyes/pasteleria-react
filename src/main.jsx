// Punto de entrada: monta la app en #root con el router y los estilos de Bootstrap.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/index.css'
import App from './App.jsx'

// BrowserRouter permite usar rutas (Routes, Link, useParams) en toda la app.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)