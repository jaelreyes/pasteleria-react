import { useState } from 'react';
import { Navigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { puedeEntrarAlPanel, obtenerUsuarioActivo } from '../data/db';
import { Navbar, Nav, Container } from 'react-bootstrap';

import OrdersAdmin from './pages/OrdersAdmin';
import UsersAdmin from './pages/UsersAdmin';
import AdminProfile from './pages/AdminProfile';

export function AdminRoutes() {
  const autorizado = puedeEntrarAlPanel();
  const usuario = obtenerUsuarioActivo();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar 
        bg="white" 
        expand="md" 
        expanded={expanded}
        className="shadow-sm mb-4 py-3 border-bottom"
      >
        <Container>
          <Navbar.Brand className="fw-bold" style={{ color: '#5c3d2e' }}>
            🍰 Panel Admin ({usuario?.tipo || usuario?.rol || 'Admin'})
          </Navbar.Brand>
          
          <Navbar.Toggle 
            aria-controls="admin-navbar" 
            onClick={() => setExpanded(expanded ? false : true)} 
          />
          
          <Navbar.Collapse id="admin-navbar" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              {/* Rutas absolutas con /admin/ para evitar el bucle */}
              <Nav.Link 
                as={Link} 
                to="/admin/ordenes" 
                onClick={() => setExpanded(false)}
                className={`fw-semibold ${location.pathname.includes('ordenes') ? 'text-primary' : 'text-dark'}`}
              >
                📋 Órdenes
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/usuarios" 
                onClick={() => setExpanded(false)}
                className={`fw-semibold ${location.pathname.includes('usuarios') ? 'text-primary' : 'text-dark'}`}
              >
                👥 Usuarios
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/perfil" 
                onClick={() => setExpanded(false)}
                className={`fw-semibold ${location.pathname.includes('perfil') ? 'text-primary' : 'text-dark'}`}
              >
                👤 Perfil
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/" 
                onClick={() => setExpanded(false)}
                className="text-danger fw-semibold ms-md-3"
              >
                ← Volver a la Tienda
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Navigate to="ordenes" replace />} />
        <Route path="ordenes" element={<OrdersAdmin />} />
        <Route path="usuarios" element={<UsersAdmin />} />
        <Route path="perfil" element={<AdminProfile />} />
      </Routes>
    </div>
  );
}

export default AdminRoutes;