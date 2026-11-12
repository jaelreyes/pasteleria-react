// Guarda y lee la sesión (tokens + usuario) en localStorage.
// Así la sesión sobrevive a una recarga de página.
const CLAVE_TOKEN = "token";
const CLAVE_REFRESH = "refreshToken";
const CLAVE_USUARIO = "usuarioActivo";

export function guardarSesion({ token, refreshToken, usuario }) {
  if (token) localStorage.setItem(CLAVE_TOKEN, token);
  if (refreshToken) localStorage.setItem(CLAVE_REFRESH, refreshToken);
  if (usuario) localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export const obtenerToken = () => localStorage.getItem(CLAVE_TOKEN);
export const obtenerRefreshToken = () => localStorage.getItem(CLAVE_REFRESH);

export function limpiarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_REFRESH);
  localStorage.removeItem(CLAVE_USUARIO);
}

// Lee la fecha "exp" dentro del JWT (sin verificar firma; eso lo hace el backend).
export function tokenExpirado(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// La sesión sigue viva mientras el refresh token no haya vencido.
export function haySesionValida() {
  const refresh = obtenerRefreshToken();
  return Boolean(refresh) && !tokenExpirado(refresh);
}