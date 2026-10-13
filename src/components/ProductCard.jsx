import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../styles/Productos.css'

function ProductCard({
  id,
  nombre,
  categoria,
  descripcion,
  precio,
  imagen,
  stock,
  onAgregar,
}) {
  const agotado = stock === 0

  return (
    <Card className="product-card h-100">
      <Card.Img
        variant="top"
        src={imagen}
        alt={nombre}
        loading="lazy"
      />

      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3">{nombre}</Card.Title>

        <p className="producto-categoria">{categoria}</p>

        <Card.Text className="producto-descripcion">
          {descripcion}
        </Card.Text>

        <p className="producto-precio">
          ${precio.toLocaleString('es-CL')}
        </p>

        <div className="producto-acciones mt-auto">
          <Button
            as={Link}
            to={`/productos/${id}`}
            className="producto-btn-detalle"
            variant="light"
          >
            Ver Detalle
          </Button>

          <Button
            className="producto-btn-agregar"
            variant="primary"
            onClick={onAgregar}
            disabled={agotado}
          >
            {agotado ? 'Agotado' : 'Añadir al carrito'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductCard