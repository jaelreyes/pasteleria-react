import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import AdminRoutes from '../admin/AdminRoutes'
import Checkout from '../pages/Checkout'
import api from '../services/api'
import { obtenerRol, puedeEntrarAlPanel, rutaInicioSegunRol } from '../utils/roles'

const producto = { id: 17, codigo: 'QA', nombre: 'Producto QA', precio: 1500,
  imagenUrl: '/images/productos/TC001.jpg', imagen: '/images/productos/TC001.jpg',
  stock: 5, stockCritico: 1, descuento: 0, categoria: { id: 1, nombre: 'Tortas' } }
const orden = { id: 17, nombre: 'Cliente QA', correo: 'qa@example.test',
  estado: 'pendiente', total: 1500, productos: [], direccion: 'Direccion QA' }

function Ubicacion() { return <output data-testid="ruta">{useLocation().pathname}</output> }

function dibujar(ruta, usuario) {
  if (usuario) localStorage.setItem('usuarioActivo', JSON.stringify(usuario))
  render(<MemoryRouter initialEntries={[ruta]}>
    <Ubicacion />
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/checkout" element={<Checkout carrito={[{ ...producto, cantidad: 1 }]} />} />
      <Route path="*" element={<p>Tienda o login</p>} />
    </Routes>
  </MemoryRouter>)
}

