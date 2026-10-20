import { useState } from 'react';
import { obtenerProductos, guardarProducto, eliminarProducto, obtenerCategorias } from '../data/db';
import { Table, Button, Form, Container, Row, Col, Card, Badge } from 'react-bootstrap';

export const ProductsAdmin = () => {
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [categorias] = useState(() => obtenerCategorias());
  const [form, setForm] = useState({ id: '', nombre: '', precio: '', stock: '', categoria: '', descuento: 0 });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [soloCriticos, setSoloCriticos] = useState(false);

  const cargarDatos = () => {
    setProductos(obtenerProductos());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditar = (p) => {
    setForm(p);
    setModoEdicion(true);
  };

  const handleEliminar = (id) => {
    eliminarProducto(id);
    cargarDatos();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.stock) return;

    guardarProducto({
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      descuento: Number(form.descuento || 0)
    });

    setForm({ id: '', nombre: '', precio: '', stock: '', categoria: '', descuento: 0 });
    setModoEdicion(false);
    cargarDatos();
  };

  const productosMostrados = soloCriticos ? productos.filter(p => p.stock < 5) : productos;

  // Estadísticas de productos
  const totalProductos = productos.length;
  const stockCriticoCount = productos.filter(p => p.stock < 5).length;

  return (
    <Container className="my-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: '#5c3d2e', fontWeight: 'bold' }}>Gestión de Productos</h2>
          <p className="text-muted">Control de inventario, precios, stock crítico y catálogo de la pastelería.</p>
        </Col>
      </Row>

      {/* KPIs de Productos */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Total Productos en Catálogo</h6>
            <h3 className="fw-bold mb-0" style={{ color: '#5c3d2e' }}>{totalProductos}</h3>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Productos con Stock Crítico (&lt; 5)</h6>
            <h3 className="fw-bold mb-0 text-danger">{stockCriticoCount}</h3>
          </Card>
        </Col>
      </Row>

      {/* Formulario de Creación / Edición */}
      <Card className="shadow-sm border-0 mb-4 p-4">
        <h5 className="mb-3" style={{ color: '#5c3d2e' }}>
          {modoEdicion ? '✏️ Editar Producto Existente' : '➕ Registrar Nuevo Producto'}
        </h5>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control type="text" name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={handleChange} required />
            </Col>
            <Col md={2}>
              <Form.Control type="number" name="precio" placeholder="Precio ($)" value={form.precio} onChange={handleChange} required />
            </Col>
            <Col md={2}>
              <Form.Control type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required />
            </Col>
            <Col md={2}>
              <Form.Control type="number" name="descuento" placeholder="Descuento (%)" value={form.descuento} onChange={handleChange} />
            </Col>
            <Col md={3}>
              <Form.Select name="categoria" value={form.categoria} onChange={handleChange}>
                <option value="">Seleccione Categoría</option>
                {categorias.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
          </Row>
          <div className="mt-3 text-end">
            {modoEdicion && (
              <Button variant="secondary" className="me-2" onClick={() => { setModoEdicion(false); setForm({ id: '', nombre: '', precio: '', stock: '', categoria: '', descuento: 0 }); }}>
                Cancelar
              </Button>
            )}
            <Button type="submit" style={{ background: '#8d5524', border: 'none' }}>
              {modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
            </Button>
          </div>
        </Form>
      </Card>

      {/* Botón de Filtro Crítico */}
      <div className="mb-3">
        <Button 
          variant={soloCriticos ? 'danger' : 'outline-secondary'}
          onClick={() => setSoloCriticos(!soloCriticos)}
        >
          {soloCriticos ? 'Ver Todos los Productos' : '⚠️ Filtrar por Stock Crítico'}
        </Button>
      </div>

      {/* Tabla de Productos */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover striped className="mb-0 align-middle">
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
              {productosMostrados.map(p => (
                <tr key={p.id}>
                  <td className="px-4 fw-bold">{p.nombre}</td>
                  <td className="text-success fw-bold">${p.precio?.toLocaleString('es-CL')}</td>
                  <td>
                    <span className={p.stock < 5 ? 'text-danger fw-bold' : ''}>
                      {p.stock} {p.stock < 5 && <Badge bg="danger" className="ms-1">Crítico</Badge>}
                    </span>
                  </td>
                  <td>{p.descuento}%</td>
                  <td><Badge bg="secondary">{p.categoria}</Badge></td>
                  <td className="text-center">
                    <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEditar(p)}>Editar</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(p.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductsAdmin;