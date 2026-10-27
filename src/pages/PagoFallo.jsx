import { Link, useLocation } from "react-router-dom";
import { Alert, Button, Card, Col, Row, Table } from "react-bootstrap";
import { formatearPrecio } from "../utils/precios";

// Vista de pago rechazado. Recibe los datos de la compra desde el Checkout
// (state de la navegación). La orden no se guarda y el carrito se conserva.
export default function PagoFallo() {
  const { state } = useLocation();
  const pago = state?.pago;

  return (
    <section className="container my-5" style={{ maxWidth: "760px" }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3 text-danger">
            ✕ No se pudo realizar el pago
            {pago && <small className="d-block fs-6 text-muted mt-1">Orden {pago.id}</small>}
          </h1>

          <Alert variant="danger" className="mt-3">
            La transacción fue rechazada. No se realizó ningún cobro y tus
            productos siguen en el carrito.
          </Alert>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <Button as={Link} to="/checkout" variant="success">
              Volver a realizar el pago
            </Button>
            <Button as={Link} to="/carrito" variant="outline-secondary">
              Revisar el carrito
            </Button>
          </div>

          {/* Detalle de la compra rechazada, si llegaron datos */}
          {pago ? (
            <>
              <h2 className="h5">Datos del cliente</h2>
              <Row className="mb-3">
                <Col sm={6}><strong>Nombre:</strong> {pago.nombre}</Col>
                <Col sm={6}><strong>Correo:</strong> {pago.email}</Col>
              </Row>

              <h2 className="h5">Dirección de entrega</h2>
              <p className="mb-1">{pago.direccion}</p>
              {pago.indicaciones && (
                <p className="text-muted">Indicaciones: {pago.indicaciones}</p>
              )}

              <Table responsive size="sm" className="mt-3 align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-end">Precio</th>
                    <th className="text-end">Cantidad</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pago.productos.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.nombre}</td>
                      <td className="text-end">{formatearPrecio(producto.precioFinal)}</td>
                      <td className="text-end">{producto.cantidad}</td>
                      <td className="text-end">
                        {formatearPrecio(producto.precioFinal * producto.cantidad)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <p className="fs-5 text-end mb-0">
                <strong>Total no cobrado: {formatearPrecio(pago.total)}</strong>
              </p>
            </>
          ) : (
            <p className="mb-0">
              No hay datos de una compra reciente.{" "}
              <Link to="/">Volver al inicio</Link>
            </p>
          )}
        </Card.Body>
      </Card>
    </section>
  );
}