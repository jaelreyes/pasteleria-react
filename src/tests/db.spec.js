// Pruebas de la persistencia en db.js (productos, usuarios y órdenes).
import productosIniciales from '../data/productos'
import {
  obtenerUsuarios,
  obtenerUsuarioActivo,
  puedeEntrarAlPanel,
  obtenerProductos,
  guardarProducto,
  eliminarProducto,
  obtenerOrdenes,
  guardarOrden,
  obtenerOrdenPorId,
  actualizarEstadoOrden,
} from '../data/db'

describe('Persistencia en db.js', () => {
  let almacenamiento

  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    almacenamiento = {}

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

  it('crea las tres cuentas demo cuando no hay usuarios guardados', () => {
    const usuarios = obtenerUsuarios()

    expect(usuarios.length).toBe(3)
    expect(usuarios.map(usuario => usuario.rol)).toEqual([
      'admin',
      'vendedor',
      'cliente',
    ])

    expect(JSON.parse(almacenamiento.usuarios)).toEqual(usuarios)
  })

  it('respeta la contraseña y el rol guardados de una cuenta demo', () => {
    const usuarios = [
      {
        email: 'admin@duoc.cl',
        password: 'nueva123',
        rol: 'cliente',
        tipo: 'Cliente',
      },
    ]

    almacenamiento.usuarios = JSON.stringify(usuarios)

    expect(obtenerUsuarios()).toEqual(usuarios)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('conserva un listado vacío sin recrear cuentas demo', () => {
    almacenamiento.usuarios = '[]'

    expect(obtenerUsuarios()).toEqual([])
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('devuelve null cuando no hay una sesión iniciada', () => {
    expect(obtenerUsuarioActivo()).toBeNull()
    expect(puedeEntrarAlPanel()).toBe(false)
  })

  it('permite entrar al panel a un vendedor', () => {
    almacenamiento.usuarioActivo = JSON.stringify({
      nombre: 'Luis',
      rol: 'vendedor',
    })

    expect(puedeEntrarAlPanel()).toBe(true)
  })

  it('impide entrar al panel a un cliente', () => {
    almacenamiento.usuarioActivo = JSON.stringify({
      nombre: 'Ana',
      tipo: 'Cliente',
    })

    expect(puedeEntrarAlPanel()).toBe(false)
  })

  it('inicializa los productos usando el catálogo original', () => {
    const productos = obtenerProductos()

    expect(productos.length).toBe(productosIniciales.length)

    expect(productos.map(producto => producto.codigo)).toEqual(
      productosIniciales.map(producto => producto.codigo)
    )

    expect(JSON.parse(almacenamiento.productos)).toEqual(productos)
  })

  it('conserva los productos guardados sin reemplazarlos', () => {
    const productos = [
      { id: 100, nombre: 'Producto editado', precio: 9000, stock: 3 },
    ]

    almacenamiento.productos = JSON.stringify(productos)

    expect(obtenerProductos()).toEqual(productos)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('conserva un catálogo vacío sin volver a cargar los originales', () => {
    almacenamiento.productos = '[]'

    expect(obtenerProductos()).toEqual([])
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('informa un error si los productos guardados no son un arreglo', () => {
    almacenamiento.productos = '{"nombre":"dato incorrecto"}'

    expect(() => obtenerProductos()).toThrowError(
      'Los productos guardados no tienen un formato válido.'
    )

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('crea un producto y lo guarda con un id', () => {
    almacenamiento.productos = '[]'

    guardarProducto({
      nombre: 'Galletas de prueba',
      precio: 4500,
      stock: 8,
    })

    const productos = JSON.parse(almacenamiento.productos)

    expect(productos.length).toBe(1)
    expect(productos[0].nombre).toBe('Galletas de prueba')
    expect(productos[0].id).toEqual(jasmine.any(Number))
  })

  it('actualiza un producto sin modificar los demás', () => {
    almacenamiento.productos = JSON.stringify([
      { id: 1, nombre: 'Torta', precio: 45000 },
      { id: 2, nombre: 'Galletas', precio: 4500 },
    ])

    guardarProducto({
      id: 1,
      nombre: 'Torta actualizada',
      precio: 47000,
    })

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      { id: 1, nombre: 'Torta actualizada', precio: 47000 },
      { id: 2, nombre: 'Galletas', precio: 4500 },
    ])
  })

  it('elimina únicamente el producto seleccionado', () => {
    almacenamiento.productos = JSON.stringify([
      { id: 1, nombre: 'Torta' },
      { id: 2, nombre: 'Galletas' },
    ])

    eliminarProducto(1)

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      { id: 2, nombre: 'Galletas' },
    ])
  })

  it('guarda y recupera una orden por su id', () => {
    const orden = {
      id: 'ORD-001',
      nombre: 'Ana',
      total: 22500,
      estado: 'pendiente',
    }

    guardarOrden(orden)

    expect(obtenerOrdenes()).toEqual([orden])
    expect(obtenerOrdenPorId('ORD-001')).toEqual(orden)
    expect(obtenerOrdenPorId('ORD-INEXISTENTE')).toBeUndefined()
  })

  it('actualiza el estado de una orden sin alterar su total', () => {
    almacenamiento.ordenes = JSON.stringify([
      { id: 'ORD-001', total: 22500, estado: 'pendiente' },
      { id: 'ORD-002', total: 9000, estado: 'pendiente' },
    ])

    actualizarEstadoOrden('ORD-001', 'completado')

    expect(obtenerOrdenPorId('ORD-001')).toEqual({
      id: 'ORD-001',
      total: 22500,
      estado: 'completado',
    })

    expect(obtenerOrdenPorId('ORD-002').estado).toBe('pendiente')
  })
})