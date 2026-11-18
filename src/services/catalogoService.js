import api from "./api";
import { listarCategorias } from "./categoriaService";

export function adaptarProducto(producto) {
  const id = Number(producto.id);
  const precio = Number(producto.precio);
  const stock = Number(producto.stock);
  const descuento = Number(producto.descuento ?? 0);
  if (!Number.isSafeInteger(id) || id < 1 || !producto.codigo || !producto.nombre ||
      !Number.isFinite(precio) || precio <= 0 || !Number.isSafeInteger(stock) || stock < 0 ||
      !Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
    throw new Error("El catálogo contiene un producto con formato inválido.");
  }
  return {
    ...producto, id, precio, stock, descuento,
    categoria: typeof producto.categoria === "object" ? producto.categoria?.nombre || "" : producto.categoria || "",
    categoriaId: producto.categoria?.id ?? producto.categoriaId ?? null,
    imagen: producto.imagenUrl || producto.imagen || "/images/logo.png",
  };
}

export async function obtenerCatalogo() {
  const [{ data }, categorias] = await Promise.all([api.get("/productos"), listarCategorias()]);
  if (!Array.isArray(data) || !Array.isArray(categorias) ||
      categorias.some(c => !c || !c.nombre || !Number.isSafeInteger(Number(c.id)) || Number(c.id) < 1)) {
    throw new Error("El catálogo recibido tiene un formato inválido.");
  }
  // Defensa adicional: ningún registro marcado inactivo se ofrece en la tienda.
  const productos = data.filter(p => p && p.activo !== false && p.activo !== 0 && p.activo !== "false")
    .map(adaptarProducto);
  if (new Set(productos.map(p => p.id)).size !== productos.length) {
    throw new Error("El catálogo contiene identificadores repetidos.");
  }
  return { productos, categorias };
}
