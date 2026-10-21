import { Card, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatearPrecio } from '../utils/precios'
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
  precioAnterior,
  descuento = 0,
}) {
  const agotado = Number(stock) <= 0
  const tieneDescuento =
    descuento > 0 && Number(precioAnterior) > Number(precio)

  return (
    <Card className="product-card h-100 position-relative">
      {tieneDescuento && (
        <Badge bg="danger" className="producto-badge-oferta">
          -{descuento}%
        </Badge>
      )}

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
          {formatearPrecio(precio)}

          {tieneDescuento && (
            <del className="producto-precio-anterior">
              {formatearPrecio(precioAnterior)}
            </del>
          )}
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