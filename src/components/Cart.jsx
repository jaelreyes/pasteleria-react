import { Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  aplicarDescuento,
  calcularTotales,
  formatearPrecio,
} from '../utils/precios'
import '../styles/Cart.css'

function Cart({
  carrito,
  descuento = 0,
  onVaciar,
  onEliminar,
  onContinuar,
  onCambiarCantidad,
}) {
  const { subtotal, ahorro, total } = calcularTotales(carrito, descuento)

  return (
    <section className="carrito">
      <h2>Tu carrito</h2>

      {descuento > 0 && carrito.length > 0 && (
        <Alert variant="success" className="carrito-aviso-descuento">
          Tienes un <strong>{descuento}% de descuento</strong> aplicado en
          todos tus productos.
        </Alert>
      )}

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
          {carrito.map(producto => {
            const precioFinal = aplicarDescuento(producto.precio, descuento)

            return (
              <li key={producto.id} className="carrito-item">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="carrito-imagen"
                />

                <div className="carrito-info">
                  <h3>{producto.nombre}</h3>

                  {descuento > 0 ? (
                    <p className="carrito-precio">
                      Precio unitario:{' '}
                      <span className="carrito-precio-original">
                        {formatearPrecio(producto.precio)}
                      </span>{' '}
                      <strong>{formatearPrecio(precioFinal)}</strong>{' '}
                      <span className="carrito-descuento">-{descuento}%</span>
                    </p>
                  ) : (
                    <p className="carrito-precio">
                      Precio unitario: {formatearPrecio(producto.precio)}
                    </p>
                  )}

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
                    Subtotal: {formatearPrecio(precioFinal * producto.cantidad)}
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
            )
          })}
        </ul>
      )}

      <div className="carrito-resumen">
        {ahorro > 0 && (
          <>
            <p className="carrito-linea">
              Subtotal: <span>{formatearPrecio(subtotal)}</span>
            </p>
            <p className="carrito-linea carrito-ahorro">
              Descuento ({descuento}%): <span>-{formatearPrecio(ahorro)}</span>
            </p>
          </>
        )}

        <p className="carrito-total">
          Total: <strong>{formatearPrecio(total)}</strong>
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