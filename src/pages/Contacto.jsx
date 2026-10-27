import { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import "../styles/Contacto.css";

// Valores vacíos del formulario de contacto.
const datosIniciales = {
  nombre: "",
  correo: "",
  asunto: "",
  comentario: "",
};

// Ícono SVG según el tipo de dato de contacto.
function IconoContacto({ tipo }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === "ubicacion" && (
        <>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </>
      )}

      {tipo === "telefono" && (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      )}

      {tipo === "correo" && (
        <>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </>
      )}

      {tipo === "horario" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      )}
    </svg>
  );
}

// Devuelve el mensaje de error de un campo, o "" si está bien.
function validarCampo(nombre, valor) {
  const texto = valor.trim();

  if (nombre === "nombre" && (texto.length < 3 || texto.length > 100)) {
    return "El nombre debe tener entre 3 y 100 caracteres.";
  }

  if (nombre === "correo") {
    const correoPermitido =
      /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

    if (texto.length > 100 || !correoPermitido.test(texto)) {
      return "Ingresa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com, de máximo 100 caracteres.";
    }
  }

  if (
    nombre === "comentario" &&
    (texto.length < 10 || texto.length > 500)
  ) {
    return "El comentario debe tener entre 10 y 500 caracteres.";
  }

  return "";
}

