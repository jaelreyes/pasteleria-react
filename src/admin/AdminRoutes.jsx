import { useState } from "react";
import {
  Navigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  puedeEntrarAlPanel,
  obtenerUsuarioActivo,
} from "../data/db";
import { Navbar, Nav, Container } from "react-bootstrap";

import AdminHome from "./pages/AdminHome";
import OrdersAdmin from "./pages/OrdersAdmin";
import UsersAdmin from "./pages/UsersAdmin";
import AdminProfile from "./pages/AdminProfile";
import { ProductsAdmin } from "../pages/ProductsAdmin";
import UserCreateAdmin from "./pages/UserCreateAdmin";

export function AdminRoutes() {
  const usuario = obtenerUsuarioActivo();
  const autorizado = puedeEntrarAlPanel();
  const location = useLocation();

  const [expanded, setExpanded] = useState(false);

  const rol = String(usuario?.rol || usuario?.tipo || "")
    .trim()
    .toLowerCase();

  const esAdministrador =
    rol === "admin" || rol === "administrador";

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  function cerrarMenu() {
    setExpanded(false);
  }

  function claseEnlace(seccion) {
    const ruta = location.pathname.replace(/\/+$/, "") || "/";

    const activo =
      seccion === ""
        ? ruta === "/admin"
        : ruta === `/admin/${seccion}` ||
          ruta.startsWith(`/admin/${seccion}/`);

    return `fw-semibold ${activo ? "text-primary" : "text-dark"}`;
  }

  return (
    <div>
      <Navbar
        bg="white"
        expand="lg"
        expanded={expanded}
        onToggle={setExpanded}
        className="shadow-sm mb-4 py-3 border-bottom"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/admin"
            onClick={cerrarMenu}
            className="fw-bold"
            style={{ color: "#5c3d2e" }}
          >
            🍰 Panel {esAdministrador ? "Administrador" : "Vendedor"}
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
                to="/admin"
                onClick={cerrarMenu}
                className={claseEnlace("")}
              >
                Inicio
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/ordenes"
                onClick={cerrarMenu}
                className={claseEnlace("ordenes")}
              >
                Órdenes
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/productos"
                onClick={cerrarMenu}
                className={claseEnlace("productos")}
              >
                Productos
              </Nav.Link>

              {esAdministrador && (
                <Nav.Link
                  as={Link}
                  to="/admin/usuarios"
                  onClick={cerrarMenu}
                  className={claseEnlace("usuarios")}
                >
                  Usuarios
                </Nav.Link>
              )}

              <Nav.Link
                as={Link}
                to="/admin/perfil"
                onClick={cerrarMenu}
                className={claseEnlace("perfil")}
              >
                Perfil
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/"
                onClick={cerrarMenu}
                className="text-danger fw-semibold"
              >
                ← Volver a la tienda
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route
          index
          element={<AdminHome esAdministrador={esAdministrador} />}
        />

        <Route
          path="ordenes"
          element={<OrdersAdmin puedeModificar={true} />}
        />

        <Route
          path="productos"
          element={<ProductsAdmin puedeModificar={esAdministrador} />}
        />

        <Route
          path="usuarios"
          element={
            esAdministrador ? (
              <UsersAdmin />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route
          path="usuarios/nuevo"
          element={
            esAdministrador ? (
              <UserCreateAdmin />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route path="perfil" element={<AdminProfile />} />

        <Route
          path="*"
          element={
            <Container className="my-4">
              <h2>Página del panel no encontrada</h2>
              <Link to="/admin">Volver al inicio del panel</Link>
            </Container>
          }
        />
      </Routes>
    </div>
  );
}

export default AdminRoutes;