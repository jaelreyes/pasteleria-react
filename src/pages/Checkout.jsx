import { useState, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import {
  obtenerUsuarioActivo,
  confirmarCompra,
} from "../data/db";
import {
  calcularTotales,
  calcularPrecioProducto,
  formatearPrecio,
} from "../utils/precios";
import { validarTelefono } from "../utils/validaciones";
import { armarDireccion } from "../utils/direccion";
import regionesComunas from "../data/regiones-comunas";

// Checkout (/checkout): datos de despacho, región y comuna en cascada y pago simulado.
export default function Checkout({
  carrito,
  descuento = 0,
  onCompraConfirmada,
}) {
  // Evita confirmar dos veces si se hace doble clic.
  const procesandoRef = useRef(false);

  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [idOrdenConfirmada, setIdOrdenConfirmada] = useState(null);
  const [pagoRechazado, setPagoRechazado] = useState(null);

  // Formulario precargado con los datos del usuario con sesión.
  const [formData, setFormData] = useState(() => {
    const usuario = obtenerUsuarioActivo();

    return {
      nombre: usuario
        ? `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim()
        : "",
      email: usuario?.correo || usuario?.email || "",
      telefono: usuario?.telefono || "",
      direccion: usuario?.direccion || "",
      departamento: "",
      region: usuario?.region || "",
      comuna: usuario?.comuna || "",
      indicaciones: "",
      metodoPago: "webpay",
      simularRechazo: false,
    };
  });

  // Comunas de la región elegida (select en cascada).
  const regionSeleccionada = regionesComunas.find(
    (item) => item.region === formData.region
  );

  const comunas = regionSeleccionada
    ? [...new Set(regionSeleccionada.comunas)]
    : [];

  const { subtotal, ahorro, total } = calcularTotales(
    carrito,
    descuento
  );

  // La confirmación tiene prioridad aunque el carrito ya esté vacío.
  if (idOrdenConfirmada) {
    return (
      <Navigate
        to={`/pago/exito/${idOrdenConfirmada}`}
        replace
      />
    );
  }

  // Pago rechazado: muestra el resumen sin guardar la orden.
  if (pagoRechazado) {
    return (
      <Navigate
        to="/pago/error"
        state={{ pago: pagoRechazado }}
        replace
      />
    );
  }

  // Solo vuelve al carrito si no hay una compra recién confirmada.
  if (carrito.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  // Actualiza el campo que cambió (los checkbox usan checked).
  function handleChange(evento) {
    const { name, value, type, checked } = evento.target;

    setFormData((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
      // Al cambiar de región, la comuna anterior deja de ser válida.
      ...(name === "region" ? { comuna: "" } : {}),
    }));

    setError("");
  }

  // Valida el formulario y confirma o rechaza el pago.
  function handleSubmit(evento) {
    evento.preventDefault();

    if (procesandoRef.current) return;

    const nombre = formData.nombre.trim();
    const email = formData.email.trim().toLowerCase();
    const telefono = formData.telefono.trim();
    const direccion = formData.direccion.trim();
    const departamento = formData.departamento.trim();
    const indicaciones = formData.indicaciones.trim();

    // Validaciones de los datos de despacho.
    if (!nombre || !email || !telefono || !direccion) {
      setError("Completa todos los campos obligatorios de despacho.");
      return;
    }

    if (
      email.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!validarTelefono(telefono)) {
      setError("Ingresa un teléfono válido de 8 a 15 dígitos.");
      return;
    }

    if (nombre.length > 150 || direccion.length > 300) {
      setError("El nombre o la dirección superan el largo permitido.");
      return;
    }

    if (!regionSeleccionada) {
      setError("Selecciona la región de despacho.");
      return;
    }

    if (!comunas.includes(formData.comuna)) {
      setError("Selecciona una comuna de la región elegida.");
      return;
    }

    if (departamento.length > 50 || indicaciones.length > 300) {
      setError("El departamento o las indicaciones superan el largo permitido.");
      return;
    }

    // Datos de la orden; la dirección se arma en una sola línea.
    const datosCompra = {
      id: `ORD-${crypto.randomUUID()}`,
      nombre,
      email,
      telefono,
      direccion: armarDireccion({
        direccion,
        departamento,
        comuna: formData.comuna,
        region: formData.region,
      }),
      calle: direccion,
      departamento,
      region: formData.region,
      comuna: formData.comuna,
      indicaciones,
      metodoPago: formData.metodoPago,
      fecha: new Date().toISOString(),
    };

    // Simulación de rechazo: no descuenta stock ni guarda la orden.
    if (formData.simularRechazo) {
      setPagoRechazado({
        ...datosCompra,
        total,
        productos: carrito.map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          imagen: producto.imagen,
          cantidad: producto.cantidad,
          precioFinal: calcularPrecioProducto(producto, descuento)
            .precioFinal,
        })),
      });
      return;
    }

    if (!["webpay", "transferencia"].includes(formData.metodoPago)) {
      setError("Selecciona un medio de pago válido.");
      return;
    }

    procesandoRef.current = true;
    setProcesando(true);
    setError("");

    let ordenGuardada;

    try {
      // Guarda la orden y descuenta stock (db.js). Si falla, muestra el error.
      ordenGuardada = confirmarCompra(datosCompra, carrito, descuento);
    } catch (errorCompra) {
      setError(
        errorCompra instanceof Error
          ? errorCompra.message
          : "No se pudo completar la compra."
      );

      procesandoRef.current = false;
      setProcesando(false);
      return;
    }

    // Guarda primero el destino de confirmación.
    setIdOrdenConfirmada(ordenGuardada.id);

    // Después vacía el carrito.
    onCompraConfirmada();
  }

  return (
    <section
      className="container my-5"
      style={{ maxWidth: "700px" }}
    >
      <h1 className="mb-4" style={{ color: "#5c3d2e" }}>
        Finalizar compra
      </h1>

      <Alert variant="info" role="note">
        Pago simulado para el proyecto académico. No se realiza
        ningún cobro real.
      </Alert>

      {/* Resumen de los productos y totales */}
      <div className="p-4 bg-white shadow-sm rounded mb-4">
        <h2 className="h4">Resumen de compra</h2>

        <ul>
          {carrito.map((producto) => {
            const { precioFinal } = calcularPrecioProducto(
              producto,
              descuento
            );

            return (
              <li key={producto.id}>
                {producto.nombre} × {producto.cantidad}
                {" — "}
                {formatearPrecio(precioFinal * producto.cantidad)}
              </li>
            );
          })}
        </ul>

        <p>
          Subtotal sin descuentos: {formatearPrecio(subtotal)}
        </p>

        {ahorro > 0 && (
          <p className="text-success">
            Ahorro total: {formatearPrecio(ahorro)}
          </p>
        )}

        <p className="fs-5 mb-0">
          <strong>Total: {formatearPrecio(total)}</strong>
        </p>
      </div>

      {error && (
        <Alert variant="danger" role="alert">
          {error}

          <div className="mt-2">
            <Link to="/carrito">Volver a revisar el carrito</Link>
          </div>
        </Alert>
      )}

      <Form
        noValidate
        onSubmit={handleSubmit}
        className="p-4 bg-white shadow-sm rounded"
      >
        {/* Se deshabilita mientras se procesa la compra */}
        <fieldset disabled={procesando}>
          <legend className="h4">Datos de despacho</legend>

          <Form.Group className="mb-3" controlId="checkout-nombre">
            <Form.Label>Nombre y apellidos *</Form.Label>

            <Form.Control
              name="nombre"
              autoComplete="name"
              maxLength={150}
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkout-email">
            <Form.Label>Correo electrónico *</Form.Label>

            <Form.Control
              type="email"
              name="email"
              autoComplete="email"
              maxLength={100}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkout-telefono">
            <Form.Label>Teléfono *</Form.Label>

            <Form.Control
              type="tel"
              name="telefono"
              autoComplete="tel"
              maxLength={20}
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col md={8}>
              <Form.Group controlId="checkout-direccion">
                <Form.Label>Dirección de despacho *</Form.Label>

                <Form.Control
                  name="direccion"
                  autoComplete="street-address"
                  placeholder="Calle y número"
                  maxLength={300}
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="checkout-departamento">
                <Form.Label>Departamento (opcional)</Form.Label>

                <Form.Control
                  name="departamento"
                  placeholder="Ej: 603"
                  maxLength={50}
                  value={formData.departamento}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group controlId="checkout-region">
                <Form.Label>Región *</Form.Label>

                <Form.Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una región</option>

                  {regionesComunas.map((item) => (
                    <option key={item.region} value={item.region}>
                      {item.region}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="checkout-comuna">
                <Form.Label>Comuna *</Form.Label>

                <Form.Select
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  disabled={!regionSeleccionada}
                  required
                >
                  <option value="">Selecciona una comuna</option>

                  {comunas.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="checkout-indicaciones">
            <Form.Label>Indicaciones para la entrega (opcional)</Form.Label>

            <Form.Control
              as="textarea"
              rows={2}
              name="indicaciones"
              placeholder="Ej: entre calles, color del edificio, no tiene timbre."
              maxLength={300}
              value={formData.indicaciones}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkout-pago">
            <Form.Label>Medio de pago simulado</Form.Label>

            <Form.Select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
            >
              <option value="webpay">Webpay</option>
              <option value="transferencia">Transferencia</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            id="checkout-simular-rechazo"
            name="simularRechazo"
            className="mb-4"
            label="Simular pago rechazado (para probar la vista de error)"
            checked={formData.simularRechazo}
            onChange={handleChange}
          />

          <Button
            type="submit"
            className="w-100"
            style={{ background: "#8d5524", border: "none" }}
          >
            {procesando
              ? "Procesando..."
              : "Confirmar compra simulada"}
          </Button>
        </fieldset>
      </Form>

      <p className="mt-3">
        <Link to="/carrito">Volver al carrito</Link>
      </p>
    </section>
  );
}