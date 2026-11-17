// Llamadas al backend para comprar y ver boletas.
import api from "./api";

// Confirma la compra. Solo envía el id y la cantidad de cada producto:
// los precios, descuentos y el total los calcula el servidor.
export async function comprar(carrito, despacho) {
  const { data } = await api.post("/boletas", {
    items: carrito.map((producto) => ({
      productoId: producto.id,
      cantidad: producto.cantidad,
    })),
    ...despacho,
  });
  return data;
}

// Boletas del usuario con sesión, de la más nueva a la más antigua.
export async function misBoletas() {
  const { data } = await api.get("/boletas/mis-boletas");
  return data;
}
