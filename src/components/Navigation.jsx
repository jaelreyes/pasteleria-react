import { useState } from "react";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Button,
} from "react-bootstrap";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { puedeEntrarAlPanel } from "../utils/roles";
import "../styles/Navigation.css";

function Navigation({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navegar = useNavigate();

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function salir() {
    onCerrarSesion();
    cerrarMenu();
    navegar("/");
  }

  function abrirCarrito() {
    cerrarMenu();
    onVerCarrito();
  }

  const enlaces = [
    { ruta: "/", texto: "Inicio", end: true },
    { ruta: "/productos", texto: "Productos" },
    { ruta: "/categorias", texto: "Categorías" },
    { ruta: "/ofertas", texto: "Ofertas" },
    { ruta: "/nosotros", texto: "Nosotros" },
    { ruta: "/blogs", texto: "Blogs" },
    { ruta: "/contacto", texto: "Contacto" },
    { ruta: "/pedido", texto: "Mis pedidos" },
  ];

  return (
    <Navbar
      expand="lg"
      expanded={menuAbierto}
      onToggle={setMenuAbierto}
      className="tienda-navigation"
    >
      <Container className="tienda-nav-contenedor">
        <Navbar.Brand
          as={Link}
          to="/"
          className="tienda-nav-logo"
          onClick={cerrarMenu}
        >
          <img
            src="/images/logo.png"
            alt=""
            width={44}
            height={44}
          />

          <span>Pastelería 1000 Sabores</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="menu-principal"
          label={
            menuAbierto
              ? "Cerrar menú de navegación"
              : "Abrir menú de navegación"
          }
        />

        <Navbar.Collapse id="menu-principal">
          <Nav className="tienda-nav-enlaces">
            {enlaces.map((enlace) => (
              <Nav.Link
                key={enlace.ruta}
                as={NavLink}
                to={enlace.ruta}
                end={enlace.end}
                onClick={cerrarMenu}
              >
                {enlace.texto}
              </Nav.Link>
            ))}
          </Nav>

          <div className="tienda-nav-acciones">
            {usuarioActivo ? (
              <NavDropdown
                id="menu-cuenta"
                title={`Hola, ${usuarioActivo.nombre || "Mi cuenta"}`}
                align="end"
                className="tienda-nav-cuenta"
              >
                <NavDropdown.ItemText className="tienda-nav-cuenta-info">
                  <strong>
                    {usuarioActivo.nombre} {usuarioActivo.apellidos}
                  </strong>

                  <small>
                    {usuarioActivo.correo || usuarioActivo.email}
                  </small>
                </NavDropdown.ItemText>

                {usuarioActivo.tortaGratisDuoc && (
                  <NavDropdown.ItemText className="tienda-nav-beneficio">
                    🎂 Torta gratis en tu cumpleaños
                  </NavDropdown.ItemText>
                )}

                <NavDropdown.Divider />

                {puedeEntrarAlPanel(usuarioActivo) && (
                  <NavDropdown.Item
                    as={Link}
                    to="/admin"
                    onClick={cerrarMenu}
                  >
                    Panel de administración
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item onClick={salir}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Link
                  to="/login"
                  className="tienda-nav-login"
                  onClick={cerrarMenu}
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro"
                  className="tienda-nav-registro"
                  onClick={cerrarMenu}
                >
                  Registrarse
                </Link>
              </>
            )}

            <Button
              variant="outline-secondary"
              className="tienda-nav-carrito"
              onClick={abrirCarrito}
            >
              Carrito ({cantidad})
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;