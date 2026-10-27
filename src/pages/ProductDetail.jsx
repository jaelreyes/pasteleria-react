import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button, Alert, Form } from 'react-bootstrap'
import {
  calcularPrecioProducto,
  formatearPrecio,
} from '../utils/precios'
import '../styles/ProductDetail.css'

// Detalle de un producto (/productos/:id) con selector de cantidad.
function ProductDetail({
  productos,
  onAgregar,
  carrito,
  descuentoUsuario = 0,
}) {
  const { id } = useParams()
  const navegar = useNavigate()
  const [cantidad, setCantidad] = useState('1')

  // El id de la URL es texto, por eso se convierte a número.
  const producto = productos.find(
    producto => producto.id === Number(id)
  )

  if (!producto) {
    return (
      <section>
        <Alert variant="warning">
          Producto no encontrado.
        </Alert>

        <Link to="/productos">Volver al catálogo</Link>
      </section>
    )
  }

  // Aplica el mayor descuento entre la oferta y el beneficio del usuario.
  const { precioBase, precioFinal, descuento } =
    calcularPrecioProducto(producto, descuentoUsuario)

  const itemEnCarrito = carrito.find(
    item => item.id === producto.id
  )

  const cantidadEnCarrito = itemEnCarrito
    ? itemEnCarrito.cantidad
    : 0

  // Unidades que aún se pueden agregar (stock menos lo que ya está en el carrito).
  const disponibles = Math.max(
    0,
    producto.stock - cantidadEnCarrito
  )

  const cantidadNumero = Number(cantidad)

  // La cantidad debe ser entera, mínimo 1 y sin pasar lo disponible.
  const cantidadValida =
    Number.isInteger(cantidadNumero) &&
    cantidadNumero >= 1 &&
    cantidadNumero <= disponibles

  function agregarYVerCarrito(evento) {
    evento.preventDefault()

    if (!cantidadValida) return

    // Envía el producto con su precio base para evitar descuentos dobles.
    onAgregar(producto, cantidadNumero)
    navegar('/carrito')
  }

  return (
    <section className="detalle-producto">
      <figure className="detalle-producto-imagen">
        <img
          src={producto.imagen}
          alt={producto.nombre}
        />
      </figure>

      <div className="detalle-producto-info">
        <span className="detalle-producto-categoria">
          {producto.categoria}
        </span>

        <h1>{producto.nombre}</h1>

        <div className="detalle-producto-precios">
          {descuento > 0 && (
            <p className="detalle-precio-anterior">
              <del>{formatearPrecio(precioBase)}</del>
              {' '}
              <span className="detalle-descuento">
                -{descuento}%
              </span>
            </p>
          )}

          <p className="detalle-producto-precio">
            {formatearPrecio(precioFinal)}
          </p>
        </div>

        <p className="detalle-producto-descripcion">
          {producto.descripcion}
        </p>

        <p>
          Stock disponible: <strong>{producto.stock}</strong> unidades
        </p>

        {/* Sin unidades disponibles se muestra un aviso en vez del formulario */}
        {disponibles === 0 ? (
          <Alert variant="warning">
            {producto.stock === 0
              ? 'Este producto está agotado.'
              : 'Ya tienes todas las unidades disponibles en tu carrito.'}
          </Alert>
        ) : (
          <Form onSubmit={agregarYVerCarrito} noValidate>
            <Form.Group
              className="mb-3"
              controlId="cantidad-producto"
            >
              <Form.Label>Cantidad</Form.Label>

              <Form.Control
                className="detalle-cantidad"
                type="number"
                min={1}
                max={disponibles}
                step={1}
                value={cantidad}
                onChange={evento =>
                  setCantidad(evento.target.value)
                }
                isInvalid={!cantidadValida}
                required
              />

              <Form.Control.Feedback type="invalid">
                Ingresa un número entero entre 1 y {disponibles}.
              </Form.Control.Feedback>

              <Form.Text>
                Puedes agregar hasta {disponibles} unidades.
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="detalle-btn-agregar"
              disabled={!cantidadValida}
            >
              Añadir al carrito
            </Button>
          </Form>
        )}

        <div className="detalle-producto-acciones">
          <Button
            as={Link}
            to="/productos"
            variant="outline-secondary"
            className="detalle-btn-volver"
          >
            Volver a productos
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ProductDetail