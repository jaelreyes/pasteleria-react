import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import api from '../services/api'
import { obtenerCatalogo } from '../services/catalogoService'
import { EVENTO_CATALOGO, notificarCambioCatalogo } from '../services/eventosCatalogo'
import { crearProductoAdmin, actualizarProductoAdmin, eliminarProductoAdmin } from '../services/productoAdminService'
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '../services/categoriaService'
import { sincronizarCarrito } from '../utils/carrito'
import { comprar } from '../services/boletaService'

const producto = { id: 17, codigo: 'QA', nombre: 'Torta HTTP', descripcion: 'Chocolate QA',
  precio: '1500', descuento: '10', stock: 5, stockCritico: 1, activo: true,
  imagenUrl: '/images/productos/TC001.jpg', categoria: { id: 1, nombre: 'Tortas Cuadradas' } }
const categoria = { id: 1, nombre: 'Tortas Cuadradas' }
const anterior = { ...producto, id: 900, precio: 1000, descuento: 0,
  categoria: 'Tortas Cuadradas', imagen: producto.imagenUrl, cantidad: 2 }
const cliente = { rol: 'CLIENTE', nombre: 'QA', correo: 'qa@example.test', telefono: '912345678',
  direccion: 'Direccion QA', region: 'Tarapacá', comuna: 'Iquique' }

