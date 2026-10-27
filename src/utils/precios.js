// Cálculo de precios, descuentos y totales del carrito.
// Beneficio del usuario: se elige el mayor, no se suman.
export function obtenerDescuentoUsuario(usuario) {
  if (!usuario) return 0

  return Math.min(
    100,
    Math.max(
      0,
      Number(usuario.descuentoEdad) || 0,
      Number(usuario.descuentoCodigo) || 0
    )
  )
}

// Aplica un porcentaje (0 a 100) y redondea al peso.
export function aplicarDescuento(precio, descuento = 0) {
  const precioBase = Number(precio) || 0
  const porcentaje = Math.min(
    100,
    Math.max(0, Number(descuento) || 0)
  )

  return Math.round(precioBase * (1 - porcentaje / 100))
}

// Compara la oferta del producto con el beneficio del usuario.
export function calcularPrecioProducto(producto, descuentoUsuario = 0) {
  const precioBase = Number(producto.precio) || 0

  const descuento = Math.min(
    100,
    Math.max(
      0,
      Number(producto.descuento) || 0,
      Number(descuentoUsuario) || 0
    )
  )

  return {
    precioBase,
    descuento,
    precioFinal: aplicarDescuento(precioBase, descuento),
  }
}

// Suma subtotal, ahorro y total de todo el carrito con reduce.
export function calcularTotales(carrito, descuentoUsuario = 0) {
  return carrito.reduce(
    (totales, producto) => {
      const { precioBase, precioFinal } = calcularPrecioProducto(
        producto,
        descuentoUsuario
      )

      return {
        subtotal:
          totales.subtotal + precioBase * producto.cantidad,
        ahorro:
          totales.ahorro +
          (precioBase - precioFinal) * producto.cantidad,
        total:
          totales.total + precioFinal * producto.cantidad,
      }
    },
    { subtotal: 0, ahorro: 0, total: 0 }
  )
}

// Muestra el valor en pesos chilenos, ej: $45.000.
export function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-CL')}`
}

// Precio final solo con la oferta del producto.
export function precioConOferta(producto) {
  return calcularPrecioProducto(producto).precioFinal
}

// Productos con descuento (vista Ofertas).
export function obtenerOfertas(productos) {
  return productos.filter(
    producto => Number(producto.descuento) > 0
  )
}