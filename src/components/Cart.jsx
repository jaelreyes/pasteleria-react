import { Button, ListGroup, Alert } from 'react-bootstrap'

function Cart({ carrito, onVaciar, onEliminar }) {
  const total = carrito.reduce((suma, producto) => {
    return suma + producto.precio
  }, 0)

  return (
    <section>
      <h2>Tu carrito</h2>

      {carrito.length === 0 ? (
        <Alert variant="info">
          Tu carrito está vacío.
        </Alert>
      ) : (
        <ListGroup className="mb-3">
          {carrito.map((producto, indice) => (
            <ListGroup.Item
              key={indice}
              className="d-flex justify-content-between align-items-center gap-3"
            >
              <span>
                {producto.nombre} — $
                {producto.precio.toLocaleString('es-CL')}
              </span>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onEliminar(indice)}
              >
                Eliminar
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <p>
        <strong>Total: ${total.toLocaleString('es-CL')}</strong>
      </p>

      <Button
        variant="danger"
        onClick={onVaciar}
        disabled={carrito.length === 0}
      >
        Vaciar carrito
      </Button>
    </section>
  )
}

export default Cart