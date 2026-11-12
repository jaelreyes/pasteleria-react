// Pruebas del login conectado al backend: la API se simula con spyOn sobre api.post.
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import {
  MemoryRouter,
  Routes,
  Route,
} from 'react-router-dom'
import Login from '../pages/Login'
import api from '../services/api'

// Respuesta que devuelve el backend en POST /auth/login.
function respuestaLogin(usuario) {
  return Promise.resolve({
    data: {
      token: 'token-de-prueba',
      refreshToken: 'refresh-de-prueba',
      tipoToken: 'Bearer',
      usuario,
    },
  })
}

// Error HTTP como lo entrega axios.
function errorHttp(status, mensaje) {
  return Promise.reject({ response: { status, data: { mensaje } } })
}

function dibujarLogin(
  onIniciarSesion = jasmine.createSpy('onIniciarSesion')
) {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route
          path="/login"
          element={
            <Login onIniciarSesion={onIniciarSesion} />
          }
        />

        <Route
          path="/"
          element={<p>Página de inicio</p>}
        />

        <Route
          path="/admin/ordenes"
          element={<p>Panel de administración</p>}
        />
      </Routes>
    </MemoryRouter>
  )

  return onIniciarSesion
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  })
}

function enviarFormulario() {
  fireEvent.click(
    screen.getByRole('button', {
      name: /^iniciar sesión$/i,
    })
  )
}

describe('Login', () => {
  let almacenamiento

  beforeEach(() => {
    almacenamiento = {}

    // localStorage simulado: no se tocan datos reales del navegador.
    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave)
        ? almacenamiento[clave]
        : null
    )
    spyOn(Storage.prototype, 'setItem').and.callFake((clave, valor) => {
      almacenamiento[clave] = String(valor)
    })

    // Por defecto el backend no responde; cada prueba define su respuesta.
    spyOn(api, 'post').and.callFake(() => Promise.reject({}))
  })

  afterEach(cleanup)

  it('no muestra mensajes de error al abrir la página', () => {
    dibujarLogin()

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('actualiza el estado del campo correo al escribir', () => {
    dibujarLogin()

    escribir(/^correo electrónico/i, 'ana@duoc.cl')

    expect(
      screen.getByLabelText(/^correo electrónico/i).value
    ).toBe('ana@duoc.cl')
  })

  it('no llama al backend si el formulario es inválido', () => {
    dibujarLogin()

    escribir(/^correo electrónico/i, 'correo-malo')
    escribir(/^contraseña/i, '12')

    enviarFormulario()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('muestra el error del backend si la contraseña es incorrecta', async () => {
    api.post.and.returnValue(
      errorHttp(401, 'Correo o contraseña incorrectos.')
    )
    const onIniciarSesion = dibujarLogin()

    escribir(/^correo electrónico/i, 'cliente@gmail.com')
    escribir(/^contraseña/i, 'otra123')

    enviarFormulario()

    const alerta = await screen.findByRole('alert')

    expect(alerta.textContent).toContain('Correo o contraseña incorrectos')
    expect(onIniciarSesion).not.toHaveBeenCalled()
    expect(screen.queryByText('Página de inicio')).toBeNull()
  })

  it('avisa si no se puede conectar con el servidor', async () => {
    dibujarLogin()

    escribir(/^correo electrónico/i, 'cliente@gmail.com')
    escribir(/^contraseña/i, 'cliente1')

    enviarFormulario()

    const alerta = await screen.findByRole('alert')

    expect(alerta.textContent).toContain('No se pudo conectar con el servidor')
  })

  it('envía al Cliente a la tienda y guarda el token', async () => {
    api.post.and.returnValue(
      respuestaLogin({
        nombre: 'Camila',
        correo: 'cliente@gmail.com',
        rol: 'cliente',
        tipo: 'Cliente',
      })
    )
    const onIniciarSesion = dibujarLogin()

    escribir(/^correo electrónico/i, 'cliente@gmail.com')
    escribir(/^contraseña/i, 'cliente1')

    enviarFormulario()

    expect(await screen.findByText('Página de inicio')).toBeTruthy()

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      correo: 'cliente@gmail.com',
      password: 'cliente1',
    })

    expect(onIniciarSesion).toHaveBeenCalledTimes(1)
    expect(onIniciarSesion).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nombre: 'Camila',
        correo: 'cliente@gmail.com',
      })
    )

    // La sesión queda guardada para sobrevivir a una recarga.
    expect(almacenamiento.token).toBe('token-de-prueba')
    expect(almacenamiento.refreshToken).toBe('refresh-de-prueba')
  })

  it('envía al Administrador al panel al iniciar sesión', async () => {
    api.post.and.returnValue(
      respuestaLogin({
        nombre: 'Ana',
        correo: 'admin@duoc.cl',
        rol: 'admin',
        tipo: 'Administrador',
      })
    )
    const onIniciarSesion = dibujarLogin()

    escribir(/^correo electrónico/i, 'admin@duoc.cl')
    escribir(/^contraseña/i, 'admin123')

    enviarFormulario()

    expect(await screen.findByText('Panel de administración')).toBeTruthy()

    expect(onIniciarSesion).toHaveBeenCalledTimes(1)
    expect(onIniciarSesion).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nombre: 'Ana',
        tipo: 'Administrador',
      })
    )
  })
})