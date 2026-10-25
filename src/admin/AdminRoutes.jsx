import { useState } from "react";
import {
  Navigate,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import {
  puedeEntrarAlPanel,
  obtenerUsuarioActivo,
} from "../data/db";

import AdminHome from "./pages/AdminHome";
import OrdersAdmin from "./pages/OrdersAdmin";
import UsersAdmin from "./pages/UsersAdmin";
import AdminProfile from "./pages/AdminProfile";
import { ProductsAdmin } from "../pages/ProductsAdmin";
import UserCreateAdmin from "./pages/UserCreateAdmin";
import CategoriasAdmin from "./pages/CategoriasAdmin";
import ReportesAdmin from "./pages/ReportesAdmin";
import "../styles/Admin.css";

export function AdminRoutes() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const usuario = obtenerUsuarioActivo();
  const autorizado = puedeEntrarAlPanel();

  const rol = String(usuario?.rol || usuario?.tipo || "")
    .trim()
    .toLowerCase();

  const esAdministrador =
    rol === "admin" || rol === "administrador";

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    window.location.assign("/login");
  }

  function claseEnlace({ isActive }) {
    return `admin-menu-enlace${isActive ? " activo" : ""}`;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-contenido">
          <Link
            to="/admin"
            className="admin-logo"
            onClick={cerrarMenu}
          >
            <img src="/images/logo.png" alt="" />
            <span>Panel de Administración</span>
          </Link>

          <button
            type="button"
            className="admin-menu-toggle"
            aria-expanded={menuAbierto}
            aria-controls="admin-menu-lateral admin-sesion"
            aria-label={
              menuAbierto
                ? "Cerrar menú de administración"
                : "Abrir menú de administración"
            }
            onClick={() => setMenuAbierto((actual) => !actual)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuAbierto ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>

          <div
            id="admin-sesion"
            className={`admin-header-acciones${
              menuAbierto ? " abierto" : ""
            }`}
          >
            <span>Hola, {usuario?.nombre || "Usuario"}</span>

            <span className="admin-rol">
              {esAdministrador ? "Administrador" : "Vendedor"}
            </span>

            <Link to="/" className="admin-ver-tienda" onClick={cerrarMenu}>
              Ver tienda
            </Link>

            <button
              type="button"
              className="admin-cerrar-sesion"
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="admin-estructura">
        <aside
          id="admin-menu-lateral"
          className={`admin-sidebar${menuAbierto ? " abierto" : ""}`}
        >
          <nav aria-label="Menú de administración">
            <NavLink
              to="/admin"
              end
              className={claseEnlace}
              onClick={cerrarMenu}
            >
              Inicio
            </NavLink>

            <p className="admin-menu-grupo">Productos</p>

            <NavLink
              to="/admin/productos"
              end
              className={claseEnlace}
              onClick={cerrarMenu}
            >
              Listado de Productos
            </NavLink>

            {esAdministrador && (
              <NavLink
                to="/admin/productos/nuevo"
                className={claseEnlace}
                onClick={cerrarMenu}
              >
                Nuevo Producto
              </NavLink>
            )}

            {esAdministrador && (
              <NavLink
                to="/admin/categorias"
                className={claseEnlace}
                onClick={cerrarMenu}
              >
                Categorías
              </NavLink>
            )}

            <p className="admin-menu-grupo">Pedidos</p>

            <NavLink
              to="/admin/ordenes"
              className={claseEnlace}
              onClick={cerrarMenu}
            >
              Gestión de Órdenes
            </NavLink>

            {esAdministrador && (
              <NavLink
                to="/admin/reportes"
                className={claseEnlace}
                onClick={cerrarMenu}
              >
                Reportes
              </NavLink>
            )}

            {esAdministrador && (
              <>
                <p className="admin-menu-grupo">Usuarios</p>

                <NavLink
                  to="/admin/usuarios"
                  end
                  className={claseEnlace}
                  onClick={cerrarMenu}
                >
                  Listado de Usuarios
                </NavLink>

                <NavLink
                  to="/admin/usuarios/nuevo"
                  className={claseEnlace}
                  onClick={cerrarMenu}
                >
                  Nuevo Usuario
                </NavLink>
              </>
            )}

            <p className="admin-menu-grupo">Cuenta</p>

            <NavLink
              to="/admin/perfil"
              className={claseEnlace}
              onClick={cerrarMenu}
            >
              Mi Perfil
            </NavLink>

            <p className="admin-menu-grupo">Tienda</p>

            <Link
              to="/"
              className="admin-menu-enlace"
              onClick={cerrarMenu}
            >
              Volver a la tienda
            </Link>
          </nav>
        </aside>

        <main className="admin-contenido">
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
              path="categorias"
              element={
                esAdministrador ? (
                  <CategoriasAdmin />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="reportes"
              element={
                esAdministrador ? (
                  <ReportesAdmin />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="productos"
              element={
                <ProductsAdmin
                  key="listado"
                  modo="listado"
                  puedeModificar={esAdministrador}
                />
              }
            />

            <Route
              path="productos/nuevo"
              element={
                esAdministrador ? (
                  <ProductsAdmin
                    key="nuevo"
                    modo="nuevo"
                    puedeModificar={true}
                  />
                ) : (
                  <Navigate to="/admin/productos" replace />
                )
              }
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
                <div>
                  <h1>Página del panel no encontrada</h1>
                  <Link to="/admin">Volver al inicio del panel</Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>

      <footer className="admin-footer">
        <div className="admin-footer-contenido">
          <div>
            <h2>Pastelería 1000 Sabores</h2>
            <p>Panel de administración de la tienda online.</p>
          </div>

          <div>
            <h2>Accesos</h2>
            <Link to="/admin/productos">Productos</Link>
            <Link to="/admin/ordenes">Órdenes</Link>

            {esAdministrador && (
              <Link to="/admin/usuarios">Usuarios</Link>
            )}
          </div>

          <div>
            <h2>Tienda</h2>
            <Link to="/">Inicio</Link>
            <Link to="/productos">Productos</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>

        <div className="admin-footer-bottom">
          © 2026 Pastelería 1000 Sabores. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default AdminRoutes;