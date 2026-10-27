// PESTAÑA 3 · Precios y descuentos. Regla clave: los descuentos NO se suman, se aplica el mayor.
// Cálculo de precios, descuentos y totales del carrito.
// Beneficio del usuario: se elige el mayor, no se suman.
export function obtenerDescuentoUsuario(usuario) {
  // Sin sesión no hay descuento.
  if (!usuario) return 0

  // Math.max elige el mayor (edad 50 % o código FELICES50 10 %); Math.min evita pasar de 100 %.
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

  // Ej: 50000 con 15 % → 50000 × 0,85 = 42500.
  return Math.round(precioBase * (1 - porcentaje / 100))
}

// Compara la oferta del producto con el beneficio del usuario.
export function calcularPrecioProducto(producto, descuentoUsuario = 0) {
  const precioBase = Number(producto.precio) || 0

  // Se queda con el mayor: oferta del producto o beneficio del usuario.
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
    // Devuelve los tres datos que usa ProductCard: precio original, % y precio final.
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
    // filter deja solo los productos con oferta mayor a 0 %.
    producto => Number(producto.descuento) > 0
  )
}