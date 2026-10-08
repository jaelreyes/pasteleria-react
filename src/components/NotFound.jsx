import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section>
      <h2>404 — Página no encontrada</h2>
      <p>La dirección que visitaste no existe.</p>
      <Link to="/productos">Volver al catálogo</Link>
    </section>
  )
}

export default NotFound