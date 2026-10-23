import { useState } from "react";
import {
  obtenerOrdenes,
  actualizarEstadoOrden,
} from "../../data/db";
import {
  Table,
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  Alert,
} from "react-bootstrap";

const ESTADOS = [
  "pendiente",
  "procesando",
  "completado",
  "cancelado",
];

function formatearMonto(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
}

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
    const equivalencias = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return equivalencias[caracter];
  });
}

function celdaCSV(valor) {
  let texto = String(valor ?? "");

  // Evita interpretar texto como una fórmula al abrir la planilla.
  if (/^\s*[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

export function OrdersAdmin({ puedeModificar = false }) {
  const [ordenes, setOrdenes] = useState(() => obtenerOrdenes());
  const [filtroEstado, setFiltroEstado] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  function cambiarEstado(id, nuevoEstado) {
    if (!puedeModificar || !ESTADOS.includes(nuevoEstado)) return;

    setError("");
    setMensaje("");

    try {
      actualizarEstadoOrden(id, nuevoEstado);

      const actualizadas = obtenerOrdenes();
      const ordenActualizada = actualizadas.find(
        (orden) => String(orden.id) === String(id)
      );

      if (!ordenActualizada || ordenActualizada.estado !== nuevoEstado) {
        setError("No se pudo actualizar el estado de la orden.");
        return;
      }

      setOrdenes(actualizadas);
      setMensaje("Estado actualizado correctamente.");
    } catch {
      setError("Ocurrió un error al actualizar la orden.");
    }
  }

  function obtenerColorBadge(estado) {
    switch (estado) {
      case "completado":
        return "success";
      case "procesando":
        return "warning";
      case "cancelado":
        return "danger";
      default:
        return "secondary";
    }
  }

  function exportarCSV() {
    const actuales = obtenerOrdenes();

    if (actuales.length === 0) {
      setError("No hay órdenes para exportar.");
      return;
    }

    setError("");

    const filas = [
      ["ID", "Cliente", "Correo", "Total", "Estado"],
      ...actuales.map((orden) => [
        orden.id,
        orden.nombre,
        orden.email || orden.correo,
        Number(orden.total) || 0,
        orden.estado || "pendiente",
      ]),
    ];

    const contenido = filas
      .map((fila) => fila.map(celdaCSV).join(","))
      .join("\r\n");

    const archivo = new Blob(["\uFEFF", contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "reporte_ordenes_pasteleria.csv";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportarPDF() {
    setError("");

    const actuales = obtenerOrdenes();
    const montoTotal = actuales.reduce(
      (suma, orden) => suma + (Number(orden.total) || 0),
      0
    );

    const ventana = window.open("", "", "height=700,width=900");

    if (!ventana) {
      setError(
        "El navegador bloqueó la ventana del reporte. Permite las ventanas emergentes e inténtalo nuevamente."
      );
      return;
    }

    const filas = actuales.length
      ? actuales
          .map(
            (orden) => `
              <tr>
                <td>${escaparHTML(orden.id)}</td>
                <td>${escaparHTML(orden.nombre)}</td>
                <td>${escaparHTML(orden.email || orden.correo)}</td>
                <td>${escaparHTML(orden.direccion || "Sin registrar")}</td>
                <td>${escaparHTML(formatearMonto(orden.total))}</td>
                <td>${escaparHTML(orden.estado || "pendiente")}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="6">No hay órdenes registradas.</td></tr>`;

    ventana.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Órdenes - Pastelería 1000 Sabores</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              padding: 20px;
            }

            h2 {
              color: #5c3d2e;
              border-bottom: 2px solid #5c3d2e;
              padding-bottom: 8px;
            }

            .resumen {
              padding: 15px;
              background: #f8f9fa;
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-size: 12px;
              overflow-wrap: anywhere;
            }

            th {
              background: #5c3d2e;
              color: white;
            }

            tr:nth-child(even) {
              background: #f9f9f9;
            }
          </style>
        </head>

        <body>
          <h2>Reporte General de Órdenes</h2>

          <p>
            Fecha de emisión:
            ${new Date().toLocaleDateString("es-CL")}
          </p>

          <div class="resumen">
            <p>Total de órdenes: ${actuales.length}</p>
            <p>Monto total de órdenes: ${formatearMonto(montoTotal)}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>${filas}</tbody>
          </table>
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();

    setTimeout(() => {
      if (!ventana.closed) {
        ventana.print();
      }
    }, 500);
  }

  const ordenesFiltradas = ordenes.filter((orden) => {
    if (!filtroEstado) return true;

    return (orden.estado || "pendiente") === filtroEstado;
  });

  const totalCompletadas = ordenes.filter(
    (orden) => orden.estado === "completado"
  ).length;

  const totalPendientes = ordenes.filter(
    (orden) => !orden.estado || orden.estado === "pendiente"
  ).length;

  const montoTotal = ordenes.reduce(
    (suma, orden) => suma + (Number(orden.total) || 0),
    0
  );

  return (
    <Container className="my-4">
      <Row className="mb-4 align-items-center g-3">
        <Col>
          <h2 style={{ color: "#5c3d2e", fontWeight: "bold" }}>
            Gestión de Órdenes
          </h2>

          <p className="text-muted">
            Consulta de pedidos y actualización de estados.
          </p>
        </Col>

        <Col xs="auto" className="d-flex flex-wrap gap-2">
          <Button variant="success" onClick={exportarCSV}>
            Reporte CSV
          </Button>

          <Button variant="danger" onClick={exportarPDF}>
            Exportar PDF
          </Button>
        </Col>
      </Row>

      {!puedeModificar && (
        <Alert variant="info">
          Tu acceso es de consulta. Puedes revisar, filtrar y exportar
          órdenes. El cambio de estado corresponde al administrador.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert variant="success" role="status">
          {mensaje}
        </Alert>
      )}

      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">Total Órdenes</h6>
            <h3 className="fw-bold mb-0">{ordenes.length}</h3>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">Completadas</h6>
            <h3 className="fw-bold mb-0 text-success">
              {totalCompletadas}
            </h3>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">Pendientes</h6>
            <h3 className="fw-bold mb-0 text-warning">
              {totalPendientes}
            </h3>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">Monto total de órdenes</h6>
            <h3 className="fw-bold mb-0 text-primary fs-4">
              {formatearMonto(montoTotal)}
            </h3>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-4 p-3">
        <Row>
          <Col xs={12} md={4}>
            <Form.Group controlId="filtro-estado-orden">
              <Form.Label>Filtrar por estado</Form.Label>

              <Form.Select
                value={filtroEstado}
                onChange={(evento) =>
                  setFiltroEstado(evento.target.value)
                }
              >
                <option value="">Todos los estados</option>

                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover striped className="mb-0 align-middle">
            <thead>
              <tr>
                <th className="py-3 px-4">ID Orden</th>
                <th>Cliente / Correo</th>
                <th>Dirección</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ordenesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    {ordenes.length === 0
                      ? "No hay órdenes registradas."
                      : "No hay órdenes con ese estado."}
                  </td>
                </tr>
              ) : (
                ordenesFiltradas.map((orden) => (
                  <tr key={orden.id}>
                    <td
                      className="px-4 fw-bold text-primary"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {orden.id}
                    </td>

                    <td>
                      <div>
                        <strong>{orden.nombre}</strong>
                      </div>
                      <small>{orden.email || orden.correo}</small>
                    </td>

                    <td>
                      {orden.direccion}
                      {orden.comuna ? ` (${orden.comuna})` : ""}
                    </td>

                    <td className="fw-bold text-success">
                      {formatearMonto(orden.total)}
                    </td>

                    <td>
                      <Badge
                        bg={obtenerColorBadge(orden.estado)}
                        className="text-uppercase"
                      >
                        {orden.estado || "pendiente"}
                      </Badge>
                    </td>

                    <td className="text-center">
                      {puedeModificar ? (
                        <Form.Select
                          size="sm"
                          aria-label={`Cambiar estado de la orden ${orden.id}`}
                          value={orden.estado || "pendiente"}
                          onChange={(evento) =>
                            cambiarEstado(orden.id, evento.target.value)
                          }
                        >
                          {ESTADOS.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado.charAt(0).toUpperCase() +
                                estado.slice(1)}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <span className="text-muted">Solo consulta</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>

        <Card.Footer className="bg-white text-muted small py-3">
          Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes.
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default OrdersAdmin;