import { Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  calcularPrecioProducto,
  calcularTotales,
  formatearPrecio,
} from "../utils/precios";
import "../styles/Cart.css";

function Cart({
  carrito,
  descuento = 0,
  onVaciar,
  onEliminar,
  onContinuar,
  onCambiarCantidad,
}) {
  const { subtotal, ahorro, total } = calcularTotales(
    carrito,
    descuento
  );

  const cantidadTotal = carrito.reduce(
    (suma, producto) => suma + producto.cantidad,
    0
  );

  return (
    <section className="carrito">
      <h2>Tu carrito</h2>

      {descuento > 0 && carrito.length > 0 && (
        <Alert
          variant="success"
          className="carrito-aviso-descuento"
        >
          Tu beneficio de usuario es del <strong>{descuento}%</strong>.
          {" "}
          En cada producto se aplica el mayor descuento entre
          su oferta y tu beneficio.
        </Alert>
      )}

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <h3>Tu carrito está vacío</h3>
          <p>Descubre nuestros productos y encuentra tu favorito.</p>

          <Link
            to="/productos"
            className="btn carrito-btn-continuar"
            onClick={onContinuar}
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="carrito-layout">
          <div className="carrito-productos">
            <ul className="carrito-lista">
              {carrito.map((producto) => {
                const {
                  precioBase,
                  descuento: descuentoAplicado,
                  precioFinal,
                } = calcularPrecioProducto(producto, descuento);

                return (
                  <li key={producto.id} className="carrito-item">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="carrito-imagen"
                    />

                    <div className="carrito-info">
                      <h3>{producto.nombre}</h3>

                      <p className="carrito-categoria">
                        {producto.categoria}
                      </p>

                      <p className="carrito-precio">
                        {descuentoAplicado > 0 ? (
                          <>
                            <del className="carrito-precio-original">
                              {formatearPrecio(precioBase)}
                            </del>
                            {" "}
                            <strong>
                              {formatearPrecio(precioFinal)}
                            </strong>
                            {" "}
                            <span className="carrito-descuento">
                              -{descuentoAplicado}%
                            </span>
                          </>
                        ) : (
                          formatearPrecio(precioBase)
                        )}
                      </p>
                    </div>

                    <div
                      className="carrito-cantidad"
                      role="group"
                      aria-label={`Cantidad de ${producto.nombre}`}
                    >
                      <button
                        type="button"
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
                      </button>

                      <span aria-live="polite">
                        {producto.cantidad}
                      </span>

                      <button
                        type="button"
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
                      </button>
                    </div>

                    <p className="carrito-subtotal">
                      <small>Subtotal</small>
                      {formatearPrecio(
                        precioFinal * producto.cantidad
                      )}
                    </p>

                    <button
                      type="button"
                      className="carrito-eliminar"
                      onClick={() => onEliminar(producto.id)}
                      aria-label={`Eliminar ${producto.nombre}`}
                    >
                      Eliminar
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="carrito-productos-acciones">
              <Link to="/productos" onClick={onContinuar}>
                ← Seguir comprando
              </Link>

              <button
                type="button"
                className="carrito-vaciar"
                onClick={onVaciar}
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          <aside
            className="carrito-resumen"
            aria-label="Resumen de compra"
          >
            <h3>Resumen de compra</h3>

            <p className="carrito-linea">
              Productos
              <span>{cantidadTotal}</span>
            </p>

            <p className="carrito-linea">
              Subtotal sin descuentos
              <span>{formatearPrecio(subtotal)}</span>
            </p>

            {ahorro > 0 && (
              <p className="carrito-linea carrito-ahorro">
                Ahorro total
                <span>-{formatearPrecio(ahorro)}</span>
              </p>
            )}

            <p className="carrito-total">
              Total
              <strong>{formatearPrecio(total)}</strong>
            </p>

            <Button
              as={Link}
              to="/checkout"
              className="carrito-btn-continuar"
              variant="primary"
              onClick={onContinuar}
            >
              Continuar compra
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;