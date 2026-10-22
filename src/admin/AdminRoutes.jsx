import { useState } from 'react'
import {
  Navigate,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom'
import {
  puedeEntrarAlPanel,
  obtenerUsuarioActivo,
} from '../data/db'
import { Navbar, Nav, Container } from 'react-bootstrap'

import OrdersAdmin from './pages/OrdersAdmin'
import UsersAdmin from './pages/UsersAdmin'
import AdminProfile from './pages/AdminProfile'
import { ProductsAdmin } from '../pages/ProductsAdmin'

export function AdminRoutes() {
  const autorizado = puedeEntrarAlPanel()
  const usuario = obtenerUsuarioActivo()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  if (!autorizado) {
    return <Navigate to="/login" replace />
  }

  function cerrarMenu() {
    setExpanded(false)
  }

  function claseEnlace(seccion) {
    const activo = location.pathname.startsWith(`/admin/${seccion}`)
    return `fw-semibold ${activo ? 'text-primary' : 'text-dark'}`
  }

  return (
    <div>
      <Navbar
        bg="white"
        expand="md"
        expanded={expanded}
        onToggle={setExpanded}
        className="shadow-sm mb-4 py-3 border-bottom"
      >
        <Container>
          <Navbar.Brand
            className="fw-bold"
            style={{ color: '#5c3d2e' }}
          >
            🍰 Panel Admin ({usuario?.tipo || usuario?.rol || 'Admin'})
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="admin-navbar"
            aria-label="Abrir menú de administración"
          />

          <Navbar.Collapse
            id="admin-navbar"
            className="justify-content-end"
          >
            <Nav className="align-items-center gap-3">
              <Nav.Link
                as={Link}
                to="/admin/ordenes"
                onClick={cerrarMenu}
                className={claseEnlace('ordenes')}
              >
                📋 Órdenes
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/productos"
                onClick={cerrarMenu}
                className={claseEnlace('productos')}
              >
                🍰 Productos
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/usuarios"
                onClick={cerrarMenu}
                className={claseEnlace('usuarios')}
              >
                👥 Usuarios
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/perfil"
                onClick={cerrarMenu}
                className={claseEnlace('perfil')}
              >
                👤 Perfil
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/"
                onClick={cerrarMenu}
                className="text-danger fw-semibold ms-md-3"
              >
                ← Volver a la Tienda
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route
          index
          element={<Navigate to="/admin/ordenes" replace />}
        />

        <Route path="ordenes" element={<OrdersAdmin />} />
        <Route path="productos" element={<ProductsAdmin />} />
        <Route path="usuarios" element={<UsersAdmin />} />
        <Route path="perfil" element={<AdminProfile />} />

        <Route
          path="*"
          element={
            <Container className="my-4">
              <h2>Página del panel no encontrada</h2>
              <Link to="/admin/ordenes">Volver a Órdenes</Link>
            </Container>
          }
        />
      </Routes>
    </div>
  )
}

export default AdminRoutes