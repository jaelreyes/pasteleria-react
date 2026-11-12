// Pruebas de la gestión de usuarios del panel conectada al backend.
// La API se simula con spyOn sobre api.get / api.delete.
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UsersAdmin } from '../admin/pages/UsersAdmin'
import api from '../services/api'

const usuariosBackend = [
  { id: 1, nombre: 'Administrador', apellidos: 'Demo', correo: 'admin@duoc.cl', rol: 'admin', tipo: 'Administrador', beneficios: [] },
  { id: 2, nombre: 'Vendedor', apellidos: 'Demo', correo: 'vendedor@duoc.cl', rol: 'vendedor', tipo: 'Vendedor', beneficios: [] },
  { id: 5, nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@gmail.com', rol: 'cliente', tipo: 'Cliente', beneficios: [] },
]

function dibujarUsuarios() {
  render(
    <MemoryRouter>
      <UsersAdmin />
    </MemoryRouter>
  )
}

// Fila de la tabla que contiene el correo indicado.
async function filaDe(correo) {
  const celda = await screen.findByText(correo, { selector: 'td' })
  return celda.closest('tr')
}

describe('UsersAdmin (gestión de usuarios con la API)', () => {
  beforeEach(() => {
    // Sesión del administrador que está usando el panel.
    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      clave === 'usuarioActivo'
        ? JSON.stringify({ correo: 'admin@duoc.cl', rol: 'admin' })
        : null
    )

    spyOn(api, 'get').and.returnValue(
      Promise.resolve({ data: usuariosBackend })
    )
    spyOn(api, 'delete').and.returnValue(Promise.resolve({}))
  })

  afterEach(cleanup)

  it('carga la lista de usuarios desde GET /usuarios', async () => {
    dibujarUsuarios()

    expect(await filaDe('ana@gmail.com')).toBeTruthy()
    expect(api.get).toHaveBeenCalledWith('/usuarios')
    expect(screen.getByText('vendedor@duoc.cl', { selector: 'td' })).toBeTruthy()
  })

  it('muestra el error del backend si no tiene permisos', async () => {
    api.get.and.returnValue(
      Promise.reject({
        response: { status: 403, data: { mensaje: 'No tienes permisos para esta acción.' } },
      })
    )

    dibujarUsuarios()

    expect(
      await screen.findByText('No tienes permisos para esta acción.')
    ).toBeTruthy()
  })

  it('elimina un usuario con DELETE /usuarios/{id} y lo quita de la tabla', async () => {
    dibujarUsuarios()

    const fila = await filaDe('ana@gmail.com')
    fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }))

    expect(
      await screen.findByText('Usuario eliminado correctamente.')
    ).toBeTruthy()

    expect(api.delete).toHaveBeenCalledWith('/usuarios/5')
    expect(screen.queryByText('ana@gmail.com', { selector: 'td' })).toBeNull()
  })

  it('no permite eliminar una cuenta demo', async () => {
    dibujarUsuarios()

    const fila = await filaDe('vendedor@duoc.cl')
    const boton = within(fila).getByRole('button', { name: 'Eliminar' })

    expect(boton.disabled).toBe(true)
    expect(api.delete).not.toHaveBeenCalled()
  })
})