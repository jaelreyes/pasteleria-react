import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Tarjeta de una categoría. Se marca cuando es la categoría elegida.
function CategoriaCard({ nombre, slug, imagen, cantidad, activa = false }) {
  return (
    <Card
      as={Link}
      to={`/categorias/${slug}`}
      className={`categoria-card h-100${activa ? ' categoria-card-activa' : ''}`}
      aria-current={activa ? 'page' : undefined}
    >
      <Card.Img variant="top" src={imagen} alt="" loading="lazy" />

      <Card.Body className="text-center">
        <Card.Title as="h2" className="categoria-card-titulo">
          {nombre}
        </Card.Title>
        <small className="text-muted">
          {cantidad} {cantidad === 1 ? 'producto' : 'productos'}
        </small>
      </Card.Body>
    </Card>
  )
}

export default CategoriaCard