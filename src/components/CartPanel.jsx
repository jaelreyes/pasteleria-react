import { Offcanvas } from "react-bootstrap";
import Cart from "./Cart";

function CartPanel({ mostrar, onCerrar, carrito, onVaciar, onEliminar,
  onCambiarCantidad }) {
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
          onCambiarCantidad={onCambiarCantidad}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default CartPanel;
