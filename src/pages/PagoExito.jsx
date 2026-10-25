import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Alert, Button, Badge } from "react-bootstrap";
import { obtenerOrdenPorId } from "../data/db";
import { formatearPrecio } from "../utils/precios";

const ESTADOS = {
  pendiente: "Pendiente",
  procesando: "En preparación",
  enviado: "Enviado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

export default function PagoExito() {
  const { idOrden } = useParams();

  const [aviso, setAviso] = useState({
    id: "",
    texto: "",
    tipo: "success",
  });

  const orden = idOrden ? obtenerOrdenPorId(idOrden) : null;

  function mostrarAviso(texto, tipo = "success") {
    setAviso({
      id: idOrden,
      texto,
      tipo,
    });
  }

  async function copiarNumeroOrden() {
    if (!orden) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Portapapeles no disponible");
      }

      await navigator.clipboard.writeText(String(orden.id));

      mostrarAviso("Número de orden copiado.");
    } catch {
      mostrarAviso(
        "No pudimos copiar automáticamente. Selecciona el número de orden y cópialo manualmente.",
        "warning"
      );
    }
  }

  function descargarComprobante() {
    if (!orden) return;

    const productos = Array.isArray(orden.productos)
      ? orden.productos
      : [];

    const fecha = orden.fecha ? new Date(orden.fecha) : null;

    const fechaTexto =
      fecha && !Number.isNaN(fecha.getTime())
        ? fecha.toLocaleString("es-CL")
        : "Sin fecha registrada";

    const detalleProductos = productos.length
      ? productos
          .map(
            (producto) =>
              `${producto.nombre}\n` +
              `Cantidad: ${producto.cantidad}\n` +
              `Precio unitario: ${formatearPrecio(producto.precioFinal)}\n` +
              `Subtotal: ${formatearPrecio(
                producto.precioFinal * producto.cantidad
              )}`
          )
          .join("\n\n")
      : "Esta orden no tiene un detalle de productos registrado.";

    const contenido = [
      "PASTELERÍA 1000 SABORES",
      "Comprobante de pedido",
      "",
      `Número de orden: ${orden.id}`,
      `Fecha: ${fechaTexto}`,
      `Estado: ${ESTADOS[orden.estado] || orden.estado || "Pendiente"}`,
      "",
      "DATOS DE COMPRA",
      `Nombre: ${orden.nombre || ""}`,
      `Correo: ${orden.email || orden.correo || ""}`,
      `Teléfono: ${orden.telefono || "Sin registrar"}`,
      `Dirección: ${orden.direccion || "Sin registrar"}`,
      "",
      "PRODUCTOS",
      detalleProductos,
      "",
      `Ahorro total: ${formatearPrecio(orden.ahorro || 0)}`,
      `Total de la compra: ${formatearPrecio(orden.total)}`,
      "",
      "CONSULTA DE PEDIDO",
      "Entra a Mis pedidos e ingresa el número de orden y el correo de compra.",
      "Conserva este comprobante para consultar tu pedido.",
      "",
      orden.pagoSimulado
        ? "Compra académica con pago simulado. No se realizó ningún cobro real."
        : "",
      "Este comprobante no es una boleta ni una factura.",
    ].join("\n");

    let url;

    try {
      const archivo = new Blob(["\uFEFF", contenido], {
        type: "text/plain;charset=utf-8",
      });

      url = URL.createObjectURL(archivo);

      const enlace = document.createElement("a");
      const nombreSeguro = String(orden.id).replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );

      enlace.href = url;
      enlace.download = `comprobante-${nombreSeguro}.txt`;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      mostrarAviso("Se solicitó la descarga del comprobante.");
    } catch {
      mostrarAviso(
        "No pudimos descargar el comprobante. Guarda el número de orden y el correo de compra.",
        "warning"
      );
    } finally {
      if (url) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }
  }

  if (!orden) {
    return (
      <section
        className="container my-4 my-sm-5"
        style={{ maxWidth: "700px" }}
      >
        <div className="p-3 p-sm-4 bg-white shadow-sm rounded">
          <Alert variant="warning" role="alert">
            <Alert.Heading>No encontramos esta orden</Alert.Heading>

            <p className="mb-0">
              No podemos confirmar una compra con este identificador.
              Revisa tus pedidos antes de realizar otra compra.
            </p>
          </Alert>

          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/pedido" variant="outline-secondary">
              Mis pedidos
            </Button>

            <Button as={Link} to="/productos" variant="outline-secondary">
              Ver productos
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const cancelada = orden.estado === "cancelado";
  const estado = ESTADOS[orden.estado] || orden.estado || "Pendiente";

  const productos = Array.isArray(orden.productos)
    ? orden.productos
    : [];

  return (
    <section
      className="container my-4 my-sm-5"
      style={{ maxWidth: "700px" }}
    >
      <div className="p-3 p-sm-4 bg-white shadow-sm rounded">
        <div className="text-center mb-4">
          <h1
            className={`h2 mb-3 ${
              cancelada ? "text-danger" : "text-success"
            }`}
          >
            {cancelada ? "Pedido cancelado" : "¡Compra registrada!"}
          </h1>

          <p>
            {cancelada
              ? "Esta orden figura como cancelada."
              : "Tu pedido quedó registrado correctamente."}
          </p>

          <Badge
            bg={
              cancelada
                ? "danger"
                : orden.estado === "completado"
                  ? "success"
                  : "secondary"
            }
            className="px-3 py-2"
          >
            Estado: {estado}
          </Badge>
        </div>

        {orden.pagoSimulado && (
          <Alert variant="info" role="note">
            Esta compra utiliza un pago simulado. No se realizó
            ningún cobro real.
          </Alert>
        )}

        <div
          className="p-3 p-sm-4 rounded mb-4 text-center"
          style={{
            background: "#fff5e1",
            border: "2px solid #ffc0cb",
          }}
        >
          <h2 className="h5" style={{ color: "#8b4513" }}>
            Guarda tu número de orden
          </h2>

          <p
            className="fw-bold my-3"
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
              overflowWrap: "anywhere",
              userSelect: "all",
              color: "#8b4513",
            }}
          >
            {orden.id}
          </p>

          <p className="mb-3">
            Para consultar como invitado necesitarás este número
            y el correo de compra.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={copiarNumeroOrden}
              style={{ minHeight: "44px" }}
            >
              Copiar número de orden
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={descargarComprobante}
              style={{ minHeight: "44px" }}
            >
              Descargar comprobante
            </Button>
          </div>
        </div>

        {aviso.id === idOrden && aviso.texto && (
          <Alert variant={aviso.tipo} role="status">
            {aviso.texto}
          </Alert>
        )}

        <div
          className="p-3 bg-light rounded mb-4"
          style={{ overflowWrap: "anywhere" }}
        >
          <h2 className="h5 mb-3" style={{ color: "#8b4513" }}>
            Datos de despacho
          </h2>

          <p>
            <strong>Nombre:</strong> {orden.nombre}
          </p>

          <p>
            <strong>Correo de compra:</strong>{" "}
            {orden.email || orden.correo}
          </p>

          <p>
            <strong>Dirección:</strong> {orden.direccion}
          </p>

          <p className="mb-0">
            <strong>Teléfono:</strong>{" "}
            {orden.telefono || "Sin registrar"}
          </p>
        </div>

        {productos.length > 0 && (
          <div className="mb-4">
            <h2 className="h5 mb-3" style={{ color: "#8b4513" }}>
              Productos
            </h2>

            <ul className="list-unstyled mb-0">
              {productos.map((producto) => (
                <li
                  key={producto.id}
                  className="d-flex justify-content-between flex-wrap gap-2 py-3 border-bottom"
                >
                  <span style={{ flex: "1 1 180px" }}>
                    {producto.nombre} × {producto.cantidad}
                  </span>

                  <strong>
                    {formatearPrecio(
                      producto.precioFinal * producto.cantidad
                    )}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          {orden.ahorro > 0 && (
            <p className="text-success">
              Ahorro total: {formatearPrecio(orden.ahorro)}
            </p>
          )}

          <p className="fs-5 mb-0" style={{ color: "#8b4513" }}>
            <strong>
              Total de la compra: {formatearPrecio(orden.total)}
            </strong>
          </p>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button
            as={Link}
            to="/pedido"
            style={{
              background: "#8b4513",
              border: "none",
              minHeight: "44px",
            }}
          >
            Consultar mis pedidos
          </Button>

          <Button
            as={Link}
            to="/productos"
            variant="outline-secondary"
            style={{ minHeight: "44px" }}
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    </section>
  );
}