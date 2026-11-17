// Normaliza los formatos de rol utilizados por la API y las sesiones existentes.
export function obtenerRol(usuario) {
  const rol = String(usuario?.rol || usuario?.tipo || '').trim().toLowerCase()
  return rol === 'administrador' ? 'admin' : rol
}

export function esAdministrador(usuario) {
  return obtenerRol(usuario) === 'admin'
}

export function puedeEntrarAlPanel(usuario) {
  return ['admin', 'vendedor'].includes(obtenerRol(usuario))
}

export function rutaInicioSegunRol(usuario) {
  if (esAdministrador(usuario)) return '/admin'
  return obtenerRol(usuario) === 'vendedor' ? '/admin/productos' : '/'
}
