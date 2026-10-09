import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'

function Navigation({ cantidad, onVerCarrito }) {
  return (
    <Navbar expand="md" className="navigation" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/">
          1000 Sabores
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-principal" />

        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto">
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
              to="/carrito"
              eventKey="carrito"
            >
              Carrito ({cantidad})
            </Nav.Link>
          </Nav>

          <Button
            variant="outline-dark"
            className="ms-md-3"
            onClick={onVerCarrito}
          >
            Ver carrito ({cantidad})
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation