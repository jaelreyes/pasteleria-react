// CRUD de usuarios (solo funciona con token de Administrador).
import api from "./api";

export async function listarUsuarios() {
  const { data } = await api.get("/usuarios");
  return data;
}

export async function crearUsuario(usuario) {
  const { data } = await api.post("/usuarios", usuario);
  return data;
}

export async function actualizarUsuario(id, usuario) {
  const { data } = await api.put(`/usuarios/${id}`, usuario);
  return data;
}

export async function eliminarUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}