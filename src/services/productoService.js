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

export async function listarProductosAdmin() {
  const { data } = await api.get("/productos/admin");
  if (!Array.isArray(data)) throw new Error("Respuesta de productos invalida.");
  return data.map(adaptarProducto);
}

function datosProducto(form) {
  return {
    codigo: form.codigo, nombre: form.nombre, descripcion: form.descripcion,
    precio: Number(form.precio), stock: Number(form.stock), stockCritico: Number(form.stockCritico),
    descuento: Number(form.descuento), imagenUrl: form.imagen,
    categoria: { id: Number(form.categoriaId) },
    activo: form.activo ?? true,
  };
}
export async function crearProducto(form) {
  const { data } = await api.post("/productos", datosProducto(form), { conservarFormulario: true });
  return adaptarProducto(data);
}
export async function actualizarProducto(id, form) {
  const { data } = await api.put(`/productos/${id}`, datosProducto(form), { conservarFormulario: true });
  return adaptarProducto(data);
}
export async function eliminarProductoAPI(id) {
  await api.delete(`/productos/${id}`, { conservarFormulario: true });
}

// Los codigos de estado siguen visibles aunque el servidor no envie un mensaje.
export function errorCatalogo(error) {
  const status = error.response?.status;
  const textos = { 400: "Datos invalidos", 401: "Debes iniciar sesion", 403: "No tienes permisos",
    404: "Recurso no encontrado", 409: "Conflicto con datos existentes" };
  const campos = Object.values(error.response?.data?.errores || {}).join(" ");
  return status ? `${status}: ${error.response?.data?.mensaje || textos[status] || "Error del servidor"}${campos ? ". " + campos : ""}`
    : "No se pudo completar la operacion. Revisa la conexion y reintenta.";
}
