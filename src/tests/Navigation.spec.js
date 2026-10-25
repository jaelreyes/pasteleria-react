import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navigation from '../components/Navigation'
import {
  puedeEntrarAlPanel,
  rutaInicioSegunRol,
} from '../utils/roles'

function dibujarMenu(usuarioActivo) {
  render(
    <MemoryRouter>
      <Navigation
        cantidad={0}
        onVerCarrito={() => {}}
        usuarioActivo={usuarioActivo}
        onCerrarSesion={() => {}}
      />
    </MemoryRouter>
  )
}

function abrirCuenta(nombre) {
  fireEvent.click(
    screen.getByRole('button', {
      name: `Hola, ${nombre}`,
    })
  )
}

describe('Acceso según el rol', () => {
  afterEach(cleanup)

  it('solo Administrador y Vendedor pueden entrar al panel', () => {
    expect(
      puedeEntrarAlPanel({ tipo: 'Administrador' })
    ).toBe(true)

    expect(
      puedeEntrarAlPanel({ tipo: 'Vendedor' })
    ).toBe(true)

    expect(
      puedeEntrarAlPanel({ tipo: 'Cliente' })
    ).toBe(false)

    expect(puedeEntrarAlPanel(null)).toBe(false)

    expect(
      rutaInicioSegunRol({ tipo: 'Vendedor' })
    ).toBe('/admin')

    expect(
      rutaInicioSegunRol({ tipo: 'Cliente' })
    ).toBe('/')
  })

  it('sin sesión muestra los enlaces para iniciar sesión y registrarse', () => {
    dibujarMenu(null)

    expect(
      screen.getByRole('link', {
        name: 'Iniciar sesión',
      }).getAttribute('href')
    ).toBe('/login')

    expect(
      screen.getByRole('link', {
        name: /reg[ií]str/i,
      }).getAttribute('href')
    ).toBe('/registro')

    expect(
      screen.queryByRole('link', { name: /panel/i })
    ).toBeNull()
  })

  it('muestra el acceso al panel al Administrador al abrir su cuenta', () => {
    dibujarMenu({
      nombre: 'Ana',
      tipo: 'Administrador',
      rol: 'admin',
    })

    abrirCuenta('Ana')

    expect(
      screen.getByRole('link', {
        name: /panel/i,
      })
    ).toBeTruthy()
  })

  it('muestra el acceso al panel al Vendedor al abrir su cuenta', () => {
    dibujarMenu({
      nombre: 'Carlos',
      tipo: 'Vendedor',
      rol: 'vendedor',
    })

    abrirCuenta('Carlos')

    expect(
      screen.getByRole('link', {
        name: /panel/i,
      })
    ).toBeTruthy()
  })

  it('no muestra acceso al panel al Cliente aunque abra su cuenta', () => {
    dibujarMenu({
      nombre: 'Camila',
      tipo: 'Cliente',
      rol: 'cliente',
    })

    abrirCuenta('Camila')

    expect(
      screen.queryByRole('link', {
        name: /panel/i,
      })
    ).toBeNull()
  })

  it('muestra el beneficio de torta gratis al abrir la cuenta', () => {
    dibujarMenu({
      nombre: 'Pedro',
      correo: 'pedro@duoc.cl',
      tipo: 'Cliente',
      rol: 'cliente',
      tortaGratisDuoc: true,
    })

    abrirCuenta('Pedro')

    expect(
      screen.getByText(/torta gratis/i)
    ).toBeTruthy()
  })
})