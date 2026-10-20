import { useState } from 'react'
import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { puedeEntrarAlPanel } from '../utils/roles'

function Navigation({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navegar = useNavigate()

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  function salir() {
    onCerrarSesion()
    cerrarMenu()
    navegar('/')
  }

  function abrirCarrito() {
    cerrarMenu()
    onVerCarrito()
  }

  return (
    <Navbar
      expand="lg"
      className="navigation"
      expanded={menuAbierto}
      onToggle={setMenuAbierto}
    >
      <Container className="nav-container">
        <Navbar.Brand
          as={Link}
          to="/"
          className="site-logo"
          onClick={cerrarMenu}
        >
          <img src="/images/logo.png" alt="" className="logo-img" />
          <span>Pastelería 1000 Sabores</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="menu-principal"
          aria-label="Abrir menú de navegación"
        />

        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto site-nav-links">
            <Nav.Link
              as={NavLink}
              to="/"
              end
              onClick={cerrarMenu}
            >
              Inicio
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/productos"
              onClick={cerrarMenu}
            >
              Productos
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/categorias"
              onClick={cerrarMenu}
            >
              Categorías
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/ofertas"
              onClick={cerrarMenu}
            >
              Ofertas
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/nosotros"
              onClick={cerrarMenu}
            >
              Nosotros
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/blogs"
              onClick={cerrarMenu}
            >
              Blogs
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/contacto"
              onClick={cerrarMenu}
            >
              Contacto
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/carrito"
              onClick={cerrarMenu}
            >
              Carrito ({cantidad})
            </Nav.Link>
          </Nav>

          <div className="nav-sesion">
            {usuarioActivo ? (
              <>
                <span className="nav-usuario">
                  Hola, {usuarioActivo.nombre}
                </span>

                {usuarioActivo.tortaGratisDuoc && (
                  <span className="nav-torta" title="Beneficio comunidad Duoc">
                    🎂 Torta gratis en tu cumpleaños
                  </span>
                )}

                {puedeEntrarAlPanel(usuarioActivo) && (
                  <Link
                    to="/admin"
                    className="nav-login"
                    onClick={cerrarMenu}
                  >
                    Panel
                  </Link>
                )}

                <Button
                  variant="outline-secondary"
                  className="cart-panel-button"
                  onClick={salir}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-login"
                  onClick={cerrarMenu}
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro"
                  className="nav-registro"
                  onClick={cerrarMenu}
                >
                  Registrarse
                </Link>
              </>
            )}

            <Button
              variant="outline-secondary"
              className="cart-panel-button"
              onClick={abrirCarrito}
            >
              Ver carrito
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation