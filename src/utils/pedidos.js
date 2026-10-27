// Pedido actual del cliente: se crea al comprar y se guarda en localStorage.
import { aplicarDescuento, calcularTotales } from './precios'

// Misma clave que usaba js/carrito.js en el proyecto original.
const CLAVE_PEDIDO = 'pedidoActual'

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

// Genera un número como P20261020-4821.
function generarNumeroPedido() {
  const fecha = new Date()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  const aleatorio = Math.floor(1000 + Math.random() * 9000)

  return `P${fecha.getFullYear()}${mes}${dia}-${aleatorio}`
}

// Crea el pedido con los precios ya descontados.
export function crearPedido(carrito, descuento) {
  const hoy = new Date()
  const entrega = new Date(hoy)
  entrega.setDate(hoy.getDate() + 3)

  const { subtotal, ahorro, total } = calcularTotales(carrito, descuento)

  return {
    numero: generarNumeroPedido(),
    fecha: hoy.toLocaleDateString('es-CL'),
    fechaEntrega: `${entrega.getDate()} de ${MESES[entrega.getMonth()]} ${entrega.getFullYear()}`,
    pasoActual: 0,
    descuento,
    productos: carrito.map(producto => ({
      id: producto.id,
      nombre: producto.nombre,
      imagen: producto.imagen,
      cantidad: producto.cantidad,
      precio: producto.precio,
      precioFinal: aplicarDescuento(producto.precio, descuento),
    })),
    subtotal,
    ahorro,
    total,
  }
}

// Guarda el pedido para mostrar su seguimiento en /pedido.
export function guardarPedido(pedido) {
  localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido))
}

// Lee el pedido guardado; si no hay o está dañado devuelve null.
export function cargarPedido() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PEDIDO) || 'null')
  } catch {
    return null
  }
}