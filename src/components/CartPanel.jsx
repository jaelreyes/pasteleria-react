import { Offcanvas } from "react-bootstrap";
import Cart from "./Cart";

function CartPanel({ mostrar, onCerrar, carrito, onVaciar, onEliminar }) {
  return (
    <Offcanvas show={mostrar} onHide={onCerrar} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Resumen del carrito</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Cart
          carrito={carrito}
          onVaciar={onVaciar}
          onEliminar={onEliminar}
          onContinuar={onCerrar}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default CartPanel;
