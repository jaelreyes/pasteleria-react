import { Link, useLocation } from 'react-router-dom'

function NotFound() {
  const ubicacion = useLocation()

  return (
    <section>
      <h2>404 — Página no encontrada</h2>

      <p>
        No encontramos una página en:
        {' '}
        <code>{ubicacion.pathname}</code>
      </p>

      <Link to="/productos">Volver al catálogo</Link>
    </section>
  )
}

export default NotFound