import { useState, useRef } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import {
  obtenerUsuarioActivo,
  guardarOrden,
  obtenerOrdenPorId,
} from '../data/db'
import {
  calcularTotales,
  calcularPrecioProducto,
  formatearPrecio,
} from '../utils/precios'
import { validarTelefono } from '../utils/validaciones'

export default function Checkout({
  carrito,
  descuento = 0,
  onCompraConfirmada,
}) {
  const navigate = useNavigate()
  const procesandoRef = useRef(false)

  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)

  const [formData, setFormData] = useState(() => {
    const usuario = obtenerUsuarioActivo()

    return {
      nombre: usuario
        ? `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim()
        : '',
      email: usuario?.correo || usuario?.email || '',
      telefono: usuario?.telefono || '',
      direccion: usuario?.direccion || '',
      metodoPago: 'webpay',
    }
  })

  const { subtotal, ahorro, total } = calcularTotales(
    carrito,
    descuento
  )

  // Impide entrar directamente si no hay productos.
  if (carrito.length === 0) {
    return <Navigate to="/carrito" replace />
  }

  function handleChange(evento) {
    const { name, value } = evento.target

    setFormData(actual => ({
      ...actual,
      [name]: value,
    }))

    setError('')
  }

  function handleSubmit(evento) {
    evento.preventDefault()

    // Evita guardar dos órdenes por clics consecutivos.
    if (procesandoRef.current) return

    const nombre = formData.nombre.trim()
    const email = formData.email.trim().toLowerCase()
    const telefono = formData.telefono.trim()
    const direccion = formData.direccion.trim()

    if (!nombre || !email || !telefono || !direccion) {
      setError('Completa todos los campos obligatorios de despacho.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    if (!validarTelefono(telefono)) {
      setError('Ingresa un teléfono válido de 8 a 15 dígitos.')
      return
    }

    procesandoRef.current = true
    setProcesando(true)
    setError('')

    try {
      const nuevaOrden = {
        id: `ORD-${crypto.randomUUID()}`,
        nombre,
        email,
        telefono,
        direccion,
        metodoPago: formData.metodoPago,
        fecha: new Date().toISOString(),
        estado: 'completado',
        pagoSimulado: true,
        descuentoUsuario: descuento,
        subtotal,
        ahorro,
        total,

        // Conserva una copia de los productos y precios de esta compra.
        productos: carrito.map(producto => {
          const {
            precioBase,
            precioFinal,
            descuento: descuentoAplicado,
          } = calcularPrecioProducto(producto, descuento)

          return {
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            imagen: producto.imagen,
            cantidad: producto.cantidad,
            precioBase,
            precioFinal,
            descuentoAplicado,
          }
        }),
      }

      guardarOrden(nuevaOrden)

      // guardarOrden captura sus errores: verificamos que se haya guardado.
      const ordenGuardada = obtenerOrdenPorId(nuevaOrden.id)

      if (!ordenGuardada) {
        throw new Error('No se pudo guardar la orden.')
      }

      onCompraConfirmada()

      navigate(`/pago/exito/${nuevaOrden.id}`, {
        replace: true,
      })
    } catch {
      setError(
        'No se pudo completar la compra. Revisa el carrito antes de volver a intentarlo.'
      )
      procesandoRef.current = false
      setProcesando(false)
    }
  }

  return (
    <section
      className="container my-5"
      style={{ maxWidth: '700px' }}
    >
      <h1 className="mb-4" style={{ color: '#5c3d2e' }}>
        Finalizar compra
      </h1>

      <Alert variant="info">
        Pago simulado para el proyecto académico. No se realiza
        ningún cobro real.
      </Alert>

      <div className="p-4 bg-white shadow-sm rounded mb-4">
        <h2 className="h4">Resumen de compra</h2>

        <ul>
          {carrito.map(producto => {
            const { precioFinal } = calcularPrecioProducto(
              producto,
              descuento
            )

            return (
              <li key={producto.id}>
                {producto.nombre} × {producto.cantidad}
                {' — '}
                {formatearPrecio(precioFinal * producto.cantidad)}
              </li>
            )
          })}
        </ul>

        <p>
          Subtotal sin descuentos: {formatearPrecio(subtotal)}
        </p>

        {ahorro > 0 && (
          <p className="text-success">
            Ahorro total: {formatearPrecio(ahorro)}
          </p>
        )}

        <p className="fs-5 mb-0">
          <strong>Total: {formatearPrecio(total)}</strong>
        </p>
      </div>

      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}

      <Form
        noValidate
        onSubmit={handleSubmit}
        className="p-4 bg-white shadow-sm rounded"
      >
        <fieldset disabled={procesando}>
          <legend className="h4">Datos de despacho</legend>

          <Form.Group className="mb-3" controlId="checkout-nombre">
            <Form.Label>Nombre y apellidos *</Form.Label>
            <Form.Control
              name="nombre"
              autoComplete="name"
              maxLength={150}
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkout-email">
            <Form.Label>Correo electrónico *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              autoComplete="email"
              maxLength={100}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkout-telefono">
            <Form.Label>Teléfono *</Form.Label>
            <Form.Control
              type="tel"
              name="telefono"
              autoComplete="tel"
              maxLength={20}
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkout-direccion">
            <Form.Label>Dirección de despacho *</Form.Label>
            <Form.Control
              name="direccion"
              autoComplete="street-address"
              maxLength={300}
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="checkout-pago">
            <Form.Label>Medio de pago simulado</Form.Label>
            <Form.Select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
            >
              <option value="webpay">Webpay</option>
              <option value="transferencia">Transferencia</option>
            </Form.Select>
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
            style={{ background: '#8d5524', border: 'none' }}
          >
            {procesando ? 'Procesando...' : 'Confirmar compra simulada'}
          </Button>
        </fieldset>
      </Form>

      <p className="mt-3">
        <Link to="/carrito">Volver al carrito</Link>
      </p>
    </section>
  )
}