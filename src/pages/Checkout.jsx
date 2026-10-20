import { Navigate, Link } from 'react-router-dom'
import {
  aplicarDescuento,
  calcularTotales,
  formatearPrecio,
} from '../utils/precios'

function Checkout({ carrito, descuento = 0 }) {
  // Si el carrito está vacío, vuelve al carrito.
  if (carrito.length === 0) {
    return <Navigate to="/carrito" replace />
  }

  const { subtotal, ahorro, total } = calcularTotales(carrito, descuento)

  return (
    <section>
      <h2>Resumen de compra</h2>

      <ul>
        {carrito.map(producto => (
          <li key={producto.id}>
            {producto.nombre} × {producto.cantidad}
            {' — '}
            {formatearPrecio(
              aplicarDescuento(producto.precio, descuento) * producto.cantidad
            )}
          </li>
        ))}
      </ul>

      {ahorro > 0 && (
        <>
          <p>Subtotal: {formatearPrecio(subtotal)}</p>
          <p>
            Descuento ({descuento}%): -{formatearPrecio(ahorro)}
          </p>
        </>
      )}

      <p>
        <strong>Total: {formatearPrecio(total)}</strong>
      </p>

      <p>Revisa tus productos antes de continuar con la compra.</p>

      <Link to="/carrito">Volver al carrito</Link>
    </section>
  )
}

export default Checkout