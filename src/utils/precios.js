// Funciones para calcular los descuentos del usuario, igual que js/carrito.js
// del proyecto original.

// Devuelve el mayor descuento del usuario (edad o código FELICES50).
export function obtenerDescuentoUsuario(usuario) {
  if (!usuario) return 0

  const descuentoEdad = Number(usuario.descuentoEdad) || 0
  const descuentoCodigo = Number(usuario.descuentoCodigo) || 0

  return Math.max(descuentoEdad, descuentoCodigo)
}

// Aplica un porcentaje de descuento a un precio.
export function aplicarDescuento(precio, descuento) {
  if (descuento <= 0) return precio

  return Math.round(precio * (1 - descuento / 100))
}

// Calcula el subtotal sin descuento, el ahorro y el total a pagar.
export function calcularTotales(carrito, descuento) {
  const subtotal = carrito.reduce(
    (suma, producto) => suma + producto.precio * producto.cantidad,
    0
  )

  const total = carrito.reduce(
    (suma, producto) =>
      suma + aplicarDescuento(producto.precio, descuento) * producto.cantidad,
    0
  )

  return {
    subtotal,
    ahorro: subtotal - total,
    total,
  }
}

// Da formato de pesos chilenos: 45000 -> $45.000
export function formatearPrecio(valor) {
  return `$${valor.toLocaleString('es-CL')}`
}


// Precio de un producto en oferta (si no tiene descuento, es el mismo).
export function precioConOferta(producto) {
  return aplicarDescuento(producto.precio, Number(producto.descuento) || 0)
}

// Productos que tienen un descuento mayor a 0.
export function obtenerOfertas(productos) {
  return productos.filter(producto => Number(producto.descuento) > 0)
}