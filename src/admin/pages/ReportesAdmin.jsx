import { Card, Col, Row, Table } from "react-bootstrap";
import { obtenerOrdenes, obtenerProductos } from "../../data/db";
import { resumenVentas, resumenStock } from "../../utils/reportes";
import { formatearPrecio } from "../../utils/precios";

// Tarjeta de un indicador. Recibe todo por props.
function Indicador({ titulo, valor, detalle, color }) {
  return (
    <Card bg={color} text="white" className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title as="h2" className="h6">{titulo}</Card.Title>
        <p className="fs-3 fw-bold mb-0">{valor}</p>
        {detalle && <small>{detalle}</small>}
      </Card.Body>
    </Card>
  );
}

export default function ReportesAdmin() {
  const ventas = resumenVentas(obtenerOrdenes());
  const stock = resumenStock(obtenerProductos());

  return (
    <section>
      <h1 className="admin-productos-titulo mb-4">Reportes</h1>

      <Row xs={1} sm={2} lg={4} className="g-3 mb-4">
        <Col>
          <Indicador
            titulo="Total vendido"
            valor={formatearPrecio(ventas.totalVendido)}
            detalle="Sin contar órdenes canceladas"
            color="success"
          />
        </Col>
        <Col>
          <Indicador
            titulo="Órdenes"
            valor={ventas.cantidadOrdenes}
            detalle={`${ventas.canceladas} cancelada(s)`}
            color="primary"
          />
        </Col>
        <Col>
          <Indicador
            titulo="Ticket promedio"
            valor={formatearPrecio(ventas.ticketPromedio)}
            color="info"
          />
        </Col>
        <Col>
          <Indicador
            titulo="Productos en riesgo"
            valor={stock.reduce((suma, fila) => suma + fila.criticos + fila.agotados, 0)}
            detalle="Críticos o agotados"
            color="danger"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={5}>
          <h2 className="h5">Productos más vendidos</h2>

          {ventas.masVendidos.length === 0 ? (
            <p className="text-muted">Todavía no hay ventas registradas.</p>
          ) : (
            <Table size="sm" className="bg-white shadow-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-end">Unidades</th>
                </tr>
              </thead>
              <tbody>
                {ventas.masVendidos.map((item) => (
                  <tr key={item.nombre}>
                    <td>{item.nombre}</td>
                    <td className="text-end">{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col lg={7}>
          <h2 className="h5">Stock por categoría</h2>

          <Table responsive size="sm" className="bg-white shadow-sm">
            <thead>
              <tr>
                <th>Categoría</th>
                <th className="text-end">Productos</th>
                <th className="text-end">Unidades</th>
                <th className="text-end">Valor inventario</th>
                <th className="text-end">Críticos</th>
                <th className="text-end">Agotados</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((fila) => (
                <tr key={fila.categoria}>
                  <td>{fila.categoria}</td>
                  <td className="text-end">{fila.productos}</td>
                  <td className="text-end">{fila.unidades}</td>
                  <td className="text-end">{formatearPrecio(fila.valorInventario)}</td>
                  <td className="text-end">{fila.criticos}</td>
                  <td className="text-end">{fila.agotados}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </section>
  );
}