describe('Catalogo HTTP y proteccion del carrito', () => {
  let almacen, productos, categorias, fallo, leerProductos
  beforeEach(() => {
    almacen = {}
    productos = [producto]
    categorias = [categoria]
    fallo = false
    leerProductos = null
    spyOn(Storage.prototype, 'getItem').and.callFake(clave => almacen[clave] ?? null)
    spyOn(Storage.prototype, 'setItem').and.callFake((clave, valor) => { almacen[clave] = String(valor) })
    spyOn(Storage.prototype, 'removeItem').and.callFake(clave => { delete almacen[clave] })
    spyOn(XMLHttpRequest.prototype, 'open').and.callFake(() => { throw new Error('Red real bloqueada') })
    spyOn(window, 'fetch').and.callFake(() => Promise.reject(new Error('Red real bloqueada')))
    spyOn(api, 'get').and.callFake(ruta => {
      if (ruta === '/auth/me') return Promise.resolve({ data: cliente })
      if (fallo) return Promise.reject(new Error('Sin conexion'))
      if (ruta === '/productos' && leerProductos) return leerProductos()
      if (ruta === '/productos') return Promise.resolve({ data: productos })
      if (ruta === '/categorias') return Promise.resolve({ data: categorias })
      throw new Error(`GET no previsto: ${ruta}`)
    })
    for (const metodo of ['post', 'put', 'patch', 'delete']) {
      spyOn(api, metodo).and.returnValue(Promise.resolve({ data: producto }))
    }
  })
  afterEach(cleanup)

  function dibujar(ruta = '/productos') {
    return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)
  }
  function guardarCarrito(items = [anterior], clave = 'carrito_invitado') {
    almacen[clave] = JSON.stringify(items)
    return almacen[clave]
  }
  function iniciarCliente() {
    almacen.usuarioActivo = JSON.stringify(cliente)
    almacen.token = 'access-simulado'
    almacen.refreshToken = `qa.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.qa`
  }
  async function esperarAusencia(texto) {
    await waitFor(() => {
      if (screen.queryByText(texto)) throw new Error(`Todavia visible: ${texto}`)
    })
  }

  it('usa el cliente Axios existente y adapta los tipos, la imagen y la categoria', async () => {
    const catalogo = await obtenerCatalogo()
    expect(api.get).toHaveBeenCalledWith('/productos')
    expect(api.get).toHaveBeenCalledWith('/categorias')
    expect(catalogo.productos[0]).toEqual(jasmine.objectContaining({
      id: 17, precio: 1500, descuento: 10, stock: 5, categoriaId: 1,
      categoria: 'Tortas Cuadradas', imagen: producto.imagenUrl,
    }))
  })

  it('muestra carga y conserva el almacenamiento mientras la lectura esta pendiente', async () => {
    const guardado = guardarCarrito()
    let resolver
    leerProductos = () => new Promise(resolve => { resolver = resolve })
    dibujar()
    expect(screen.getByText('Cargando catálogo...')).toBeTruthy()
    expect(screen.queryByText('Torta HTTP')).toBeNull()
    expect(almacen.carrito_invitado).toBe(guardado)
    await act(async () => resolver({ data: [producto] }))
    await screen.findByText('Torta HTTP')
    expect(almacen.carrito_invitado).toBe(guardado)
  })

  it('no usa el catalogo local ante un error y permite reintentar sin perder articulos', async () => {
    const guardado = guardarCarrito()
    almacen.productos = JSON.stringify([{ ...producto, nombre: 'Catalogo local antiguo' }])
    fallo = true
    dibujar()
    await screen.findByText(/No se pudo actualizar el catálogo/)
    expect(screen.queryByText('Catalogo local antiguo')).toBeNull()
    expect(almacen.carrito_invitado).toBe(guardado)
    fallo = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await screen.findByText('Torta HTTP')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
    expect(almacen.carrito_invitado).toBe(guardado)
  })

  it('una lectura vacia exitosa tampoco vacia el carrito guardado', async () => {
    const guardado = guardarCarrito()
    productos = []
    dibujar('/carrito')
    await screen.findByText(/Conservamos tu carrito/)
    expect(almacen.carrito_invitado).toBe(guardado)
    expect(screen.getByText('Torta HTTP')).toBeTruthy()
  })

  for (const ruta of ['/productos', '/productos/18', '/ofertas', '/categorias/tortas-cuadradas']) {
    it(`excluye productos inactivos en ${ruta}`, async () => {
      productos = [producto, { ...producto, id: 18, codigo: 'INACTIVO', nombre: 'Oculto QA', activo: false }]
      dibujar(ruta)
      await esperarAusencia('Cargando catálogo...')
      expect(screen.queryByText('Oculto QA')).toBeNull()
      if (ruta === '/productos/18') expect(screen.getByText('Producto no encontrado.')).toBeTruthy()
    })
  }

  it('conserva la busqueda y el filtro por categoria', async () => {
    productos = [producto, { ...producto, id: 18, codigo: 'OTRO', nombre: 'Otro sabor' }]
    dibujar('/productos?q=QA&categoria=Tortas%20Cuadradas')
    await screen.findByText('Torta HTTP')
    expect(screen.queryByText('Otro sabor')).toBeNull()
  })

  it('muestra categorias de la API aunque no tengan productos', async () => {
    categorias = [...categorias, { id: 9, nombre: 'Categoria vacia QA' }]
    dibujar('/categorias')
    await screen.findByText('Categoria vacia QA')
  })

  it('refresca altas, ediciones y desactivaciones administrativas sin cambiar el carrito', async () => {
    const guardado = guardarCarrito()
    dibujar()
    await screen.findByText('Torta HTTP')
    productos = [producto, { ...producto, id: 18, codigo: 'NUEVO', nombre: 'Alta QA' }]
    await act(async () => { await crearProductoAdmin({ ...anterior, codigo: 'NUEVO', categoriaId: 1 }) })
    await screen.findByText('Alta QA')
    productos = [{ ...producto, nombre: 'Edicion QA' }]
    await act(async () => { await actualizarProductoAdmin(17, { ...anterior, categoriaId: 1 }) })
    await screen.findByText('Edicion QA')
    productos = []
    await act(async () => { await eliminarProductoAdmin(17) })
    await esperarAusencia('Edicion QA')
    expect(almacen.carrito_invitado).toBe(guardado)
  })

  it('no refresca como exitosa una modificacion administrativa rechazada', async () => {
    dibujar()
    await screen.findByText('Torta HTTP')
    const aviso = jasmine.createSpy('aviso')
    window.addEventListener(EVENTO_CATALOGO, aviso)
    try {
      api.delete.and.returnValue(Promise.reject(new Error('403')))
      await expectAsync(eliminarProductoAdmin(17)).toBeRejected()
      expect(aviso).not.toHaveBeenCalled()
    } finally { window.removeEventListener(EVENTO_CATALOGO, aviso) }
  })

  it('notifica las escrituras de categorias solo con HTTP simulado', async () => {
    const aviso = jasmine.createSpy('aviso')
    window.addEventListener(EVENTO_CATALOGO, aviso)
    try {
      await crearCategoria('QA')
      await actualizarCategoria(9, 'QA editada')
      await eliminarCategoria(9)
      expect(aviso).toHaveBeenCalledTimes(3)
    } finally { window.removeEventListener(EVENTO_CATALOGO, aviso) }
  })

  it('ignora una respuesta anterior que llega despues de la ultima actualizacion', async () => {
    let resolver
    leerProductos = () => new Promise(resolve => { resolver = resolve })
    dibujar()
    leerProductos = null
    productos = [{ ...producto, nombre: 'Catalogo reciente QA' }]
    await act(async () => notificarCambioCatalogo())
    await screen.findByText('Catalogo reciente QA')
    await act(async () => resolver({ data: [{ ...producto, nombre: 'Respuesta antigua QA' }] }))
    await esperarAusencia('Cargando catálogo...')
    expect(screen.queryByText('Respuesta antigua QA')).toBeNull()
  })

  it('remapea un ID solo por codigo y mantiene la cantidad sin mutar el original', () => {
    const original = JSON.stringify([anterior])
    const resultado = sincronizarCarrito([anterior], [{ ...producto, precio: 1500, descuento: 10 }])
    expect(resultado.items[0].id).toBe(17)
    expect(resultado.items[0].cantidad).toBe(2)
    expect(resultado.pendiente).toBeFalse()
    expect(JSON.stringify([anterior])).toBe(original)
  })

  for (const item of [
    { ...anterior, id: 17, codigo: 'OTRO' }, { ...anterior, codigo: undefined },
    { ...anterior, cantidad: 6 }, { ...anterior, cantidad: -1 },
    { ...anterior, cantidad: 1.5 }, { ...anterior, cantidad: 100 },
  ]) {
    it(`conserva y bloquea articulo no verificable ${JSON.stringify({ codigo: item.codigo, cantidad: item.cantidad })}`, () => {
      const resultado = sincronizarCarrito([item], [producto])
      expect(resultado.items.length).toBe(1)
      expect(resultado.items[0].cantidad).toBe(item.cantidad)
      expect(resultado.pendiente).toBeTrue()
    })
  }

  it('bloquea identidades duplicadas en lugar de fusionarlas o descartarlas', () => {
    const resultado = sincronizarCarrito([anterior, anterior], [producto])
    expect(resultado.items.length).toBe(2)
    expect(resultado.pendiente).toBeTrue()
  })

  it('agrega productos nuevos al carrito con el ID real', async () => {
    dibujar()
    await screen.findByText('Torta HTTP')
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }))
    await waitFor(() => expect(JSON.parse(almacen.carrito_invitado)[0].id).toBe(17))
  })

  it('checkout envia al servicio de boletas el ID real y la cantidad verificada', async () => {
    iniciarCliente()
    const guardado = guardarCarrito([anterior], 'carrito_qa@example.test')
    dibujar('/checkout')
    const confirmar = await screen.findByRole('button', { name: 'Confirmar compra simulada' })
    // Mantener el envio pendiente evita navegar a otras pantallas durante esta comprobacion.
    api.post.and.returnValue(new Promise(() => {}))
    fireEvent.submit(confirmar.closest('form'))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/boletas', jasmine.objectContaining({
      items: [{ productoId: 17, cantidad: 2 }],
    })))
    expect(almacen['carrito_qa@example.test']).toBe(guardado)
  })

  it('conserva la confirmacion exitosa y refresca el stock al navegar tras la compra', async () => {
    iniciarCliente()
    guardarCarrito([anterior], 'carrito_qa@example.test')
    api.post.and.returnValue(Promise.resolve({ data: {
      id: 21, nombre: 'QA', total: 2700, productos: [], estado: 'pendiente',
    } }))
    dibujar('/checkout')
    const confirmar = await screen.findByRole('button', { name: 'Confirmar compra simulada' })
    const lecturasAntes = api.get.calls.allArgs().filter(([ruta]) => ruta === '/productos').length
    await act(async () => fireEvent.submit(confirmar.closest('form')))
    await waitFor(() => {
      if (screen.queryByRole('button', { name: 'Confirmar compra simulada' })) throw new Error('Checkout pendiente')
    })
    expect(almacen['carrito_qa@example.test']).toBe('[]')
    expect(api.get.calls.allArgs().filter(([ruta]) => ruta === '/productos').length).toBeGreaterThan(lecturasAntes)
    expect(api.post).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Debes verificar los productos/)).toBeNull()
  })

  for (const modo of ['error', 'sin producto', 'sin stock']) {
    it(`impide checkout con ${modo} y conserva el registro guardado`, async () => {
      iniciarCliente()
      const guardado = guardarCarrito([anterior], 'carrito_qa@example.test')
      if (modo === 'error') fallo = true
      if (modo === 'sin producto') productos = []
      if (modo === 'sin stock') productos = [{ ...producto, stock: 0 }]
      dibujar('/checkout')
      await esperarAusencia('Cargando catálogo...')
      expect(screen.queryByRole('button', { name: 'Confirmar compra simulada' })).toBeNull()
      expect(api.post).not.toHaveBeenCalled()
      expect(almacen['carrito_qa@example.test']).toBe(guardado)
    })
  }

  it('el contrato de compra no envia precios ni totales del carrito', async () => {
    await comprar([{ ...producto, cantidad: 2 }], { nombre: 'QA', direccion: 'QA' })
    const payload = api.post.calls.mostRecent().args[1]
    expect(payload.items).toEqual([{ productoId: 17, cantidad: 2 }])
    expect(payload.precio).toBeUndefined()
    expect(payload.total).toBeUndefined()
  })
})
