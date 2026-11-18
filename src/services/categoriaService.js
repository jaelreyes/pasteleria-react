import api from "./api";
import { notificarCambioCatalogo } from "./eventosCatalogo";

export async function listarCategorias() {
  const { data } = await api.get("/categorias");
  return data;
}

export async function crearCategoria(nombre, descripcion = "") {
  const { data } = await api.post("/categorias", { nombre, descripcion });
  notificarCambioCatalogo();
  return data;
}

export async function actualizarCategoria(id, nombre, descripcion = "") {
  const { data } = await api.put(`/categorias/${id}`, { nombre, descripcion });
  notificarCambioCatalogo();
  return data;
}

export async function eliminarCategoria(id) {
  await api.delete(`/categorias/${id}`);
  notificarCambioCatalogo();
}
