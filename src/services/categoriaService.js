import api from "./api";

export async function obtenerCategoriasAPI() {
  const { data } = await api.get("/categorias");
  if (!Array.isArray(data) || data.some(c => c.id == null || typeof c.nombre !== "string" || !c.nombre.trim())) {
    throw new Error("Categorías recibidas con formato inválido.");
  }
  return data;
}

export async function crearCategoria(datos) {
  const { data } = await api.post("/categorias", { nombre: datos.nombre, descripcion: datos.descripcion || "" }, { conservarFormulario: true });
  return data;
}
export async function actualizarCategoria(id, datos) {
  const { data } = await api.put(`/categorias/${id}`, { nombre: datos.nombre, descripcion: datos.descripcion || "" }, { conservarFormulario: true });
  return data;
}
export async function eliminarCategoriaAPI(id) {
  await api.delete(`/categorias/${id}`, { conservarFormulario: true });
}
