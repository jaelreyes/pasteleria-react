import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Table } from "react-bootstrap";
import { listarBoletasAdmin } from "../../services/boletaAdminService";
import { listarProductosAdmin } from "../../services/productoAdminService";
import { mensajeError } from "../../services/api";
import { resumenVentas, resumenStock } from "../../utils/reportes";
import { formatearPrecio } from "../../utils/precios";
import "../../styles/ReportesAdmin.css";

function Indicador({ titulo, valor, detalle, color }) {
  return (
    <Card className={`reporte-indicador reporte-indicador-${color}`}>
      <Card.Body>
        <Card.Title as="h2" className="h6">
          {titulo}
        </Card.Title>
        <p className="reporte-indicador-valor">{valor}</p>
        {detalle && <small>{detalle}</small>}
      </Card.Body>
    </Card>
  );
}

export default function ReportesAdmin() {
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listarBoletasAdmin(), listarProductosAdmin()])
      .then(([listaBoletas, listaProductos]) => {
        setOrdenes(listaBoletas);
        setProductos(listaProductos);
      })
      .catch((err) =>
        setError(mensajeError(err, "No se pudieron cargar los reportes."))
      )
      .finally(() => setCargando(false));
  }, []);

  const ventas = resumenVentas(ordenes);
  const stock = resumenStock(productos);

  return (
    <section className="reportes-admin">
      <h1 className="admin-productos-titulo mb-4">Reportes</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <p className="text-muted">Calculando indicadores...</p>
      ) : (
        <>
          <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
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
                valor={stock.reduce(
                  (suma, fila) => suma + fila.criticos + fila.agotados,
                  0
                )}
                detalle="Críticos o agotados"
                color="danger"
              />
            </Col>
          </Row>

          <div className="reportes-detalle">
            <section className="reporte-panel" aria-labelledby="reporte-ventas-titulo">
              <h2 id="reporte-ventas-titulo">Productos más vendidos</h2>

              {ventas.masVendidos.length === 0 ? (
                <div className="reporte-sin-ventas"><p>Todavía no hay ventas registradas</p></div>
              ) : (
                <Table responsive className="reporte-tabla">
                  <thead>
                    <tr>
                      <th scope="col">Producto</th>
                      <th scope="col" className="text-end">Unidades</th>
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
            </section>

            <section className="reporte-panel" aria-labelledby="reporte-stock-titulo">
              <h2 id="reporte-stock-titulo">Stock por categoría</h2>

              <div className="reporte-tabla-scroll" tabIndex={0} role="region" aria-label="Stock por categoría, tabla desplazable">
              <Table className="reporte-tabla reporte-tabla-stock">
                <thead>
                  <tr>
                    <th scope="col">Categoría</th>
                    <th scope="col" className="text-end">Productos</th>
                    <th scope="col" className="text-end">Unidades</th>
                    <th scope="col" className="text-end">Valor inventario</th>
                    <th scope="col" className="text-end">Críticos</th>
                    <th scope="col" className="text-end">Agotados</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((fila) => (
                    <tr key={fila.categoria}>
                      <th scope="row">{fila.categoria}</th>
                      <td className="text-end">{fila.productos}</td>
                      <td className="text-end">{fila.unidades}</td>
                      <td className="text-end">
                        {formatearPrecio(fila.valorInventario)}
                      </td>
                      <td className="text-end"><span className={fila.criticos > 0 ? "reporte-estado reporte-estado-critico" : ""}>{fila.criticos}</span></td>
                      <td className="text-end"><span className={fila.agotados > 0 ? "reporte-estado reporte-estado-agotado" : ""}>{fila.agotados}</span></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
