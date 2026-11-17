import api from "./api";

export async function obtenerCategoriasAPI() {
  const { data } = await api.get("/categorias");
  if (!Array.isArray(data) || data.some(c => c.id == null || typeof c.nombre !== "string" || !c.nombre.trim())) {
    throw new Error("Categorías recibidas con formato inválido.");
  }
  return data;
}