describe('Permisos administrativos EV3 con REST simulado', () => {
  beforeEach(() => {
    localStorage.clear()
    // Bloqueo adicional: incluso una llamada HTTP no simulada no puede salir del navegador.
    spyOn(XMLHttpRequest.prototype, 'open').and.callFake(() => { throw new Error('Red prohibida en esta prueba') })
    spyOn(window, 'fetch').and.callFake(() => Promise.reject(new Error('Red prohibida')))
    spyOn(api, 'get').and.callFake((ruta) => {
      const data = ruta === '/productos' ? [producto]
        : ruta === '/categorias' ? [{ id: 1, nombre: 'Tortas' }]
          : ruta === '/boletas/17' ? orden : ruta === '/boletas' ? [orden] : []
      return Promise.resolve({ data })
    })
    for (const metodo of ['post', 'put', 'patch', 'delete']) {
      spyOn(api, metodo).and.returnValue(Promise.resolve({ data: orden }))
    }
    spyOn(window, 'print')
    spyOn(window, 'open').and.returnValue(null)
    spyOn(URL, 'createObjectURL').and.returnValue('blob:qa')
    spyOn(URL, 'revokeObjectURL')
    spyOn(HTMLAnchorElement.prototype, 'click')
  })
  afterEach(() => { cleanup(); localStorage.clear() })

  for (const usuario of [{ rol: 'ADMIN' }, { tipo: 'Administrador' }, { rol: 'VENDEDOR' }, { tipo: 'Vendedor' }]) {
    it(`normaliza el formato ${JSON.stringify(usuario)}`, () => {
      expect(puedeEntrarAlPanel(usuario)).toBeTrue()
      expect(rutaInicioSegunRol(usuario)).toBe(obtenerRol(usuario) === 'admin' ? '/admin' : '/admin/productos')
    })
  }

  for (const ruta of ['/admin', '/admin/categorias', '/admin/reportes', '/admin/usuarios',
    '/admin/usuarios/nuevo', '/admin/usuarios/qa/historial', '/admin/productos/nuevo', '/admin/perfil', '/admin/desconocida']) {
    it(`redirige al VENDEDOR desde ${ruta}`, async () => {
      dibujar(ruta, { rol: 'VENDEDOR' })
      await waitFor(() => expect(screen.getByTestId('ruta').textContent).toBe('/admin/productos'))
      await screen.findByText('Producto QA')
      expect(screen.queryByRole('button', { name: /^Editar$/ })).toBeNull()
      expect(screen.queryByRole('button', { name: /^Eliminar$/ })).toBeNull()
      const menu = document.querySelector('nav[aria-label]')
      const destinos = [...menu.querySelectorAll('a')].map(a => a.getAttribute('href'))
      expect(destinos).toEqual(['/admin/productos', '/admin/ordenes', '/'])
      expect(api.post).not.toHaveBeenCalled()
      expect(api.put).not.toHaveBeenCalled()
      expect(api.delete).not.toHaveBeenCalled()
    })
  }

  for (const usuario of [null, { rol: 'CLIENTE' }, { tipo: 'Cliente' }]) {
    for (const ruta of ['/admin', '/admin/productos', '/admin/ordenes', '/admin/ordenes/17', '/admin/reportes']) {
      it(`rechaza ${JSON.stringify(usuario)} en ${ruta}`, async () => {
        dibujar(ruta, usuario)
        await waitFor(() => expect(screen.getByTestId('ruta').textContent).toBe(usuario ? '/' : '/login'))
        expect(api.get).not.toHaveBeenCalled()
      })
    }
  }

  for (const rol of ['ADMIN', 'VENDEDOR']) {
    it(`${rol} consulta ordenes con controles correspondientes`, async () => {
      dibujar('/admin/ordenes', { rol })
      await screen.findAllByText('Cliente QA')
      expect(api.get).toHaveBeenCalledWith('/boletas')
      expect(Boolean(screen.queryByRole('button', { name: 'Exportar CSV' }))).toBe(rol === 'ADMIN')
      expect(Boolean(screen.queryByRole('button', { name: 'Exportar PDF' }))).toBe(rol === 'ADMIN')
      const cambios = screen.queryAllByLabelText('Cambiar estado de la orden 17')
      expect(cambios.length > 0).toBe(rol === 'ADMIN')
      if (rol === 'ADMIN') {
        fireEvent.change(cambios[0], { target: { value: 'procesando' } })
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/boletas/17/estado', { estado: 'procesando' }))
        fireEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }))
        expect(window.open).toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }))
        expect(URL.createObjectURL).toHaveBeenCalled()
        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
      } else expect(api.patch).not.toHaveBeenCalled()
    })

    it(`${rol} consulta detalle con impresion autorizada solo para ADMIN`, async () => {
      dibujar('/admin/ordenes/17', { rol })
      await screen.findByText('Boleta de la orden')
      expect(api.get).toHaveBeenCalledWith('/boletas/17')
      const imprimir = screen.queryByRole('button', { name: 'Imprimir' })
      expect(Boolean(imprimir)).toBe(rol === 'ADMIN')
      if (imprimir) { fireEvent.click(imprimir); expect(window.print).toHaveBeenCalledTimes(1) }
      else expect(window.print).not.toHaveBeenCalled()
    })
  }

  it('ADMIN conserva edicion, eliminacion y menus completos de productos', async () => {
    dibujar('/admin/productos', { rol: 'ADMIN' })
    await screen.findByText('Producto QA')
    expect(screen.getByRole('button', { name: /^Editar$/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Eliminar$/ })).toBeTruthy()
    for (const ruta of ['/admin', '/admin/reportes', '/admin/categorias', '/admin/usuarios', '/admin/perfil']) {
      expect(document.querySelector(`nav a[href="${ruta}"]`)).not.toBeNull()
    }
  })

  it('VENDEDOR no accede al checkout ni envia compras', async () => {
    dibujar('/checkout', { rol: 'VENDEDOR' })
    await waitFor(() => expect(screen.getByTestId('ruta').textContent).toBe('/admin/productos'))
    expect(api.post).not.toHaveBeenCalled()
  })

  it('VENDEDOR puede abrir el detalle del producto sin editarlo', async () => {
    dibujar('/admin/productos', { tipo: 'Vendedor' })
    await screen.findByText('Producto QA')
    fireEvent.click(screen.getAllByRole('button', { name: /Ver detalle/ })[0])
    expect(await screen.findByRole('dialog')).toBeTruthy()
    expect(api.put).not.toHaveBeenCalled()
    expect(api.delete).not.toHaveBeenCalled()
  })

  for (const rol of ['ADMIN', 'CLIENTE']) {
    it(`${rol} conserva acceso al checkout sin ejecutar una compra real`, () => {
      dibujar('/checkout', { rol, nombre: 'QA', email: 'qa@example.test' })
      expect(screen.getByRole('button', { name: 'Confirmar compra simulada' })).toBeTruthy()
      expect(screen.getByTestId('ruta').textContent).toBe('/checkout')
      expect(api.post).not.toHaveBeenCalled()
    })
  }
})
