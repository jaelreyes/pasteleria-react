import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { puedeEntrarAlPanel, rutaInicioSegunRol } from '../utils/roles'

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

describe('Acceso según el rol', () => {
  afterEach(cleanup)

  it('solo Administrador y Vendedor pueden entrar al panel', () => {
    expect(puedeEntrarAlPanel({ tipo: 'Administrador' })).toBe(true)
    expect(puedeEntrarAlPanel({ tipo: 'Vendedor' })).toBe(true)
    expect(puedeEntrarAlPanel({ tipo: 'Cliente' })).toBe(false)
    expect(puedeEntrarAlPanel(null)).toBe(false)
    expect(rutaInicioSegunRol({ tipo: 'Vendedor' })).toBe('/admin')
    expect(rutaInicioSegunRol({ tipo: 'Cliente' })).toBe('/')
  })

  it('sin sesión muestra Iniciar sesión y Registrarse', () => {
    dibujarMenu(null)
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Panel' })).toBeNull()
  })

  it('muestra el enlace al Panel solo al Administrador', () => {
    dibujarMenu({ nombre: 'Ana', tipo: 'Administrador' })
    expect(screen.getByText('Hola, Ana')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Panel' })).toBeTruthy()
  })

  it('al Cliente no le muestra el Panel', () => {
    dibujarMenu({ nombre: 'Camila', tipo: 'Cliente' })
    expect(screen.queryByRole('link', { name: 'Panel' })).toBeNull()
  })

  it('muestra la torta gratis a los correos Duoc', () => {
    dibujarMenu({ nombre: 'Pedro', tipo: 'Cliente', tortaGratisDuoc: true })
    expect(screen.getByText(/Torta gratis/)).toBeTruthy()
  })
})