export const obtenerOrdenes = () => {
  try {
    const ordenes = localStorage.getItem('ordenes');
    return ordenes ? JSON.parse(ordenes) : [];
  } catch {
    return [];
  }
};

export const crearOrden = (datosOrden) => {
  const ordenes = obtenerOrdenes();
  const nuevaOrden = {
    id: `ORD-${Date.now()}`,
    fecha: new Date().toISOString(),
    estado: 'completado',
    ...datosOrden
  };
  ordenes.unshift(nuevaOrden);
  localStorage.setItem('ordenes', JSON.stringify(ordenes));
  return nuevaOrden;
};

export const obtenerOrdenPorId = (id) => {
  const ordenes = obtenerOrdenes();
  return ordenes.find(o => o.id === id) || null;
};

export const obtenerOrdenesPorUsuario = (email) => {
  if (!email) return [];
  const ordenes = obtenerOrdenes();
  return ordenes.filter(
    o => o.cliente && o.cliente.email && o.cliente.email.toLowerCase() === email.toLowerCase()
  );
};

export const obtenerUsuarios = () => {
  try {
    const usuarios = localStorage.getItem('usuarios');
    return usuarios ? JSON.parse(usuarios) : [];
  } catch {
    return [];
  }
};

export const guardarUsuario = (usuario) => {
  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex(u => u.email.toLowerCase() === usuario.email.toLowerCase());
  if (indice !== -1) {
    usuarios[indice] = { ...usuarios[indice], ...usuario };
  } else {
    usuarios.push(usuario);
  }
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  return usuario;
};

export const obtenerUsuarioActivo = () => {
  try {
    return JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
  } catch {
    return null;
  }
};

export default {
  obtenerOrdenes,
  crearOrden,
  obtenerOrdenPorId,
  obtenerOrdenesPorUsuario,
  obtenerUsuarios,
  guardarUsuario,
  obtenerUsuarioActivo
};