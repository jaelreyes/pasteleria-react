import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listarBoletasAdmin,
  actualizarEstadoBoletaAdmin,
} from "../../services/boletaAdminService";
import { mensajeError } from "../../services/api";
import { Form, Button, Alert } from "react-bootstrap";
import "../../styles/OrdersAdmin.css";

const ESTADOS = {
  pendiente: "Pendiente",
  procesando: "En preparación",
  enviado: "Enviado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

function estadoOrden(orden) {
  return orden.estado || "pendiente";
}

function formatearMonto(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
}

function formatearFecha(valor) {
  if (!valor) return "Sin fecha";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "Sin fecha"
    : fecha.toLocaleDateString("es-CL");
}

function escaparHTML(valor) {
  const equivalencias = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) => equivalencias[caracter]
  );
}

function celdaCSV(valor) {
  let texto = String(valor ?? "");
  if (/^\s*[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }
  return `"${texto.replace(/"/g, '""')}"`;
}

export function OrdersAdmin({ puedeModificar = false, puedeExportar = false }) {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarOrdenes(mostrarAviso = false) {
    try {
      setCargando(true);
      const data = await listarBoletasAdmin();
      setOrdenes(data);
      setError("");
      if (mostrarAviso) setMensaje("Listado actualizado.");
    } catch (err) {
      setError(mensajeError(err, "No se pudieron cargar las órdenes."));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarOrdenes(false);
  }, []);

  async function cambiarEstado(id, nuevoEstado) {
    if (
      !puedeModificar ||
      !Object.prototype.hasOwnProperty.call(ESTADOS, nuevoEstado)
    ) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      await actualizarEstadoBoletaAdmin(id, nuevoEstado);
      await cargarOrdenes(false);
      setMensaje("Estado actualizado correctamente.");
    } catch (err) {
      setError(
        mensajeError(err, "No se pudo actualizar el estado de la orden.")
      );
    }
  }

  function exportarCSV() {
    if (!puedeExportar) return;
    setError("");
    if (ordenes.length === 0) {
      setError("No hay órdenes para exportar.");
      return;
    }

    const filas = [
      ["ID", "Fecha", "Cliente", "Correo", "Dirección", "Total", "Estado"],
      ...ordenes.map((orden) => [
        orden.id,
        formatearFecha(orden.fecha),
        orden.nombre,
        orden.email || orden.correo,
        orden.direccion,
        Number(orden.total) || 0,
        estadoOrden(orden),
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
    if (!puedeExportar) return;
    setError("");
    if (ordenes.length === 0) {
      setError("No hay órdenes para exportar.");
      return;
    }

    const ventana = window.open("", "", "height=700,width=1000");
    if (!ventana) {
      setError(
        "Permite las ventanas emergentes del navegador para abrir el reporte."
      );
      return;
    }

    const filas = ordenes
      .map(
        (orden) => `
          <tr>
            <td>${escaparHTML(orden.id)}</td>
            <td>${escaparHTML(formatearFecha(orden.fecha))}</td>
            <td>${escaparHTML(orden.nombre)}</td>
            <td>${escaparHTML(orden.email || orden.correo)}</td>
            <td>${escaparHTML(orden.direccion)}</td>
            <td>${escaparHTML(formatearMonto(orden.total))}</td>
            <td>${escaparHTML(
              ESTADOS[estadoOrden(orden)] || estadoOrden(orden)
            )}</td>
          </tr>
        `
      )
      .join("");

    const monto = ordenes.reduce(
      (suma, orden) => suma + (Number(orden.total) || 0),
      0
    );

    ventana.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Órdenes</title>
          <style>
            body { font-family: Arial, sans-serif; color: #5d4037; padding: 20px; }
            h1 { font-size: 24px; color: #8b4513; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; overflow-wrap: anywhere; }
            th { background: #fff5e1; }
            @page { size: landscape; margin: 15mm; }
          </style>
        </head>
        <body>
          <h1>Órdenes — Pastelería 1000 Sabores</h1>
          <p>Fecha: ${new Date().toLocaleDateString("es-CL")}</p>
          <p>Total de órdenes: ${ordenes.length}</p>
          <p>Monto total registrado: ${formatearMonto(monto)}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
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
      if (!ventana.closed) ventana.print();
    }, 500);
  }

  const ordenesFiltradas = ordenes
    .filter((orden) => {
      const texto = [orden.id, orden.nombre, orden.email || orden.correo]
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(busqueda.trim().toLowerCase()) &&
        (!filtroEstado || estadoOrden(orden) === filtroEstado)
      );
    })
    .sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime() || 0;
      const fechaB = new Date(b.fecha).getTime() || 0;
      return fechaB - fechaA;
    });

  const indicadores = [
    { titulo: "Total de órdenes", valor: ordenes.length },
    {
      titulo: "Pendientes",
      valor: ordenes.filter((o) => estadoOrden(o) === "pendiente").length,
    },
    {
      titulo: "En preparación",
      valor: ordenes.filter((o) => estadoOrden(o) === "procesando").length,
    },
    {
      titulo: "Completadas",
      valor: ordenes.filter((o) => estadoOrden(o) === "completado").length,
    },
  ];

  function mostrarEstado(orden) {
    const estado = estadoOrden(orden);
    return (
      <span className={`orden-estado estado-${estado}`}>
        {ESTADOS[estado] || estado}
      </span>
    );
  }

  function selectorEstado(orden) {
    return puedeModificar ? (
      <Form.Select
        disabled={estadoOrden(orden) === "cancelado"}
        aria-label={`Cambiar estado de la orden ${orden.id}`}
        value={estadoOrden(orden)}
        onChange={(evento) => cambiarEstado(orden.id, evento.target.value)}
      >
        {Object.entries(ESTADOS).map(([valor, etiqueta]) => (
          <option key={valor} value={valor}>
            {etiqueta}
          </option>
        ))}
      </Form.Select>
    ) : (
      <span className="text-muted">Solo consulta</span>
    );
  }

  return (
    <section className="ordenes-admin">
      <div className="ordenes-cabecera">
        <div>
          <h1>Gestión de Órdenes</h1>
          <p>Revisa las compras y consulta el detalle de los pedidos.</p>
        </div>

        <div className="ordenes-exportaciones">
          <Button
            variant="outline-secondary"
            onClick={() => cargarOrdenes(true)}
          >
            Actualizar
          </Button>

          {puedeExportar && (
            <>
              <Button variant="outline-secondary" onClick={exportarCSV}>
                Exportar CSV
              </Button>
              <Button className="ordenes-boton-principal" onClick={exportarPDF}>
                Exportar PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {!puedeModificar && (
        <Alert variant="info">
          Tu acceso es de consulta. Puedes revisar el listado y el detalle de
          cada boleta.
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

      <div className="ordenes-indicadores">
        {indicadores.map((indicador) => (
          <article key={indicador.titulo}>
            <h2>{indicador.titulo}</h2>
            <p>{indicador.valor}</p>
          </article>
        ))}
      </div>

      <div className="ordenes-filtros">
        <Form.Group controlId="ordenes-busqueda">
          <Form.Label>Buscar orden</Form.Label>
          <Form.Control
            type="search"
            placeholder="ID, nombre o correo"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="filtro-estado-orden">
          <Form.Label>Filtrar por estado</Form.Label>
          <Form.Select
            value={filtroEstado}
            onChange={(evento) => setFiltroEstado(evento.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button
          variant="outline-secondary"
          onClick={() => {
            setBusqueda("");
            setFiltroEstado("");
          }}
        >
          Limpiar filtros
        </Button>
      </div>

      <p className="ordenes-contador" role="status">
          Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes.
          {puedeExportar && " Las exportaciones incluyen todas las órdenes."}
      </p>

      {cargando ? (
        <p className="text-muted">Cargando órdenes...</p>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="ordenes-vacio">
          {ordenes.length === 0
            ? "Todavía no hay órdenes registradas."
            : "No se encontraron órdenes con esos filtros."}
        </div>
      ) : (
        <>
          <div className="ordenes-vista-tabla">
            <div
              className="ordenes-tabla-scroll"
              tabIndex={0}
              role="region"
              aria-label="Tabla de órdenes"
            >
              <table className="ordenes-tabla">
                <thead>
                  <tr>
                    <th>Orden / Fecha</th>
                    <th>Cliente</th>
                    <th>Dirección</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {ordenesFiltradas.map((orden) => (
                    <tr key={orden.id}>
                      <td>
                        <strong className="orden-id">#{orden.id}</strong>
                        <small>{formatearFecha(orden.fecha)}</small>
                        <Link
                          to={`/admin/ordenes/${encodeURIComponent(orden.id)}`}
                        >
                          Ver boleta
                        </Link>
                      </td>

                      <td>
                        <strong>{orden.nombre}</strong>
                        <small>{orden.email || orden.correo}</small>
                      </td>

                      <td>{orden.direccion || "Sin registrar"}</td>

                      <td className="orden-monto">
                        {formatearMonto(orden.total)}
                      </td>

                      <td>{mostrarEstado(orden)}</td>
                      <td>{selectorEstado(orden)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ordenes-vista-tarjetas">
            {ordenesFiltradas.map((orden) => (
              <article className="orden-tarjeta" key={orden.id}>
                <div className="orden-tarjeta-cabecera">
                  {mostrarEstado(orden)}
                  <span>{formatearFecha(orden.fecha)}</span>
                </div>

                <h2>{orden.nombre}</h2>
                <p className="orden-id">#{orden.id}</p>
                <Link to={`/admin/ordenes/${encodeURIComponent(orden.id)}`}>
                  Ver boleta
                </Link>

                <dl>
                  <dt>Correo</dt>
                  <dd>{orden.email || orden.correo || "Sin registrar"}</dd>

                  <dt>Dirección</dt>
                  <dd>{orden.direccion || "Sin registrar"}</dd>

                  <dt>Total</dt>
                  <dd className="orden-monto">{formatearMonto(orden.total)}</dd>
                </dl>

                <div className="orden-tarjeta-accion">
                  <p>Estado</p>
                  {selectorEstado(orden)}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default OrdersAdmin;
