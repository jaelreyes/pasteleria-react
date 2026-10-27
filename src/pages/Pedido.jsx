import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Badge, Form } from "react-bootstrap";
import { obtenerOrdenes, obtenerUsuarioActivo } from "../data/db";
import { formatearPrecio } from "../utils/precios";
import "../styles/Pedido.css";

// Texto y color del Badge de Bootstrap para cada estado.
const ESTADOS = {
  pendiente: { texto: "Pendiente", color: "secondary" },
  procesando: { texto: "En preparación", color: "warning" },
  enviado: { texto: "Enviado", color: "primary" },
  completado: { texto: "Entregado", color: "success" },
  cancelado: { texto: "Cancelado", color: "danger" },
};

// Etapas del seguimiento, en orden.
const ETAPAS = [
  {
    estado: "pendiente",
    titulo: "Pedido recibido",
    descripcion: "Tu compra quedó registrada y está pendiente de preparación.",
  },
  {
    estado: "procesando",
    titulo: "En preparación",
    descripcion: "Estamos preparando los productos de tu pedido.",
  },
  {
    estado: "enviado",
    titulo: "Enviado",
    descripcion: "Tu pedido salió de la pastelería y está en camino.",
  },
  {
    estado: "completado",
    titulo: "Entregado",
    descripcion: "Tu pedido figura como entregado. ¡Gracias por tu compra!",
  },
];

function normalizarCorreo(correo) {
  return String(correo || "").trim().toLowerCase();
}

function normalizarId(id) {
  return String(id || "").trim().toUpperCase();
}

