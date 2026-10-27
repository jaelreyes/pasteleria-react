import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Row, Table } from "react-bootstrap";
import { obtenerOrdenPorId } from "../../data/db";
import { formatearPrecio } from "../../utils/precios";

// Texto y color de cada estado de la orden.
const ESTADOS = {
  pendiente: "Pendiente",
  procesando: "En preparación",
  enviado: "Enviado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

// Detalle (boleta) de una orden: /admin/ordenes/:id
export default function BoletaAdmin() {
  const { id } = useParams();
  // Busca la orden con el id de la URL.
  const orden = obtenerOrdenPorId(id);

  if (!orden) {
    return (
      <Alert variant="warning">
        No encontramos la orden {id}. <Link to="/admin/ordenes">Volver a órdenes</Link>
      </Alert>
    );
  }

  const productos = Array.isArray(orden.productos) ? orden.productos : [];
  const estado = orden.estado || "pendiente";

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="admin-productos-titulo mb-0">Boleta de la orden</h1>
        <div className="d-flex gap-2 d-print-none">
          <Button variant="outline-secondary" as={Link} to="/admin/ordenes">
            Volver
          </Button>
          {/* Imprime la boleta (los botones se ocultan al imprimir) */}
          <Button variant="primary" onClick={() => window.print()}>
            Imprimir
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={8}>
              <p className="mb-1"><strong>N° de orden:</strong> {orden.id}</p>
              <p className="mb-1">
                <strong>Fecha:</strong>{" "}
                {orden.fecha ? new Date(orden.fecha).toLocaleString("es-CL") : "Sin fecha"}
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <Badge bg={estado === "cancelado" ? "danger" : "success"} className="fs-6">
                {ESTADOS[estado] || estado}
              </Badge>
            </Col>
          </Row>

          {/* Datos del cliente y dirección de despacho */}
          <h2 className="h5">Cliente</h2>
          <p className="mb-1">{orden.nombre}</p>
          <p className="mb-1">{orden.email || orden.correo}</p>
          <p className="mb-1">{orden.telefono}</p>
          <p className="mb-1">{orden.direccion}</p>
          {orden.indicaciones && (
            <p className="text-muted">Indicaciones: {orden.indicaciones}</p>
          )}

          {/* Detalle de productos */}
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
              {productos.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td className="text-end">{formatearPrecio(item.precioFinal)}</td>
                  <td className="text-end">{item.cantidad}</td>
                  <td className="text-end">
                    {formatearPrecio(item.precioFinal * item.cantidad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Totales */}
          <div className="text-end">
            {orden.ahorro > 0 && (
              <p className="mb-1 text-success">Ahorro: {formatearPrecio(orden.ahorro)}</p>
            )}
            <p className="fs-5 mb-0">
              <strong>Total: {formatearPrecio(orden.total)}</strong>
            </p>
          </div>
        </Card.Body>
      </Card>
    </section>
  );
}