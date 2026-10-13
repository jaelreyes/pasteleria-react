import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import {
  validarCorreo,
  validarPassword,
} from '../utils/validaciones'
import '../styles/Auth.css'

function Login({ onIniciarSesion }) {
  const navegar = useNavigate()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})

  function ingresar(evento) {
    evento.preventDefault()

    const nuevosErrores = {}

    if (!validarCorreo(correo)) {
      nuevosErrores.correo =
        'Ingresa un correo @duoc.cl, @profesor.duoc.cl, @duocuc.cl o @gmail.com.'
    }

    if (!validarPassword(password)) {
      nuevosErrores.password =
        'La contraseña debe tener entre 4 y 10 caracteres.'
    }

    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) return

    try {
      const usuarios = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      )

      if (!Array.isArray(usuarios)) {
        throw new Error('Datos de usuarios inválidos')
      }

      const correoBuscado = correo.trim().toLowerCase()

      const usuario = usuarios.find(
        usuario =>
          String(usuario.correo || '').trim().toLowerCase() ===
            correoBuscado &&
          usuario.password === password
      )

      if (!usuario) {
        setErrores({
          general: 'Correo o contraseña incorrectos.',
        })
        return
      }

      onIniciarSesion(usuario)
      navegar('/', { replace: true })
    } catch {
      setErrores({
        general: 'No se pudo iniciar sesión en este navegador.',
      })
    }
  }

  return (
    <section className="auth-page auth-login">
      <h1>Iniciar sesión</h1>

      <p className="auth-subtitulo">
        Ingresa a tu cuenta de Pastelería 1000 Sabores.
      </p>

      <Form className="auth-form" noValidate onSubmit={ingresar}>
        {errores.general && (
          <Alert variant="danger" role="alert">
            {errores.general}
          </Alert>
        )}

        <Form.Group className="mb-3" controlId="login-correo">
          <Form.Label>Correo electrónico</Form.Label>

          <Form.Control
            type="email"
            autoComplete="username"
            value={correo}
            onChange={evento => setCorreo(evento.target.value)}
            maxLength={100}
            isInvalid={Boolean(errores.correo)}
            required
          />

          <Form.Control.Feedback type="invalid">
            {errores.correo}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4" controlId="login-password">
          <Form.Label>Contraseña</Form.Label>

          <Form.Control
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={evento => setPassword(evento.target.value)}
            maxLength={10}
            isInvalid={Boolean(errores.password)}
            required
          />

          <Form.Control.Feedback type="invalid">
            {errores.password}
          </Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" variant="primary" className="auth-btn">
          Iniciar sesión
        </Button>

        <p className="mt-4 mb-0">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro">Regístrate</Link>
        </p>
      </Form>
    </section>
  )
}

export default Login