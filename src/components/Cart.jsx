import { Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../styles/Cart.css'

function Cart({
  carrito,
  onVaciar,
  onEliminar,
  onContinuar,
  onCambiarCantidad,
}) {
  const total = carrito.reduce(
    (suma, producto) => suma + producto.precio * producto.cantidad,
    0
  )

  return (
    <section className="carrito">
      <h2>Tu carrito</h2>

      {carrito.length === 0 ? (
        <Alert variant="info">
          Tu carrito está vacío.
          {' '}
          <Link to="/productos" onClick={onContinuar}>
            Explorar productos
          </Link>
        </Alert>
      ) : (
        <ul className="carrito-lista">
          {carrito.map(producto => (
            <li key={producto.id} className="carrito-item">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="carrito-imagen"
              />

              <div className="carrito-info">
                <h3>{producto.nombre}</h3>

                <p className="carrito-precio">
                  Precio unitario: $
                  {producto.precio.toLocaleString('es-CL')}
                </p>

                <div
                  className="carrito-cantidad"
                  role="group"
                  aria-label={`Cantidad de ${producto.nombre}`}
                >
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={producto.cantidad <= 1}
                    onClick={() =>
                      onCambiarCantidad(
                        producto.id,
                        producto.cantidad - 1
                      )
                    }
                    aria-label={`Disminuir cantidad de ${producto.nombre}`}
                  >
                    −
                  </Button>

                  <span aria-live="polite">
                    {producto.cantidad}
                  </span>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={producto.cantidad >= producto.stock}
                    onClick={() =>
                      onCambiarCantidad(
                        producto.id,
                        producto.cantidad + 1
                      )
                    }
                    aria-label={`Aumentar cantidad de ${producto.nombre}`}
                  >
                    +
                  </Button>
                </div>

                <p className="carrito-subtotal">
                  Subtotal: $
                  {(producto.precio * producto.cantidad).toLocaleString('es-CL')}
                </p>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onEliminar(producto.id)}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="carrito-resumen">
        <p className="carrito-total">
          Total: <strong>${total.toLocaleString('es-CL')}</strong>
        </p>

        <div className="carrito-acciones">
          <Button
            variant="outline-danger"
            onClick={onVaciar}
            disabled={carrito.length === 0}
          >
            Vaciar carrito
          </Button>

          <Button
            as={Link}
            to="/checkout"
            className="carrito-btn-continuar"
            variant="primary"
            disabled={carrito.length === 0}
            onClick={onContinuar}
          >
            Continuar compra
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Cart