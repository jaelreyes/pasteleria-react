import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Badge, Form } from "react-bootstrap";
import { obtenerOrdenes, obtenerUsuarioActivo } from "../data/db";
import { formatearPrecio } from "../utils/precios";
import "../styles/Pedido.css";

const ESTADOS = {
  pendiente: { texto: "Pendiente", color: "secondary" },
  procesando: { texto: "En preparación", color: "warning" },
  completado: { texto: "Completado", color: "success" },
  cancelado: { texto: "Cancelado", color: "danger" },
};

function normalizarCorreo(correo) {
  return String(correo || "").trim().toLowerCase();
}

function normalizarId(id) {
  return String(id || "").trim().toUpperCase();
}

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
        Revisa tus compras y el estado de cada pedido.
      </p>

      {!usuario && (
        <div className="pedido-consulta">
          <h2>Consultar una compra como invitado</h2>

          <p>
            Ingresa el identificador que apareció al confirmar la compra
            y el correo utilizado en el despacho.
          </p>

          <Form noValidate onSubmit={consultarPedido}>
            <div className="pedido-consulta-campos">
              <Form.Group controlId="consulta-pedido-id">
                <Form.Label>ID de la orden</Form.Label>

                <Form.Control
                  type="text"
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
                  placeholder="tucorreo@gmail.com"
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
            <Link to="/login">Inicia sesión</Link> para revisar
            tus pedidos.
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
          Comprueba que ambos correspondan a la misma compra.
        </Alert>
      )}

      {usuario && pedidos.length === 0 && (
        <div className="pedido-vacio">
          <h2>Aún no tienes pedidos</h2>

          <p>
            No hay compras asociadas al correo de tu cuenta.
          </p>

          <Button as={Link} to="/productos" variant="primary">
            Ir a la tienda
          </Button>
        </div>
      )}

      {pedidos.map((orden) => {
        const estado = ESTADOS[orden.estado] || {
          texto: orden.estado || "Pendiente",
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

            <div className="pedido-grid">
              <div className="pedido-tarjeta">
                <h3>Productos del pedido</h3>

                {productos.length === 0 ? (
                  <p>
                    Esta orden antigua no tiene un detalle de productos
                    guardado.
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