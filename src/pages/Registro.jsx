import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Row, Col, Button, Alert } from 'react-bootstrap'
import regionesComunas from '../data/regiones-comunas'
import {
  normalizarRun,
  validarRun,
  validarCorreo,
  validarPassword,
  validarTelefono,
  calcularEdad,
} from '../utils/validaciones'
import '../styles/Auth.css'

const datosIniciales = {
  run: '',
  nombre: '',
  apellidos: '',
  correo: '',
  fechaNacimiento: '',
  region: '',
  comuna: '',
  direccion: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  codigoPromocional: '',
}

function Registro() {
  const [datos, setDatos] = useState(datosIniciales)
  const [errores, setErrores] = useState({})
  const [usuarioCreado, setUsuarioCreado] = useState(null)

  const regionSeleccionada = regionesComunas.find(
    item => item.region === datos.region
  )

  const comunas = regionSeleccionada
    ? [...new Set(regionSeleccionada.comunas)]
    : []

  // Actualiza un campo y reinicia la comuna si cambia la región.
  function actualizarCampo(evento) {
    const { name, value } = evento.target

    setDatos(actuales => ({
      ...actuales,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {}),
    }))
  }

  // Calcula los beneficios a partir de los datos del formulario.
  function obtenerBeneficios() {
    const correo = datos.correo.trim().toLowerCase()
    const codigo = datos.codigoPromocional.trim().toUpperCase()

    const edad = datos.fechaNacimiento
      ? calcularEdad(datos.fechaNacimiento)
      : null

    const descuentoEdad =
      edad !== null && edad >= 50 && edad <= 120 ? 50 : 0

    const descuentoCodigo = codigo === 'FELICES50' ? 10 : 0

    const tortaGratisDuoc =
      validarCorreo(correo) &&
      ['duoc.cl', 'profesor.duoc.cl', 'duocuc.cl'].includes(
        correo.split('@')[1]
      )

    const beneficios = []

    if (descuentoEdad) {
      beneficios.push('50% de descuento de por vida por edad.')
    }

    if (descuentoCodigo) {
      beneficios.push('10% de descuento de por vida por FELICES50.')
    }

    if (tortaGratisDuoc) {
      beneficios.push(
        'Torta gratis en tu cumpleaños por ser de la comunidad Duoc.'
      )
    }

    return {
      beneficios,
      descuentoEdad,
      descuentoCodigo,
      tortaGratisDuoc,
    }
  }

  const beneficiosDetectados = obtenerBeneficios().beneficios

  function validarFormulario() {
    const nuevosErrores = {}

    if (!validarRun(datos.run)) {
      nuevosErrores.run =
        'Ingresa un RUN válido con su dígito verificador.'
    }

    const nombre = datos.nombre.trim()

    if (nombre.length < 2 || nombre.length > 50) {
      nuevosErrores.nombre =
        'El nombre debe tener entre 2 y 50 caracteres.'
    }

    const apellidos = datos.apellidos.trim()

    if (!apellidos || apellidos.length > 100) {
      nuevosErrores.apellidos =
        'Los apellidos son obligatorios, máximo 100 caracteres.'
    }

    if (!validarCorreo(datos.correo)) {
      nuevosErrores.correo =
        'Usa un correo @duoc.cl, @profesor.duoc.cl, @duocuc.cl o @gmail.com.'
    }

    if (datos.fechaNacimiento) {
      const fecha = new Date(`${datos.fechaNacimiento}T00:00:00`)

      if (
        Number.isNaN(fecha.getTime()) ||
        fecha > new Date() ||
        calcularEdad(datos.fechaNacimiento) > 120
      ) {
        nuevosErrores.fechaNacimiento =
          'Ingresa una fecha de nacimiento válida.'
      }
    }

    if (!regionSeleccionada) {
      nuevosErrores.region = 'Selecciona una región.'
    }

    if (!comunas.includes(datos.comuna)) {
      nuevosErrores.comuna =
        'Selecciona una comuna de la región elegida.'
    }

    const direccion = datos.direccion.trim()

    if (!direccion || direccion.length > 300) {
      nuevosErrores.direccion =
        'La dirección es obligatoria, máximo 300 caracteres.'
    }

    if (!validarTelefono(datos.telefono)) {
      nuevosErrores.telefono =
        'Ingresa un teléfono válido de 8 a 15 dígitos.'
    }

    if (!validarPassword(datos.password)) {
      nuevosErrores.password =
        'La contraseña debe tener entre 4 y 10 caracteres.'
    }

    if (
      !datos.confirmPassword ||
      datos.confirmPassword !== datos.password
    ) {
      nuevosErrores.confirmPassword =
        'Las contraseñas deben coincidir.'
    }

    const codigo = datos.codigoPromocional.trim().toUpperCase()

    if (codigo && codigo !== 'FELICES50') {
      nuevosErrores.codigoPromocional =
        'El código vigente es FELICES50.'
    }

    return nuevosErrores
  }

  function crearCuenta(evento) {
    evento.preventDefault()

    const nuevosErrores = validarFormulario()

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    try {
      const usuarios = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      )

      if (!Array.isArray(usuarios)) {
        throw new Error('Datos de usuarios inválidos')
      }

      const correo = datos.correo.trim().toLowerCase()
      const run = normalizarRun(datos.run)

      const correoRepetido = usuarios.some(
        usuario =>
          String(usuario.correo || '').trim().toLowerCase() === correo
      )

      const runRepetido = usuarios.some(
        usuario => normalizarRun(String(usuario.run || '')) === run
      )

      if (correoRepetido) {
        nuevosErrores.correo =
          'Ya existe una cuenta con este correo.'
      }

      if (runRepetido) {
        nuevosErrores.run =
          'Ya existe una cuenta con este RUN.'
      }

      if (Object.keys(nuevosErrores).length > 0) {
        setErrores(nuevosErrores)
        return
      }

      const usuario = {
        run,
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        correo,
        password: datos.password,
        fechaNacimiento: datos.fechaNacimiento || null,
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion.trim(),
        telefono: datos.telefono.trim() || null,
        codigoPromocional:
          datos.codigoPromocional.trim().toUpperCase(),
        ...obtenerBeneficios(),
        tipo: 'Cliente',
        fechaRegistro: new Date().toISOString(),
      }

      // Guarda la cuenta en el navegador, como en el prototipo original.
      localStorage.setItem(
        'usuarios',
        JSON.stringify([...usuarios, usuario])
      )

      setUsuarioCreado(usuario)
      setErrores({})
      setDatos(datosIniciales)
    } catch {
      setErrores({
        general: 'No se pudo guardar la cuenta en este navegador.',
      })
    }
  }

  // Reutiliza la etiqueta, el campo y su mensaje de error.
  function mostrarCampo(nombre, etiqueta, opciones = {}) {
    const { ayuda, ...propiedades } = opciones

    return (
      <Form.Group controlId={`registro-${nombre}`}>
        <Form.Label>{etiqueta}</Form.Label>

        <Form.Control
          {...propiedades}
          name={nombre}
          value={datos[nombre]}
          onChange={actualizarCampo}
          isInvalid={Boolean(errores[nombre])}
        />

        <Form.Control.Feedback type="invalid">
          {errores[nombre]}
        </Form.Control.Feedback>

        {ayuda && <Form.Text>{ayuda}</Form.Text>}
      </Form.Group>
    )
  }

  return (
    <section className="auth-page">
      <h1>Crear una cuenta</h1>

      <p className="auth-subtitulo">
        Regístrate y descubre los beneficios de Pastelería 1000 Sabores.
      </p>

      {usuarioCreado ? (
        <Alert variant="success" role="status">
          <Alert.Heading>
            ¡Cuenta creada correctamente!
          </Alert.Heading>

          <p>Bienvenido/a, {usuarioCreado.nombre}.</p>

          {usuarioCreado.beneficios.length > 0 && (
            <>
              <p>Estos son tus beneficios:</p>

              <ul>
                {usuarioCreado.beneficios.map(beneficio => (
                  <li key={beneficio}>{beneficio}</li>
                ))}
              </ul>
            </>
          )}

          <Button
            as={Link}
            to="/productos"
            variant="outline-success"
          >
            Explorar productos
          </Button>
        </Alert>
      ) : (
        <Form
          className="auth-form"
          noValidate
          onSubmit={crearCuenta}
        >
          <p>Los campos marcados con * son obligatorios.</p>

          {Object.keys(errores).length > 0 && (
            <Alert variant="danger" role="alert">
              {errores.general ||
                'Revisa los campos marcados en rojo.'}
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              {mostrarCampo('run', 'RUN *', {
                placeholder: '19.011.022-2',
                required: true,
              })}
            </Col>

            <Col md={6}>
              {mostrarCampo('nombre', 'Nombre *', {
                autoComplete: 'given-name',
                maxLength: 50,
                required: true,
              })}
            </Col>

            <Col md={6}>
              {mostrarCampo('apellidos', 'Apellidos *', {
                autoComplete: 'family-name',
                maxLength: 100,
                required: true,
              })}
            </Col>

            <Col md={6}>
              {mostrarCampo('correo', 'Correo electrónico *', {
                type: 'email',
                autoComplete: 'email',
                maxLength: 100,
                required: true,
                ayuda:
                  '@duoc.cl, @profesor.duoc.cl, @duocuc.cl o @gmail.com.',
              })}
            </Col>

            <Col md={6}>
              {mostrarCampo(
                'fechaNacimiento',
                'Fecha de nacimiento',
                {
                  type: 'date',
                  autoComplete: 'bday',
                }
              )}
            </Col>

            <Col md={6}>
              {mostrarCampo('telefono', 'Teléfono', {
                type: 'tel',
                autoComplete: 'tel',
                maxLength: 20,
                placeholder: '+56 9 1234 5678',
              })}
            </Col>

            <Col md={6}>
              <Form.Group controlId="registro-region">
                <Form.Label>Región *</Form.Label>

                <Form.Select
                  name="region"
                  value={datos.region}
                  onChange={actualizarCampo}
                  isInvalid={Boolean(errores.region)}
                  required
                >
                  <option value="">Selecciona una región</option>

                  {regionesComunas.map(item => (
                    <option key={item.region} value={item.region}>
                      {item.region}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {errores.region}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="registro-comuna">
                <Form.Label>Comuna *</Form.Label>

                <Form.Select
                  name="comuna"
                  value={datos.comuna}
                  onChange={actualizarCampo}
                  disabled={!datos.region}
                  isInvalid={Boolean(errores.comuna)}
                  required
                >
                  <option value="">Selecciona una comuna</option>

                  {comunas.map(comuna => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {errores.comuna}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              {mostrarCampo('direccion', 'Dirección *', {
                autoComplete: 'street-address',
                maxLength: 300,
                required: true,
                ayuda: `${datos.direccion.length}/300 caracteres.`,
              })}
            </Col>

            <Col md={6}>
              {mostrarCampo('password', 'Contraseña *', {
                type: 'password',
                autoComplete: 'new-password',
                maxLength: 10,
                required: true,
                ayuda: 'Entre 4 y 10 caracteres.',
              })}
            </Col>

            <Col md={6}>
              {mostrarCampo(
                'confirmPassword',
                'Confirmar contraseña *',
                {
                  type: 'password',
                  autoComplete: 'new-password',
                  maxLength: 10,
                  required: true,
                }
              )}
            </Col>

            <Col xs={12}>
              {mostrarCampo(
                'codigoPromocional',
                'Código promocional',
                {
                  placeholder: 'FELICES50',
                  ayuda:
                    'Opcional: FELICES50 otorga un 10% de descuento de por vida.',
                }
              )}
            </Col>
          </Row>

          {beneficiosDetectados.length > 0 && (
            <Alert variant="info" className="mt-4">
              <strong>Beneficios que obtendrás:</strong>

              <ul className="mb-0 mt-2">
                {beneficiosDetectados.map(beneficio => (
                  <li key={beneficio}>{beneficio}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Button
            type="submit"
            variant="primary"
            className="auth-btn mt-4"
          >
            Crear cuenta
          </Button>
        </Form>
      )}
    </section>
  )
}

export default Registro