import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'

function Navigation({ cantidad, onVerCarrito }) {
  return (
    <Navbar expand="lg" className="navigation" collapseOnSelect>
      <Container className="nav-container">
        <Navbar.Brand as={Link} to="/" className="site-logo">
          <img
            src="/images/logo.png"
            alt=""
            className="logo-img"
          />
          <span>Pastelería 1000 Sabores</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="menu-principal"
          aria-label="Abrir menú de navegación"
        />

        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto site-nav-links">
            <Nav.Link as={NavLink} to="/" end eventKey="inicio">
              Inicio
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/productos"
              eventKey="productos"
            >
              Productos
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/nosotros"
              eventKey="nosotros"
            >
              Nosotros
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/contacto"
              eventKey="contacto"
            >
              Contacto
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/carrito"
              eventKey="carrito"
            >
              Carrito ({cantidad})
            </Nav.Link>
          </Nav>

          <Button
            variant="outline-secondary"
            className="cart-panel-button ms-lg-3"
            onClick={onVerCarrito}
          >
            Ver carrito
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation