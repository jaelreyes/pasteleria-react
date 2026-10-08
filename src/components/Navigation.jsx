import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Navigation({ cantidad }) {
  return (
    <Navbar expand="md" className="navigation" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/">
          1000 Sabores
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-principal" />

        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" eventKey="inicio">
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/productos" eventKey="productos">
              Productos
            </Nav.Link>

            <Nav.Link as={Link} to="/carrito" eventKey="carrito">
              Carrito ({cantidad})
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation