// Pruebas del registro: validaciones del formulario y envío al backend.
// La API se simula con spyOn sobre api.post (no se llama al servidor real).
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Registro from '../pages/Registro'
import api from '../services/api'

// Respuesta del backend en POST /auth/registro (201 con el usuario creado).
function respuestaRegistro(usuario) {
  return Promise.resolve({
    data: { nombre: 'Ana', rol: 'cliente', beneficios: [], ...usuario },
  })
}

// Error HTTP como lo entrega axios.
function errorHttp(status, mensaje) {
  return Promise.reject({ response: { status, data: { mensaje } } })
}

// Datos que el formulario envió al backend en la última llamada.
function datosEnviados() {
  return api.post.calls.mostRecent().args[1]
}

function dibujarRegistro() {
  render(
    <MemoryRouter>
      <Registro />
    </MemoryRouter>
  )
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  })
}

function completarFormulario() {
  escribir(/^RUN/, '19.011.022-2')
  escribir(/^Nombre/, 'Ana')
  escribir(/^Apellidos/, 'Soto')
  escribir(/^Correo electrónico/, 'ana@gmail.com')
  escribir(/^Región/, 'Valparaíso')
  escribir(/^Comuna/, 'Viña del Mar')
  escribir(/^Dirección/, 'Calle Las Flores 123')
  escribir(/^Contraseña/, 'clave123')
  escribir(/^Confirmar contraseña/, 'clave123')
}

function crearCuenta() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Crear cuenta' })
  )
}

describe('Registro', () => {
  let almacenamiento

  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    almacenamiento = {}

    // Dobles de prueba: no se leen ni escriben cuentas reales.
    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave)
        ? almacenamiento[clave]
        : null
    )

    spyOn(Storage.prototype, 'setItem').and.callFake(
      (clave, valor) => {
        almacenamiento[clave] = String(valor)
      }
    )

    // Por defecto el backend crea la cuenta; algunas pruebas cambian la respuesta.
    spyOn(api, 'post').and.returnValue(respuestaRegistro())
  })

  afterEach(cleanup)

  it('habilita las comunas después de elegir una región', () => {
    dibujarRegistro()

    const comuna = screen.getByLabelText(/^Comuna/)
    expect(comuna.disabled).toBe(true)

    escribir(/^Región/, 'Valparaíso')

    expect(comuna.disabled).toBe(false)
    expect(
      screen.getByRole('option', { name: 'Viña del Mar' })
    ).toBeTruthy()

    expect(
      screen.queryByRole('option', { name: 'Providencia' })
    ).toBeNull()
  })

  it('borra la comuna anterior cuando cambia la región', () => {
    dibujarRegistro()

    escribir(/^Región/, 'Valparaíso')
    escribir(/^Comuna/, 'Viña del Mar')
    escribir(/^Región/, 'Metropolitana de Santiago')

    expect(screen.getByLabelText(/^Comuna/).value).toBe('')

    expect(
      screen.getByRole('option', { name: 'Providencia' })
    ).toBeTruthy()

    expect(
      screen.queryByRole('option', { name: 'Viña del Mar' })
    ).toBeNull()
  })

  it('muestra errores y no guarda una cuenta con el formulario vacío', () => {
    dibujarRegistro()
    crearCuenta()

    expect(
      screen.getByText('Revisa los campos marcados en rojo.')
    ).toBeTruthy()

    expect(
      screen.getByText(
        'Ingresa un RUN válido con su dígito verificador.'
      )
    ).toBeTruthy()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('rechaza contraseñas que no coinciden', () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Confirmar contraseña/, 'otra123')

    crearCuenta()

    expect(
      screen.getByText('Las contraseñas deben coincidir.')
    ).toBeTruthy()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('envía una cuenta válida al backend sin la confirmación', async () => {
    dibujarRegistro()
    completarFormulario()

    crearCuenta()

    expect(
      await screen.findByText('¡Cuenta creada correctamente!')
    ).toBeTruthy()

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post.calls.mostRecent().args[0]).toBe('/auth/registro')

    expect(datosEnviados()).toEqual(
      jasmine.objectContaining({
        run: '190110222',
        nombre: 'Ana',
        correo: 'ana@gmail.com',
        password: 'clave123',
        region: 'Valparaíso',
        comuna: 'Viña del Mar',
      })
    )

    expect(datosEnviados().confirmPassword).toBeUndefined()
  })

  it('muestra el error del backend si el correo ya existe', async () => {
    api.post.and.returnValue(
      errorHttp(409, 'Ya existe una cuenta con ese correo.')
    )

    dibujarRegistro()
    completarFormulario()
    crearCuenta()

    expect(
      await screen.findByText('Ya existe una cuenta con ese correo.')
    ).toBeTruthy()

    expect(
      screen.queryByText('¡Cuenta creada correctamente!')
    ).toBeNull()
  })

  it('muestra el error del backend si el RUN ya existe', async () => {
    api.post.and.returnValue(
      errorHttp(409, 'Ya existe una cuenta con ese RUN.')
    )

    dibujarRegistro()
    completarFormulario()
    crearCuenta()

    expect(
      await screen.findByText('Ya existe una cuenta con ese RUN.')
    ).toBeTruthy()
  })

  it('envía la fecha de nacimiento y muestra los beneficios que calcula el backend', async () => {
    api.post.and.returnValue(
      respuestaRegistro({
        beneficios: ['50% de descuento de por vida por edad.'],
      })
    )

    dibujarRegistro()
    completarFormulario()
    escribir(/^Fecha de nacimiento/, '1970-01-01')

    crearCuenta()

    expect(
      await screen.findByText('¡Cuenta creada correctamente!')
    ).toBeTruthy()

    expect(datosEnviados().fechaNacimiento).toBe('1970-01-01')
    expect(
      screen.getByText('50% de descuento de por vida por edad.')
    ).toBeTruthy()
  })

  it('envía el código FELICES50 en mayúsculas', async () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Código promocional/, 'felices50')

    crearCuenta()

    await screen.findByText('¡Cuenta creada correctamente!')

    expect(datosEnviados().codigoPromocional).toBe('FELICES50')
  })

  it('muestra la vista previa del beneficio de cumpleaños para un correo Duoc', () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Correo electrónico/, 'ana@duoc.cl')

    expect(
      screen.getByText(
        'Torta gratis en tu cumpleaños por ser de la comunidad Duoc.'
      )
    ).toBeTruthy()
  })

  it('avisa si no se puede conectar con el servidor', async () => {
    api.post.and.returnValue(Promise.reject({}))

    dibujarRegistro()
    completarFormulario()
    crearCuenta()

    expect(
      await screen.findByText('No se pudo conectar con el servidor.')
    ).toBeTruthy()

    expect(
      screen.queryByText('¡Cuenta creada correctamente!')
    ).toBeNull()
  })
})