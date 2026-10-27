// Pruebas del registro: validaciones, beneficios y cuentas demo.
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Registro from '../pages/Registro'

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

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('rechaza contraseñas que no coinciden', () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Confirmar contraseña/, 'otra123')

    crearCuenta()

    expect(
      screen.getByText('Las contraseñas deben coincidir.')
    ).toBeTruthy()

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('guarda una cuenta válida sin guardar la confirmación', () => {
    dibujarRegistro()
    completarFormulario()

    crearCuenta()

    const usuarios = JSON.parse(almacenamiento.usuarios)

    // 3 cuentas demo + la cuenta nueva, que queda al final.
    expect(usuarios.length).toBe(4)
    expect(usuarios.at(-1)).toEqual(
      jasmine.objectContaining({
        run: '190110222',
        nombre: 'Ana',
        correo: 'ana@gmail.com',
        tipo: 'Cliente',
        region: 'Valparaíso',
        comuna: 'Viña del Mar',
      })
    )

    expect(usuarios.at(-1).confirmPassword).toBeUndefined()

    expect(
      screen.getByText('¡Cuenta creada correctamente!')
    ).toBeTruthy()
  })

  it('rechaza un correo ya registrado sin modificar las cuentas', () => {
    almacenamiento.usuarios = JSON.stringify([
      {
        run: '123456785',
        correo: 'ANA@gmail.com',
        nombre: 'Otra persona',
      },
    ])

    const guardadoAnterior = almacenamiento.usuarios

    dibujarRegistro()
    completarFormulario()
    crearCuenta()

    expect(
      screen.getByText('Ya existe una cuenta con este correo.')
    ).toBeTruthy()

    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(almacenamiento.usuarios).toBe(guardadoAnterior)
  })

  it('rechaza un RUN ya registrado aunque tenga otro formato', () => {
    almacenamiento.usuarios = JSON.stringify([
      {
        run: '19.011.022-2',
        correo: 'otra@gmail.com',
        nombre: 'Otra persona',
      },
    ])

    dibujarRegistro()
    completarFormulario()
    crearCuenta()

    expect(
      screen.getByText('Ya existe una cuenta con este RUN.')
    ).toBeTruthy()

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('guarda el beneficio del 50% para una persona mayor de 50 años', () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Fecha de nacimiento/, '1970-01-01')

    crearCuenta()

    const usuario = JSON.parse(almacenamiento.usuarios).at(-1)

    expect(usuario.descuentoEdad).toBe(50)
    expect(usuario.beneficios).toContain(
      '50% de descuento de por vida por edad.'
    )
  })

  it('guarda el beneficio del código FELICES50', () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Código promocional/, 'felices50')

    crearCuenta()

    const usuario = JSON.parse(almacenamiento.usuarios).at(-1)

    expect(usuario.codigoPromocional).toBe('FELICES50')
    expect(usuario.descuentoCodigo).toBe(10)
  })

  it('guarda el beneficio de cumpleaños para un correo Duoc', () => {
    dibujarRegistro()
    completarFormulario()
    escribir(/^Correo electrónico/, 'ana@duoc.cl')

    crearCuenta()

    const usuario = JSON.parse(almacenamiento.usuarios).at(-1)

    expect(usuario.tortaGratisDuoc).toBe(true)
  })

  it('muestra un error si el navegador no permite guardar', () => {
    localStorage.setItem.and.throwError('Almacenamiento bloqueado')

    dibujarRegistro()
    completarFormulario()
    crearCuenta()

    expect(
      screen.getByText(
        'No se pudo guardar la cuenta en este navegador.'
      )
    ).toBeTruthy()

    expect(
      screen.queryByText('¡Cuenta creada correctamente!')
    ).toBeNull()
  })
})