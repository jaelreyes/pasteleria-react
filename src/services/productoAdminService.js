import api from "./api";

function normalizarProducto(p) {
  const esObjetoCat = p.categoria && typeof p.categoria === "object";
  return {
    ...p,
    imagen: p.imagenUrl || p.imagen || "",
    categoria: esObjetoCat ? p.categoria.nombre : p.categoria || "",
    categoriaId: esObjetoCat ? p.categoria.id : p.categoriaId || "",
  };
}

export async function listarProductosAdmin() {
  const { data } = await api.get("/productos");
  return data.map(normalizarProducto);
}

export async function crearProductoAdmin(producto) {
  const payload = {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    stock: Number(producto.stock),
    stockCritico: Number(producto.stockCritico),
    descuento: Number(producto.descuento || 0),
    imagenUrl: producto.imagen,
    categoria: { id: Number(producto.categoriaId) },
  };
  const { data } = await api.post("/productos", payload);
  return normalizarProducto(data);
}

export async function actualizarProductoAdmin(id, producto) {
  const payload = {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    stock: Number(producto.stock),
    stockCritico: Number(producto.stockCritico),
    descuento: Number(producto.descuento || 0),
    imagenUrl: producto.imagen,
    activo: producto.activo ?? true,
    categoria: { id: Number(producto.categoriaId) },
  };
  const { data } = await api.put(`/productos/${id}`, payload);
  return normalizarProducto(data);
}

export async function eliminarProductoAdmin(id) {
  await api.delete(`/productos/${id}`);
}