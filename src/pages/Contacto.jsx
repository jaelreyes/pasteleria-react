import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'

const datosIniciales = {
  nombre: '',
  correo: '',
  asunto: '',
  comentario: '',
}

function Contacto() {
  const [datos, setDatos] = useState(datosIniciales)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  // Actualiza el campo sin modificar directamente el estado.
  function actualizarCampo(evento) {
    const { name, value } = evento.target

    setDatos(datosActuales => ({
      ...datosActuales,
      [name]: value,
    }))
  }

  function validarFormulario() {
    const nuevosErrores = {}
    const nombre = datos.nombre.trim()
    const correo = datos.correo.trim()
    const comentario = datos.comentario.trim()

    if (nombre.length < 3 || nombre.length > 100) {
      nuevosErrores.nombre = 'El nombre debe tener entre 3 y 100 caracteres.'
    }

    const correoPermitido =
      /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i

    if (correo.length > 100 || !correoPermitido.test(correo)) {
      nuevosErrores.correo =
        'Ingresa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com, de máximo 100 caracteres.'
    }

    if (comentario.length < 10 || comentario.length > 500) {
      nuevosErrores.comentario =
        'El comentario debe tener entre 10 y 500 caracteres.'
    }

    return nuevosErrores
  }

  function enviarMensaje(evento) {
    evento.preventDefault()

    const nuevosErrores = validarFormulario()
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      return
    }

    // Envío simulado: todavía no existe conexión con un backend.
    setEnviado(true)
    setDatos(datosIniciales)
  }

  function escribirOtroMensaje() {
    setEnviado(false)
    setErrores({})
  }

  return (
    <section>
      <h1>Contáctanos</h1>
      <p className="lead">
        Estamos aquí para ayudarte con tu pedido especial.
      </p>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          {enviado ? (
            <Alert variant="success">
              <Alert.Heading>Mensaje enviado</Alert.Heading>
              <p>
                Gracias por contactarnos. Te responderemos a la brevedad.
              </p>
              <p className="small">
                Demostración académica: el envío es simulado.
              </p>

              <Button
                variant="outline-success"
                onClick={escribirOtroMensaje}
              >
                Escribir otro mensaje
              </Button>
            </Alert>
          ) : (
            <>
              <h2>Envíanos un mensaje</h2>
              <p>Los campos marcados con * son obligatorios.</p>

              <Form noValidate onSubmit={enviarMensaje}>
                <Form.Group className="mb-3" controlId="contacto-nombre">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    autoComplete="name"
                    value={datos.nombre}
                    onChange={actualizarCampo}
                    maxLength={100}
                    required
                    isInvalid={Boolean(errores.nombre)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errores.nombre}
                  </Form.Control.Feedback>
                  <Form.Text>
                    Entre 3 y 100 caracteres. {datos.nombre.length}/100
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="contacto-correo">
                  <Form.Label>Correo electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    autoComplete="email"
                    value={datos.correo}
                    onChange={actualizarCampo}
                    maxLength={100}
                    required
                    isInvalid={Boolean(errores.correo)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errores.correo}
                  </Form.Control.Feedback>
                  <Form.Text>
                    Solo aceptamos @duoc.cl, @profesor.duoc.cl y @gmail.com.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="contacto-asunto">
                  <Form.Label>Asunto</Form.Label>
                  <Form.Select
                    name="asunto"
                    value={datos.asunto}
                    onChange={actualizarCampo}
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="Pedido Especial">Pedido Especial</option>
                    <option value="Consulta General">Consulta General</option>
                    <option value="Sugerencia">Sugerencia</option>
                    <option value="Reclamo">Reclamo</option>
                    <option value="Otro">Otro</option>
                  </Form.Select>
                  <Form.Text>
                    Opcional: nos ayuda a derivar tu mensaje más rápido.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="contacto-comentario">
                  <Form.Label>Comentario *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="comentario"
                    value={datos.comentario}
                    onChange={actualizarCampo}
                    maxLength={500}
                    required
                    isInvalid={Boolean(errores.comentario)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errores.comentario}
                  </Form.Control.Feedback>
                  <Form.Text>
                    Entre 10 y 500 caracteres.
                    {' '}{datos.comentario.length}/500
                  </Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary">
                  Enviar mensaje
                </Button>
              </Form>
            </>
          )}
        </Col>

        <Col xs={12} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">Información de contacto</Card.Title>

              <dl className="mb-0">
                <dt>Ubicación</dt>
                <dd>Av. Dulce 123, Santiago, Chile</dd>

                <dt>Teléfono</dt>
                <dd>
                  <a href="tel:+56912345678">+56 9 1234 5678</a>
                </dd>

                <dt>Correo</dt>
                <dd>
                  <a href="mailto:contacto@1000sabores.cl">
                    contacto@1000sabores.cl
                  </a>
                </dd>

                <dt>Horario</dt>
                <dd>Lunes a Domingo: 9:00 - 20:00</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  )
}

export default Contacto