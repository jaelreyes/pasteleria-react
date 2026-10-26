import { Link, useLocation } from 'react-router-dom'
import { Button } from 'react-bootstrap'

function NotFound() {
  const ubicacion = useLocation()

  return (
    <section className="container my-5 text-center">
      <h1 className="display-4">404</h1>
      <h2 className="h4 mb-3">Página no encontrada</h2>

      <p className="text-muted">
        No encontramos una página en <code>{ubicacion.pathname}</code>.
      </p>

      <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
        <Button as={Link} to="/" variant="dark">
          Ir al inicio
        </Button>
        <Button as={Link} to="/productos" variant="outline-dark">
          Ver productos
        </Button>
      </div>
    </section>
  )
}

export default NotFound