// Línea de avance del pedido según su estado.
function SeguimientoPedido({ estado = "pendiente" }) {
  if (estado === "cancelado") {
    return (
      <Alert variant="warning" role="note">
        Este pedido fue cancelado. Si tienes dudas,{" "}
        <Link to="/contacto">contáctanos</Link>.
      </Alert>
    );
  }

  const pasoActual = ETAPAS.findIndex(
    (etapa) => etapa.estado === estado
  );

  // Estado desconocido: no se muestra la línea de avance.
  if (pasoActual === -1) {
    return (
      <p className="text-muted">
        El seguimiento no está disponible para este estado.
      </p>
    );
  }

  return (
    <section
      className="pedido-seguimiento"
      aria-label="Seguimiento del pedido"
    >
      <h3>Seguimiento de tu pedido</h3>

      <ol className="pedido-seguimiento-etapas">
        {/* Cada etapa se marca como completa, actual o pendiente */}
        {ETAPAS.map((etapa, indice) => {
          const anterior = indice < pasoActual;
          const actual = indice === pasoActual;

          return (
            <li
              key={etapa.estado}
              className={[
                "pedido-seguimiento-etapa",
                anterior ? "completa" : "",
                actual ? "actual" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={actual ? "step" : undefined}
            >
              <span
                className="pedido-seguimiento-numero"
                aria-hidden="true"
              >
                {anterior ? "✓" : indice + 1}
              </span>

              <span>
                <strong>{etapa.titulo}</strong>
                <small>
                  {actual
                    ? "Estado actual"
                    : anterior
                      ? "Etapa superada"
                      : "Por realizar"}
                </small>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="pedido-seguimiento-descripcion">
        {ETAPAS[pasoActual].descripcion}
      </p>
    </section>
  );
}

// Mis pedidos (/pedido): con sesión lista tus compras; sin sesión, consulta por ID y correo.
function Pedido() {
  const [ordenes, setOrdenes] = useState(() => obtenerOrdenes());

  const [datosConsulta, setDatosConsulta] = useState({
    id: "",
    correo: "",
  });

  const [consultaRealizada, setConsultaRealizada] = useState(null);
  const [errorConsulta, setErrorConsulta] = useState("");

  const usuario = obtenerUsuarioActivo();

  const correoUsuario = normalizarCorreo(
    usuario?.correo || usuario?.email
  );

  // Pedidos a mostrar, del más reciente al más antiguo.
  const pedidos = ordenes
    .filter((orden) => {
      const correoOrden = normalizarCorreo(
        orden.email || orden.correo
      );

      if (usuario) {
        return correoUsuario !== "" && correoOrden === correoUsuario;
      }

      if (!consultaRealizada) return false;

      return (
        normalizarId(orden.id) === consultaRealizada.id &&
        correoOrden === consultaRealizada.correo
      );
    })
    .slice()
    .sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime() || 0;
      const fechaB = new Date(b.fecha).getTime() || 0;

      return fechaB - fechaA;
    });

  function actualizarConsulta(evento) {
    const { name, value } = evento.target;

    setDatosConsulta((actuales) => ({
      ...actuales,
      [name]: value,
    }));

    setConsultaRealizada(null);
    setErrorConsulta("");
  }

  // Consulta de invitado: valida ID y correo y busca la orden.
  function consultarPedido(evento) {
    evento.preventDefault();

    const id = normalizarId(datosConsulta.id);
    const correo = normalizarCorreo(datosConsulta.correo);

    if (!id || !correo) {
      setErrorConsulta("Ingresa el ID de la orden y el correo de compra.");
      return;
    }

    if (
      correo.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      setErrorConsulta("Ingresa un correo electrónico válido.");
      return;
    }

    setOrdenes(obtenerOrdenes());
    setConsultaRealizada({ id, correo });
    setErrorConsulta("");
  }

  // Vuelve a leer las órdenes (por si el admin cambió el estado).
  function actualizarPedidos() {
    setOrdenes(obtenerOrdenes());
  }

  function limpiarConsulta() {
    setDatosConsulta({ id: "", correo: "" });
    setConsultaRealizada(null);
    setErrorConsulta("");
  }

  return (
    <section className="pedido">
      <h1>Mis pedidos</h1>

      <p className="pedido-subtitulo">
        Revisa tus compras y sigue el avance de cada pedido.
      </p>

      {/* Sin sesión: formulario para consultar como invitado */}
      {!usuario && (
        <div className="pedido-consulta">
          <h2>Consultar una compra como invitado</h2>

          <p>
            Ingresa el número de orden y el correo que utilizaste
            al comprar.
          </p>

          <Form noValidate onSubmit={consultarPedido}>
            <div className="pedido-consulta-campos">
              <Form.Group controlId="consulta-pedido-id">
                <Form.Label>ID de la orden</Form.Label>

                <Form.Control
                  name="id"
                  placeholder="ORD-..."
                  value={datosConsulta.id}
                  onChange={actualizarConsulta}
                  maxLength={100}
                  required
                />
              </Form.Group>

              <Form.Group controlId="consulta-pedido-correo">
                <Form.Label>Correo de compra</Form.Label>

                <Form.Control
                  type="email"
                  name="correo"
                  autoComplete="email"
                  value={datosConsulta.correo}
                  onChange={actualizarConsulta}
                  maxLength={100}
                  required
                />
              </Form.Group>
            </div>

            {errorConsulta && (
              <Alert variant="danger" role="alert" className="mt-3">
                {errorConsulta}
              </Alert>
            )}

            <div className="pedido-consulta-acciones">
              <Button
                type="submit"
                style={{ background: "#8b4513", border: "none" }}
              >
                Consultar pedido
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                onClick={limpiarConsulta}
              >
                Limpiar
              </Button>
            </div>
          </Form>

          <p className="mt-3 mb-0">
            ¿Tienes una cuenta?{" "}
            <Link to="/login">Inicia sesión</Link> para revisar tus pedidos.
          </p>
        </div>
      )}

      <div className="pedido-acciones mb-4">
        {(usuario || consultaRealizada) && (
          <Button
            variant="outline-secondary"
            onClick={actualizarPedidos}
          >
            Actualizar pedidos
          </Button>
        )}

        <Link to="/productos">Seguir comprando</Link>
      </div>

      {!usuario && consultaRealizada && pedidos.length === 0 && (
        <Alert variant="warning" role="status">
          No encontramos una orden con ese ID y correo.
        </Alert>
      )}

      {/* Usuario sin compras */}
      {usuario && pedidos.length === 0 && (
        <div className="pedido-vacio">
          <h2>Aún no tienes pedidos</h2>
          <p>No hay compras asociadas al correo de tu cuenta.</p>

          <Button as={Link} to="/productos" variant="primary">
            Ir a la tienda
          </Button>
        </div>
      )}

      {/* Una tarjeta por pedido con productos, totales y seguimiento */}
      {pedidos.map((orden) => {
        const estadoActual = orden.estado || "pendiente";

        const estado = ESTADOS[estadoActual] || {
          texto: estadoActual,
          color: "secondary",
        };

        const fecha = new Date(orden.fecha);

        const fechaTexto = Number.isNaN(fecha.getTime())
          ? "Fecha no disponible"
          : fecha.toLocaleDateString("es-CL");

        const productos = Array.isArray(orden.productos)
          ? orden.productos
          : [];

        return (
          <article key={orden.id} className="pedido-panel mb-4">
            <div className="pedido-cabecera">
              <div>
                <Badge bg={estado.color}>{estado.texto}</Badge>

                <h2 className="h4 mt-3 pedido-identificador">
                  Pedido {orden.id}
                </h2>

                <p>Realizado el {fechaTexto}</p>
              </div>
            </div>

            <SeguimientoPedido estado={estadoActual} />

            <div className="pedido-grid">
              <div className="pedido-tarjeta">
                <h3>Productos del pedido</h3>

                {productos.length === 0 ? (
                  <p>
                    Esta orden antigua no tiene detalle de productos.
                  </p>
                ) : (
                  <ul className="pedido-productos">
                    {productos.map((producto) => (
                      <li key={producto.id}>
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                        />

                        <span>
                          {producto.nombre}

                          <small>
                            {producto.cantidad} ×{" "}
                            {formatearPrecio(producto.precioFinal)}
                          </small>
                        </span>

                        <strong>
                          {formatearPrecio(
                            producto.precioFinal * producto.cantidad
                          )}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}

                {orden.ahorro > 0 && (
                  <p className="pedido-ahorro">
                    Ahorraste {formatearPrecio(orden.ahorro)}
                  </p>
                )}

                <p className="pedido-total">
                  Total de la compra
                  <strong>{formatearPrecio(orden.total)}</strong>
                </p>
              </div>

              <div className="pedido-tarjeta">
                <h3>Datos de despacho</h3>

                <p>
                  <strong>Nombre:</strong> {orden.nombre}
                </p>

                <p>
                  <strong>Correo:</strong>{" "}
                  {orden.email || orden.correo}
                </p>

                <p>
                  <strong>Dirección:</strong> {orden.direccion}
                </p>

                <p>
                  <strong>Teléfono:</strong>{" "}
                  {orden.telefono || "Sin registrar"}
                </p>

                {orden.pagoSimulado && (
                  <p className="text-muted">
                    Compra académica con pago simulado.
                  </p>
                )}
              </div>
            </div>

            <div className="pedido-acciones">
              <Link to="/contacto">
                ¿Dudas con tu pedido? Contáctanos
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default Pedido;