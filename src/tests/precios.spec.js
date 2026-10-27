// Pruebas del cálculo de precios, descuentos y totales.
import {
  obtenerDescuentoUsuario,
  calcularPrecioProducto,
  calcularTotales,
} from '../utils/precios'

describe('Cálculo de precios y descuentos', () => {
  const producto = {
    id: 1,
    precio: 50000,
    descuento: 15,
  }

  it('no asigna beneficios cuando no hay sesión', () => {
    expect(obtenerDescuentoUsuario(null)).toBe(0)
  })

  it('elige el mayor beneficio del usuario sin sumarlos', () => {
    expect(
      obtenerDescuentoUsuario({
        descuentoEdad: 50,
        descuentoCodigo: 10,
      })
    ).toBe(50)
  })

  it('aplica la oferta del producto cuando no hay beneficio de usuario', () => {
    expect(calcularPrecioProducto(producto)).toEqual({
      precioBase: 50000,
      descuento: 15,
      precioFinal: 42500,
    })
  })

  it('aplica el beneficio del usuario si supera la oferta', () => {
    expect(calcularPrecioProducto(producto, 50)).toEqual({
      precioBase: 50000,
      descuento: 50,
      precioFinal: 25000,
    })
  })

  it('conserva la oferta si supera el beneficio del usuario', () => {
    expect(
      calcularPrecioProducto(producto, 10).precioFinal
    ).toBe(42500)
  })

  it('conserva el precio si no hay descuentos', () => {
    expect(
      calcularPrecioProducto({ precio: 45000 }).precioFinal
    ).toBe(45000)
  })

  it('limita el descuento al 100%', () => {
    expect(
      calcularPrecioProducto({
        precio: 50000,
        descuento: 150,
      }).precioFinal
    ).toBe(0)
  })

  it('ignora porcentajes negativos', () => {
    expect(
      calcularPrecioProducto({
        precio: 50000,
        descuento: -20,
      }, -10).precioFinal
    ).toBe(50000)
  })

  it('calcula cantidades, ahorro y total sin acumular descuentos', () => {
    const carrito = [
      { precio: 50000, descuento: 15, cantidad: 2 },
      { precio: 10000, descuento: 60, cantidad: 1 },
    ]

    expect(calcularTotales(carrito, 50)).toEqual({
      subtotal: 110000,
      ahorro: 56000,
      total: 54000,
    })
  })

  it('devuelve totales en cero para un carrito vacío', () => {
    expect(calcularTotales([], 50)).toEqual({
      subtotal: 0,
      ahorro: 0,
      total: 0,
    })
  })
})