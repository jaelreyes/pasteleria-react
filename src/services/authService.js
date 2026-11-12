// Llamadas al backend relacionadas con autenticación.
import api from "./api";
import { guardarSesion, limpiarSesion } from "./sesion";

// Inicia sesión: guarda token, refresh token y usuario en localStorage.
export async function login(correo, password) {
  const { data } = await api.post("/auth/login", { correo, password });
  guardarSesion(data);
  return data.usuario;
}

// Crea una cuenta de cliente (no inicia sesión automáticamente).
export async function registrar(datos) {
  const { data } = await api.post("/auth/registro", datos);
  return data;
}

// Pide al backend los datos del usuario dueño del token.
export async function obtenerPerfil() {
  const { data } = await api.get("/auth/me");
  return data;
}

export function logout() {
  limpiarSesion();
}