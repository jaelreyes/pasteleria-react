import { Navigate, Link } from 'react-router-dom'

function Checkout({ carrito }) {
  // Si el carrito está vacío, vuelve al carrito.
  if (carrito.length === 0) {
    return <Navigate to="/carrito" replace />
  }

  const total = carrito.reduce(
    (suma, producto) => suma + producto.precio * producto.cantidad,
    0
  )

  return (
    <section>
      <h2>Resumen de compra</h2>

      <ul>
        {carrito.map(producto => (
          <li key={producto.id}>
            {producto.nombre} × {producto.cantidad}
            {' — $'}
            {(producto.precio * producto.cantidad).toLocaleString('es-CL')}
          </li>
        ))}
      </ul>

      <p>
        <strong>Total: ${total.toLocaleString('es-CL')}</strong>
      </p>

      <p>Revisa tus productos antes de continuar con la compra.</p>

      <Link to="/carrito">Volver al carrito</Link>
    </section>
  )
}

export default Checkout