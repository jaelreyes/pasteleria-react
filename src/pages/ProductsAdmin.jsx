import { useState, useRef } from 'react'
import {
  obtenerProductos,
  guardarProducto,
  eliminarProducto,
  obtenerCategorias,
} from '../data/db'
import {
  Table,
  Button,
  Form,
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
} from 'react-bootstrap'

const formularioInicial = {
  id: '',
  nombre: '',
  precio: '',
  stock: '',
  categoria: '',
  descuento: 0,
}

export const ProductsAdmin = () => {
  const [productos, setProductos] = useState(() => obtenerProductos())
  const [form, setForm] = useState(formularioInicial)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [soloCriticos, setSoloCriticos] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const formularioRef = useRef(null)
  const nombreRef = useRef(null)

  // Incluye las categorías guardadas en los productos originales.
  const categorias = [
    ...new Set([
      ...obtenerCategorias(),
      ...productos.map(producto => producto.categoria),
    ]),
  ].filter(Boolean)

  function cargarDatos() {
    setProductos(obtenerProductos())
  }

  function limpiarFormulario() {
    setForm({ ...formularioInicial })
    setModoEdicion(false)
    setError('')
  }

  function handleChange(evento) {
    const { name, value } = evento.target

    setForm(actual => ({
      ...actual,
      [name]: value,
    }))

    setError('')
    setMensaje('')
  }

  function handleEditar(producto) {
    // Copia también código, imagen y descripción para conservarlos.
    setForm({
      ...producto,
      nombre: producto.nombre || '',
      precio: producto.precio ?? '',
      stock: producto.stock ?? '',
      categoria: producto.categoria || '',
      descuento: producto.descuento ?? 0,
    })

    setModoEdicion(true)
    setError('')
    setMensaje('')

    formularioRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    nombreRef.current?.focus({ preventScroll: true })
  }

  function handleEliminar(id) {
    eliminarProducto(id)

    if (form.id === id) {
      limpiarFormulario()
    }

    cargarDatos()
    setMensaje('')
  }

  function handleSubmit(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (
      !form.nombre.trim() ||
      form.precio === '' ||
      form.stock === '' ||
      !form.categoria
    ) {
      setError('Completa nombre, precio, stock y categoría.')
      return
    }

    const precio = Number(form.precio)
    const stock = Number(form.stock)
    const descuento = Number(form.descuento || 0)

    if (!Number.isFinite(precio) || precio < 0) {
      setError('El precio debe ser un número mayor o igual a cero.')
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('El stock debe ser un número entero mayor o igual a cero.')
      return
    }

    if (
      !Number.isInteger(descuento) ||
      descuento < 0 ||
      descuento > 100
    ) {
      setError('El descuento debe ser un número entero entre 0 y 100.')
      return
    }

    const productoGuardar = {
      ...form,
      nombre: form.nombre.trim(),
      precio,
      stock,
      descuento,
    }

    guardarProducto(productoGuardar)

    // Verifica la persistencia porque guardarProducto captura sus errores.
    const guardado = obtenerProductos().find(
      producto => producto.id === productoGuardar.id
    )

    if (
      !guardado ||
      guardado.nombre !== productoGuardar.nombre ||
      Number(guardado.precio) !== precio ||
      Number(guardado.stock) !== stock ||
      Number(guardado.descuento || 0) !== descuento ||
      guardado.categoria !== productoGuardar.categoria
    ) {
      setError('No se pudo guardar el producto. Revisa el almacenamiento.')
      return
    }

    const estabaEditando = modoEdicion

    limpiarFormulario()
    cargarDatos()

    setMensaje(
      estabaEditando
        ? 'Producto actualizado correctamente.'
        : 'Producto creado correctamente.'
    )
  }

  const productosMostrados = soloCriticos
    ? productos.filter(producto => Number(producto.stock) < 5)
    : productos

  const totalProductos = productos.length

  const stockCriticoCount = productos.filter(
    producto => Number(producto.stock) < 5
  ).length

  return (
    <Container className="my-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: '#5c3d2e', fontWeight: 'bold' }}>
            Gestión de Productos
          </h2>

          <p className="text-muted">
            Control de inventario, precios, stock crítico y catálogo
            de la pastelería.
          </p>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">
              Total Productos en Catálogo
            </h6>

            <h3
              className="fw-bold mb-0"
              style={{ color: '#5c3d2e' }}
            >
              {totalProductos}
            </h3>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">
              Productos con Stock Crítico (&lt; 5)
            </h6>

            <h3 className="fw-bold mb-0 text-danger">
              {stockCriticoCount}
            </h3>
          </Card>
        </Col>
      </Row>

      <Card
        ref={formularioRef}
        className="shadow-sm border-0 mb-4 p-4"
        style={{ scrollMarginTop: '100px' }}
      >
        <h3
          className="h5 mb-3"
          style={{ color: '#5c3d2e' }}
        >
          {modoEdicion
            ? 'Editar Producto Existente'
            : 'Registrar Nuevo Producto'}
        </h3>

        {error && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}

        {mensaje && (
          <Alert variant="success" role="status">
            {mensaje}
          </Alert>
        )}

        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group controlId="admin-producto-nombre">
                <Form.Label>Nombre</Form.Label>

                <Form.Control
                  ref={nombreRef}
                  type="text"
                  name="nombre"
                  placeholder="Nombre del producto"
                  value={form.nombre}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="admin-producto-precio">
                <Form.Label>Precio</Form.Label>

                <Form.Control
                  type="number"
                  name="precio"
                  min={0}
                  step="any"
                  value={form.precio}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="admin-producto-stock">
                <Form.Label>Stock</Form.Label>

                <Form.Control
                  type="number"
                  name="stock"
                  min={0}
                  step={1}
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="admin-producto-descuento">
                <Form.Label>Descuento %</Form.Label>

                <Form.Control
                  type="number"
                  name="descuento"
                  min={0}
                  max={100}
                  step={1}
                  value={form.descuento}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="admin-producto-categoria">
                <Form.Label>Categoría</Form.Label>

                <Form.Select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione Categoría</option>

                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 text-end">
            {modoEdicion && (
              <Button
                type="button"
                variant="secondary"
                className="me-2"
                onClick={() => {
                  limpiarFormulario()
                  setMensaje('')
                }}
              >
                Cancelar
              </Button>
            )}

            <Button
              type="submit"
              style={{ background: '#8d5524', border: 'none' }}
            >
              {modoEdicion
                ? 'Actualizar Producto'
                : 'Guardar Producto'}
            </Button>
          </div>
        </Form>
      </Card>

      <div className="mb-3">
        <Button
          type="button"
          variant={soloCriticos ? 'danger' : 'outline-secondary'}
          onClick={() => setSoloCriticos(actual => !actual)}
        >
          {soloCriticos
            ? 'Ver Todos los Productos'
            : 'Filtrar por Stock Crítico'}
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table
            responsive
            hover
            striped
            className="mb-0 align-middle"
          >
            <thead style={{ background: '#f8f9fa', color: '#5c3d2e' }}>
              <tr>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3">Precio</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Descuento</th>
                <th className="py-3">Categoría</th>
                <th className="py-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosMostrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No hay productos para mostrar.
                  </td>
                </tr>
              ) : (
                productosMostrados.map(producto => (
                  <tr key={producto.id}>
                    <td className="px-4 fw-bold">
                      {producto.nombre}
                    </td>

                    <td className="text-success fw-bold">
                      ${Number(producto.precio).toLocaleString('es-CL')}
                    </td>

                    <td>
                      <span
                        className={
                          Number(producto.stock) < 5
                            ? 'text-danger fw-bold'
                            : ''
                        }
                      >
                        {producto.stock}

                        {Number(producto.stock) < 5 && (
                          <Badge bg="danger" className="ms-1">
                            Crítico
                          </Badge>
                        )}
                      </span>
                    </td>

                    <td>{Number(producto.descuento) || 0}%</td>

                    <td>
                      <Badge bg="secondary">
                        {producto.categoria}
                      </Badge>
                    </td>

                    <td className="text-center">
                      <Button
                        type="button"
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditar(producto)}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminar(producto.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ProductsAdmin