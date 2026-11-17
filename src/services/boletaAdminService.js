import api from "./api";

export async function listarBoletasAdmin() {
  const { data } = await api.get("/boletas");
  return data;
}

export async function obtenerBoletaAdmin(id) {
  const { data } = await api.get(`/boletas/${id}`);
  return data;
}

export async function actualizarEstadoBoletaAdmin(id, estado) {
  const { data } = await api.patch(`/boletas/${id}/estado`, { estado });
  return data;
}