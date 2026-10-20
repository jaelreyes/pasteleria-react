import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { obtenerUsuarioActivo } from '../../data/db';

export function AdminProfile() {
  const usuario = obtenerUsuarioActivo() || {
    nombre: 'Administrador Demo',
    email: 'admin@duoc.cl',
    rol: 'admin'
  };

  return (
    <Container className="my-5" style={{ maxWidth: '700px' }}>
      <Row className="mb-4">
        <Col>
          <h2 style={{ color: '#5c3d2e', fontWeight: 'bold' }}>Perfil de Administrador</h2>
          <p className="text-muted">Información de la cuenta y permisos actuales en el sistema.</p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 p-4 bg-white">
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3 shadow-sm"
              style={{ width: '70px', height: '70px', background: '#8d5524', fontSize: '1.8rem' }}
            >
              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h4 className="mb-1 fw-bold" style={{ color: '#5c3d2e' }}>{usuario.nombre}</h4>
              <p className="text-muted mb-1">{usuario.email || usuario.correo}</p>
              <Badge bg="danger" className="text-uppercase px-2 py-1">
                {usuario.rol || usuario.tipo || 'Administrador'}
              </Badge>
            </div>
          </div>

          <hr className="my-4 text-muted" />

          <h5 className="mb-3" style={{ color: '#5c3d2e' }}>Detalles de Acceso y Seguridad</h5>
          <Row className="g-3">
            <Col md={6}>
              <div className="p-3 bg-light rounded shadow-sm">
                <small className="text-muted d-block">Nivel de Permisos</small>
                <strong>Acceso Total (CRUD)</strong>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded shadow-sm">
                <small className="text-muted d-block">Módulos Habilitados</small>
                <strong>Usuarios, Órdenes, Productos</strong>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminProfile;