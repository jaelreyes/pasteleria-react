import api from "./api";

// Conserva el contrato utilizado por las vistas de React.
export function adaptarProducto(producto) {
  const precio = Number(producto.precio);
  const descuento = Number(producto.descuento ?? 0);
  const stock = Number(producto.stock);
  if (producto.id == null || !producto.nombre || !Number.isFinite(precio) ||
      !Number.isFinite(descuento) || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Producto recibido con formato inválido.");
  }
  return {
    ...producto,
    categoria: producto.categoria?.nombre || "",
    categoriaId: producto.categoria?.id ?? null,
    imagen: producto.imagenUrl || "/images/logo.png",
    precio, descuento, stock,
  };
}

export async function obtenerProductosAPI() {
  const { data } = await api.get("/productos");
  if (!Array.isArray(data)) throw new Error("Catálogo recibido con formato inválido.");
  return data.map(adaptarProducto);
}
