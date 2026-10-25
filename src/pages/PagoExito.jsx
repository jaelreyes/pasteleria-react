import { useParams, Link } from "react-router-dom";
import { Alert, Button, Badge } from "react-bootstrap";
import { obtenerOrdenPorId } from "../data/db";
import { formatearPrecio } from "../utils/precios";

const ESTADOS = {
  pendiente: "Pendiente",
  procesando: "En preparación",
  completado: "Completado",
  cancelado: "Cancelado",
};

export default function PagoExito() {
  const { idOrden } = useParams();

  // Consulta la orden correspondiente al ID actual de la URL.
  const orden = idOrden ? obtenerOrdenPorId(idOrden) : null;

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

          <p className="mb-3">
            {cancelada
              ? "Esta orden figura como cancelada."
              : "Tu pedido quedó registrado correctamente. Puedes revisar su avance en Mis pedidos."}
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
          className="p-3 rounded mb-4"
          style={{
            background: "#fff5e1",
            overflowWrap: "anywhere",
          }}
        >
          <h2 className="h5 mb-3" style={{ color: "#8b4513" }}>
            Datos del pedido
          </h2>

          <p>
            <strong>ID de orden:</strong> {orden.id}
          </p>

          <p>
            <strong>Nombre:</strong> {orden.nombre}
          </p>

          <p>
            <strong>Correo:</strong> {orden.email || orden.correo}
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
            style={{ background: "#8b4513", border: "none" }}
          >
            Ver mis pedidos
          </Button>

          <Button as={Link} to="/productos" variant="outline-secondary">
            Seguir comprando
          </Button>
        </div>
      </div>
    </section>
  );
}