// Página de contacto con formulario validado y datos de la tienda.
function Contacto() {
  const [datos, setDatos] = useState({ ...datosIniciales });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const formularioRef = useRef(null);

  // Guarda lo que se escribe en el estado (formulario controlado).
  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setDatos((actuales) => ({
      ...actuales,
      [name]: value,
    }));

    // Actualiza el mensaje mientras se corrige un campo con error.
    if (errores[name]) {
      setErrores((actuales) => ({
        ...actuales,
        [name]: validarCampo(name, value),
      }));
    }
  }

  // Valida el campo cuando el usuario sale de él.
  function validarAlSalir(evento) {
    const { name, value } = evento.target;

    setErrores((actuales) => ({
      ...actuales,
      [name]: validarCampo(name, value),
    }));
  }

  // Valida todo el formulario antes de "enviar".
  function enviarMensaje(evento) {
    evento.preventDefault();

    const nuevosErrores = {};

    ["nombre", "correo", "comentario"].forEach((campo) => {
      const error = validarCampo(campo, datos[campo]);

      if (error) {
        nuevosErrores[campo] = error;
      }
    });

    setErrores(nuevosErrores);

    const primerCampoInvalido = Object.keys(nuevosErrores)[0];

    if (primerCampoInvalido) {
      formularioRef.current?.elements
        .namedItem(primerCampoInvalido)
        ?.focus();
      return;
    }

    // Simulación académica: no envía correos ni mensajes reales.
    setEnviado(true);
    setDatos({ ...datosIniciales });
  }

  function escribirOtroMensaje() {
    setEnviado(false);
    setErrores({});
  }

  return (
    <div className="contacto-page">
      <section className="contacto-hero">
        <div className="contacto-marca">
          <img
            src="/images/logo-completo.png"
            className="contacto-logo"
            alt="Pastelería 1000 Sabores"
            width={140}
            height={153}
          />
        </div>

        <h1>Contáctanos</h1>
        <p>Estamos aquí para ayudarte con tu pedido especial</p>
      </section>

      <section
        className="contacto-contenido"
        aria-label="Formulario e información de contacto"
      >
        <div className="contacto-grid">
          <div className="contacto-formulario">
            <h2>Envíanos un Mensaje</h2>

            {/* Mensaje de éxito o formulario */}
            {enviado ? (
              <div className="contacto-exito" role="status">
                <span className="contacto-exito-icono" aria-hidden="true">
                  ✓
                </span>

                <h3>Mensaje Enviado</h3>
                <p>
                  Gracias por contactarnos. Te responderemos a la brevedad.
                </p>

                <p className="contacto-nota">
                  Demostración académica: el envío es simulado.
                </p>

                <button
                  type="button"
                  className="contacto-boton-secundario"
                  onClick={escribirOtroMensaje}
                >
                  Escribir otro mensaje
                </button>
              </div>
            ) : (
              <Form
                ref={formularioRef}
                noValidate
                onSubmit={enviarMensaje}
              >
                <p className="contacto-nota">
                  Los campos marcados con * son obligatorios.
                </p>

                <Form.Group
                  className="contacto-campo-grupo"
                  controlId="contacto-nombre"
                >
                  <Form.Label>Nombre *</Form.Label>

                  <Form.Control
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                    value={datos.nombre}
                    onChange={actualizarCampo}
                    onBlur={validarAlSalir}
                    maxLength={100}
                    required
                    isInvalid={Boolean(errores.nombre)}
                    aria-describedby="contacto-ayuda-nombre contacto-error-nombre"
                  />

                  <small
                    id="contacto-ayuda-nombre"
                    className="contacto-ayuda"
                  >
                    Entre 3 y 100 caracteres.
                  </small>

                  <small className="contacto-contador">
                    {datos.nombre.length}/100
                  </small>

                  <Form.Control.Feedback
                    type="invalid"
                    id="contacto-error-nombre"
                  >
                    {errores.nombre}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group
                  className="contacto-campo-grupo"
                  controlId="contacto-correo"
                >
                  <Form.Label>Correo Electrónico *</Form.Label>

                  <Form.Control
                    type="email"
                    name="correo"
                    placeholder="tunombre@duoc.cl"
                    autoComplete="email"
                    value={datos.correo}
                    onChange={actualizarCampo}
                    onBlur={validarAlSalir}
                    maxLength={100}
                    required
                    isInvalid={Boolean(errores.correo)}
                    aria-describedby="contacto-ayuda-correo contacto-error-correo"
                  />

                  <small
                    id="contacto-ayuda-correo"
                    className="contacto-ayuda"
                  >
                    Solo aceptamos @duoc.cl, @profesor.duoc.cl y
                    @gmail.com (máx. 100 caracteres).
                  </small>

                  <Form.Control.Feedback
                    type="invalid"
                    id="contacto-error-correo"
                  >
                    {errores.correo}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group
                  className="contacto-campo-grupo"
                  controlId="contacto-asunto"
                >
                  <Form.Label>Asunto</Form.Label>

                  <Form.Select
                    name="asunto"
                    value={datos.asunto}
                    onChange={actualizarCampo}
                    aria-describedby="contacto-ayuda-asunto"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="pedido">Pedido Especial</option>
                    <option value="consulta">Consulta General</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="otro">Otro</option>
                  </Form.Select>

                  <small
                    id="contacto-ayuda-asunto"
                    className="contacto-ayuda"
                  >
                    Opcional: nos ayuda a derivar tu mensaje más rápido.
                  </small>
                </Form.Group>

                <Form.Group
                  className="contacto-campo-grupo"
                  controlId="contacto-comentario"
                >
                  <Form.Label>Comentario *</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="comentario"
                    placeholder="Cuéntanos qué necesitas..."
                    value={datos.comentario}
                    onChange={actualizarCampo}
                    onBlur={validarAlSalir}
                    maxLength={500}
                    required
                    isInvalid={Boolean(errores.comentario)}
                    aria-describedby="contacto-ayuda-comentario contacto-error-comentario"
                  />

                  <small
                    id="contacto-ayuda-comentario"
                    className="contacto-ayuda"
                  >
                    Entre 10 y 500 caracteres.
                  </small>

                  <small className="contacto-contador">
                    {datos.comentario.length}/500
                  </small>

                  <Form.Control.Feedback
                    type="invalid"
                    id="contacto-error-comentario"
                  >
                    {errores.comentario}
                  </Form.Control.Feedback>
                </Form.Group>

                <button type="submit" className="contacto-boton-enviar">
                  Enviar Mensaje
                </button>
              </Form>
            )}
          </div>

          {/* Información de contacto de la tienda */}
          <aside className="contacto-info">
            <h2>Información de Contacto</h2>

            <div className="contacto-info-card">
              <IconoContacto tipo="ubicacion" />
              <div>
                <h3>Ubicación</h3>
                <p>Av. Dulce 123, Santiago, Chile</p>
              </div>
            </div>

            <div className="contacto-info-card">
              <IconoContacto tipo="telefono" />
              <div>
                <h3>Teléfono</h3>
                <p>
                  <a href="tel:+56912345678">+56 9 1234 5678</a>
                </p>
              </div>
            </div>

            <div className="contacto-info-card">
              <IconoContacto tipo="correo" />
              <div>
                <h3>Correo</h3>
                <p>
                  <a href="mailto:contacto@1000sabores.cl">
                    contacto@1000sabores.cl
                  </a>
                </p>
              </div>
            </div>

            <div className="contacto-info-card">
              <IconoContacto tipo="horario" />
              <div>
                <h3>Horario</h3>
                <p>Lunes a Domingo: 9:00 - 20:00</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default Contacto;