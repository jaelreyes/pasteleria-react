import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Badge } from "react-bootstrap";
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

function Pedido() {
  const [ordenes, setOrdenes] = useState(() => obtenerOrdenes());
  const usuario = obtenerUsuarioActivo();

  const correoUsuario = normalizarCorreo(
    usuario?.correo || usuario?.email
  );

  // Con sesión, muestra únicamente las órdenes del usuario.
  // Sin sesión, muestra las compras de este navegador para la demostración.
  const pedidos = ordenes
    .filter((orden) => {
      if (!usuario) return true;

      return (
        correoUsuario !== "" &&
        normalizarCorreo(orden.email || orden.correo) === correoUsuario
      );
    })
    .slice()
    .reverse();

  function actualizarPedidos() {
    setOrdenes(obtenerOrdenes());
  }

  return (
    <section className="pedido">
      <h1>Mis pedidos</h1>

      <p className="pedido-subtitulo">
        Revisa tus compras y el estado de cada pedido.
      </p>

      {!usuario && (
        <Alert variant="info">
          Estás viendo las compras guardadas en este navegador.
          {" "}
          <Link to="/login">Inicia sesión</Link> para consultar las
          asociadas a tu correo.
        </Alert>
      )}

      <div className="pedido-acciones mb-4">
        <Button
          variant="outline-secondary"
          onClick={actualizarPedidos}
        >
          Actualizar pedidos
        </Button>

        <Link to="/productos">Seguir comprando</Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="pedido-vacio">
          <h2>Aún no tienes pedidos</h2>
          <p>Cuando realices una compra, podrás consultarla aquí.</p>

          <Button as={Link} to="/productos" variant="primary">
            Ir a la tienda
          </Button>
        </div>
      ) : (
        pedidos.map((orden) => {
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
            <article
              key={orden.id}
              className="pedido-panel mb-4"
            >
              <div className="pedido-cabecera">
                <div>
                  <Badge bg={estado.color}>{estado.texto}</Badge>

                  <h2 className="h4 mt-3">Pedido {orden.id}</h2>
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
                    <strong>Teléfono:</strong> {orden.telefono || "Sin registrar"}
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
        })
      )}
    </section>
  );
}

export default Pedido;