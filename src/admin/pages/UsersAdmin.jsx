import { useState } from 'react';
import { obtenerUsuarios, eliminarUsuario } from '../../data/db';
import { Table, Button, Form, Container, Row, Col, Card, Badge, Modal } from 'react-bootstrap';

export function UsersAdmin() {
  const [usuarios, setUsuarios] = useState(() => obtenerUsuarios());
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [criterioOrden, setCriterioOrden] = useState({ campo: 'nombre', direccion: 'asc' });

  // Estados para el Modal de Edición de Rol
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('cliente');

  const handleEliminar = (email) => {
    eliminarUsuario(email);
    setUsuarios(obtenerUsuarios());
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setNuevoRol(usuario.rol || usuario.tipo || 'cliente');
    setShowModal(true);
  };

  const guardarCambioRol = () => {
    if (!usuarioEditando) return;
    const emailTarget = usuarioEditando.email || usuarioEditando.correo;
    
    let listaUsuarios = obtenerUsuarios();
    listaUsuarios = listaUsuarios.map(u => {
      const emailU = u.email || u.correo;
      if (emailU === emailTarget) {
        return { ...u, rol: nuevoRol, tipo: nuevoRol.charAt(0).toUpperCase() + nuevoRol.slice(1) };
      }
      return u;
    });

    localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));
    setUsuarios(listaUsuarios);
    setShowModal(false);
  };

  const ordenarPor = (campo) => {
    let direccion = 'asc';
    if (criterioOrden.campo === campo && criterioOrden.direccion === 'asc') {
      direccion = 'desc';
    }
    setCriterioOrden({ campo, direccion });
  };

  // Filtrado
  const usuariosFiltrados = usuarios.filter(u => {
    const textoBusqueda = (u.email || u.correo || '').toLowerCase() + ' ' + (u.nombre || '').toLowerCase();
    const coincideTexto = textoBusqueda.includes(busqueda.toLowerCase());
    
    const rolUsuario = (u.rol || u.tipo || '').toLowerCase();
    const coincideRol = filtroRol === '' || rolUsuario === filtroRol.toLowerCase();

    return coincideTexto && coincideRol;
  });

  // Ordenamiento
  const usuariosOrdenados = usuariosFiltrados.sort((a, b) => {
    let valorA = '';
    let valorB = '';

    if (criterioOrden.campo === 'nombre') {
      valorA = (a.nombre || '').toLowerCase();
      valorB = (b.nombre || '').toLowerCase();
    } else if (criterioOrden.campo === 'correo') {
      valorA = (a.email || a.correo || '').toLowerCase();
      valorB = (b.email || b.correo || '').toLowerCase();
    } else if (criterioOrden.campo === 'rol') {
      valorA = (a.rol || a.tipo || '').toLowerCase();
      valorB = (b.rol || b.tipo || '').toLowerCase();
    }

    if (valorA < valorB) return criterioOrden.direccion === 'asc' ? -1 : 1;
    if (valorA > valorB) return criterioOrden.direccion === 'asc' ? 1 : -1;
    return 0;
  });

  const obtenerFlecha = (campo) => {
    if (criterioOrden.campo !== campo) return ' ↕';
    return criterioOrden.direccion === 'asc' ? ' ▲' : ' ▼';
  };

  // Estadísticas (KPIs)
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter(u => (u.rol || u.tipo || '').toLowerCase() === 'admin').length;
  const totalVendedores = usuarios.filter(u => (u.rol || u.tipo || '').toLowerCase() === 'vendedor').length;
  const totalClientes = usuarios.filter(u => (u.rol || u.tipo || '').toLowerCase() === 'cliente').length;

  return (
    <Container className="my-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: '#5c3d2e', fontWeight: 'bold' }}>Gestión de Usuarios</h2>
          <p className="text-muted">Panel de control avanzado para la administración de cuentas y accesos.</p>
        </Col>
      </Row>

      {/* Tarjetas de Estadísticas (KPIs) */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Total Usuarios</h6>
            <h3 className="fw-bold mb-0" style={{ color: '#5c3d2e' }}>{totalUsuarios}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Administradores</h6>
            <h3 className="fw-bold mb-0 text-danger">{totalAdmins}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Vendedores</h6>
            <h3 className="fw-bold mb-0 text-warning">{totalVendedores}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Clientes</h6>
            <h3 className="fw-bold mb-0 text-secondary">{totalClientes}</h3>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4 p-3">
        <Row className="g-3">
          <Col md={8}>
            <Form.Control 
              type="text" 
              placeholder="🔍 Buscar por correo o nombre de usuario..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select 
              value={filtroRol} 
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Filtrar por todos los roles</option>
              <option value="admin">Admin</option>
              <option value="vendedor">Vendedor</option>
              <option value="cliente">Cliente</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover striped className="mb-0 align-middle">
            <thead style={{ background: '#f8f9fa', color: '#5c3d2e', cursor: 'pointer' }}>
              <tr>
                <th className="py-3 px-4" onClick={() => ordenarPor('nombre')}>
                  Nombre{obtenerFlecha('nombre')}
                </th>
                <th className="py-3" onClick={() => ordenarPor('correo')}>
                  Correo Electrónico{obtenerFlecha('correo')}
                </th>
                <th className="py-3" onClick={() => ordenarPor('rol')}>
                  Rol{obtenerFlecha('rol')}
                </th>
                <th className="py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">No se encontraron usuarios con esos filtros.</td>
                </tr>
              ) : (
                usuariosOrdenados.map((u, idx) => (
                  <tr key={idx}>
                    <td className="px-4 fw-bold">{u.nombre}</td>
                    <td>{u.email || u.correo}</td>
                    <td>
                      <Badge bg={u.rol === 'admin' || u.tipo === 'Admin' ? 'danger' : u.rol === 'vendedor' || u.tipo === 'Vendedor' ? 'warning' : 'secondary'}>
                        {u.rol || u.tipo}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => abrirModalEditar(u)}
                      >
                        Editar Rol
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleEliminar(u.email || u.correo)}
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
        <Card.Footer className="bg-white text-muted small py-3 px-4">
          Mostrando {usuariosOrdenados.length} de {usuarios.totalUsuarios || usuarios.length} usuarios registrados.
        </Card.Footer>
      </Card>

      {/* Modal para Editar Rol */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#5c3d2e' }}>Modificar Rol de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioEditando && (
            <div>
              <p>Estás cambiando el rol para: <strong>{usuarioEditando.nombre}</strong></p>
              <Form.Group className="mb-3">
                <Form.Label>Selecciona el nuevo rol:</Form.Label>
                <Form.Select 
                  value={nuevoRol} 
                  onChange={(e) => setNuevoRol(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="cliente">Cliente</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button style={{ background: '#8d5524', border: 'none' }} onClick={guardarCambioRol}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UsersAdmin;