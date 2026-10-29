import {
  obtenerDescuentoUsuario,
  aplicarDescuento,
  calcularPrecioProducto,
  calcularTotales,
  precioConOferta,
} from '../utils/precios'
import { limiteCritico, resumenVentas, resumenStock } from '../utils/reportes'

describe('Precios: valores por omisión y límites', () => {
  it('no inventa beneficios si la cuenta no contiene porcentajes válidos', () => {
    expect(obtenerDescuentoUsuario({})).toBe(0)
    expect(obtenerDescuentoUsuario({ descuentoEdad: 'invalido', descuentoCodigo: '' })).toBe(0)
    expect(obtenerDescuentoUsuario({ descuentoEdad: -50, descuentoCodigo: -10 })).toBe(0)
  })

  it('acepta beneficios numéricos guardados como texto y limita al 100%', () => {
    expect(obtenerDescuentoUsuario({ descuentoEdad: '50', descuentoCodigo: '10' })).toBe(50)
    expect(obtenerDescuentoUsuario({ descuentoEdad: 150 })).toBe(100)
  })

  it('conserva el precio si se omite el porcentaje y recupera un precio inválido como cero', () => {
    expect(aplicarDescuento(1000)).toBe(1000)
    expect(aplicarDescuento('invalido', 10)).toBe(0)
    expect(aplicarDescuento(undefined, 'invalido')).toBe(0)
  })

  it('redondea al peso y acota los porcentajes negativos o superiores al 100%', () => {
    expect(aplicarDescuento(999, 15)).toBe(849)
    expect(aplicarDescuento(1000, -10)).toBe(1000)
    expect(aplicarDescuento(1000, 150)).toBe(0)
  })

  it('devuelve valores coherentes ante un producto sin precio ni oferta', () => {
    expect(calcularPrecioProducto({})).toEqual({ precioBase: 0, descuento: 0, precioFinal: 0 })
    expect(calcularPrecioProducto({ precio: 'invalido', descuento: 'invalido' }, 'invalido'))
      .toEqual({ precioBase: 0, descuento: 0, precioFinal: 0 })
  })

  it('calcula el carrito sin beneficio cuando el argumento se omite', () => {
    expect(calcularTotales([{ precio: 1000, descuento: 10, cantidad: 2 }]))
      .toEqual({ subtotal: 2000, ahorro: 200, total: 1800 })
    expect(precioConOferta({ precio: 1000, descuento: 10 })).toBe(900)
  })
})

describe('Reportes: datos opcionales y fronteras', () => {
  const invalidos = ['', null, undefined, -1, 2.5, 'invalido']
  it('recupera el límite predeterminado ante límites vacíos o inválidos', () => {
    invalidos.forEach(stockCritico => expect(limiteCritico({ stockCritico })).toBe(5))
    expect(limiteCritico({ stockCritico: 0 })).toBe(0)
    expect(limiteCritico({ stockCritico: '6' })).toBe(6)
  })

  it('procesa órdenes antiguas sin total o sin detalle de productos', () => {
    expect(resumenVentas([
      { id: 'A' },
      { id: 'B', total: 'invalido', productos: [{ nombre: 'Brownie' }] },
      { id: 'C', total: '1000', productos: [{ nombre: 'Brownie', cantidad: '2' }] },
    ])).toEqual({
      cantidadOrdenes: 3,
      canceladas: 0,
      totalVendido: 1000,
      ticketPromedio: 333,
      masVendidos: [{ nombre: 'Brownie', cantidad: 2 }],
    })
  })

  it('devuelve ceros cuando todas las órdenes están canceladas', () => {
    expect(resumenVentas([{ estado: 'cancelado', total: 9000 }])).toEqual({
      cantidadOrdenes: 0, canceladas: 1, totalVendido: 0, ticketPromedio: 0, masVendidos: [],
    })
  })

  it('limita el ranking a cinco productos ordenados por unidades', () => {
    const productos = Array.from({ length: 6 }, (_, indice) => ({ nombre: `Producto ${indice}`, cantidad: indice + 1 }))
    expect(resumenVentas([{ total: 1000, productos }]).masVendidos).toEqual([
      { nombre: 'Producto 5', cantidad: 6 },
      { nombre: 'Producto 4', cantidad: 5 },
      { nombre: 'Producto 3', cantidad: 4 },
      { nombre: 'Producto 2', cantidad: 3 },
      { nombre: 'Producto 1', cantidad: 2 },
    ])
  })

  it('agrupa productos sin categoría y distingue límite exacto de agotamiento', () => {
    expect(resumenStock([
      { stock: 5, stockCritico: 5, precio: 1000 },
      { categoria: '', stock: 0 },
      { categoria: '', stock: 'invalido', precio: 'invalido' },
    ])).toEqual([{
      categoria: 'Sin categoría', productos: 3, unidades: 5,
      valorInventario: 5000, criticos: 1, agotados: 2,
    }])
    expect(resumenStock([])).toEqual([])
  })
})
