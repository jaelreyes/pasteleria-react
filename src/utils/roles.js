// Tipos de usuario que pueden entrar al panel de administración.
const ROLES_PANEL = ['Administrador', 'Vendedor']

export function puedeEntrarAlPanel(usuario) {
  return Boolean(usuario) && ROLES_PANEL.includes(usuario.tipo)
}

// Página a la que se envía al usuario después de iniciar sesión.
export function rutaInicioSegunRol(usuario) {
  return puedeEntrarAlPanel(usuario) ? '/admin' : '/'
}