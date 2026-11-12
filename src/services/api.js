// Cliente HTTP único para hablar con el backend.
// 1) Agrega "Authorization: Bearer <token>" a cada petición.
// 2) Si el token venció (401), pide uno nuevo con el refresh token y repite la petición.
import axios from "axios";
import {
  obtenerToken,
  obtenerRefreshToken,
  guardarSesion,
  limpiarSesion,
} from "./sesion";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080/api/v1";
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Interceptor de salida: adjunta el token.
api.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const RUTAS_PUBLICAS = ["/auth/login", "/auth/registro", "/auth/refresh"];
let renovacionEnCurso = null;

// Interceptor de respuesta: renueva el token una vez si llega 401.
api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const esPublica = RUTAS_PUBLICAS.some((ruta) => original?.url?.includes(ruta));

    if (status === 401 && original && !esPublica && !original._reintento) {
      original._reintento = true;

      if (obtenerRefreshToken()) {
        try {
          // Si varias peticiones fallan a la vez, se hace un solo refresh.
          renovacionEnCurso =
            renovacionEnCurso ||
            axios
              .post(`${BASE_URL}/auth/refresh`, { refreshToken: obtenerRefreshToken() })
              .finally(() => {
                renovacionEnCurso = null;
              });

          const { data } = await renovacionEnCurso;
          guardarSesion(data);
          original.headers.Authorization = `Bearer ${data.token}`;
          return api(original);
        } catch (errorRefresh) {
          limpiarSesion();
          window.location.assign("/login");
          return Promise.reject(errorRefresh);
        }
      }

      limpiarSesion();
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

// Devuelve el mensaje de error que manda el backend (o uno por defecto).
export function mensajeError(error, porDefecto = "Ocurrió un error. Inténtalo nuevamente.") {
  if (!error.response) return "No se pudo conectar con el servidor.";
  return error.response.data?.mensaje || porDefecto;
}

export default api;