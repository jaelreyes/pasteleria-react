import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import {
  aplicarDescuento,
  calcularTotales,
  formatearPrecio,
} from '../utils/precios'
import { crearPedido, guardarPedido } from '../utils/pedidos'

function Checkout({ carrito, descuento = 0, onCompraConfirmada }) {
  const [compraConfirmada, setCompraConfirmada] = useState(false)

  // Después de confirmar, muestra el seguimiento del pedido.
  if (compraConfirmada) {
    return <Navigate to="/pedido" replace />
  }

  // Si el carrito está vacío, vuelve al carrito.
  if (carrito.length === 0) {
    return <Navigate to="/carrito" replace />
  }

  const { subtotal, ahorro, total } = calcularTotales(carrito, descuento)

  function confirmarCompra() {
    const confirmado = window.confirm(
      `¿Confirmas tu compra por ${formatearPrecio(total)}?`
    )

    if (!confirmado) return

    guardarPedido(crearPedido(carrito, descuento))
    setCompraConfirmada(true)
    onCompraConfirmada()
  }

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

      <p>Revisa tus productos antes de confirmar la compra.</p>

      <div className="d-flex flex-wrap gap-3 align-items-center">
        <Button
          className="carrito-btn-continuar"
          onClick={confirmarCompra}
        >
          Confirmar compra
        </Button>

        <Link to="/carrito">Volver al carrito</Link>
      </div>
    </section>
  )
}

export default Checkout