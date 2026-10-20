// src/data/db.js

// Claves acordadas en localStorage
const STORAGE_KEYS = {
  ORDENES: 'ordenes',
  USUARIOS: 'usuarios',
  USUARIO_ACTIVO: 'usuarioActivo',
  CARRITO: 'carrito'
};

// --- ORDENES ---
export const obtenerOrdenes = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDENES);
  return data ? JSON.parse(data) : [];
};

export const crearOrden = (datosOrden) => {
  const ordenes = obtenerOrdenes();
  const nuevaOrden = {
    id: `ORD-${Date.now()}`,
    fecha: new Date().toISOString(),
    estado: 'Completada',
    ...datosOrden
  };
  ordenes.push(nuevaOrden);
  localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(ordenes));
  return nuevaOrden;
};

export const obtenerOrdenPorId = (id) => {
  const ordenes = obtenerOrdenes();
  return ordenes.find(o => String(o.id) === String(id)) || null;
};

export const obtenerOrdenesPorUsuario = (email) => {
  if (!email) return [];
  const ordenes = obtenerOrdenes();
  return ordenes.filter(o => o.cliente && o.cliente.email?.toLowerCase() === email.toLowerCase());
};

// --- USUARIOS ---
export const obtenerUsuarios = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
  return data ? JSON.parse(data) : [];
};

export const guardarUsuario = (usuario) => {
  const usuarios = obtenerUsuarios();
  const existeIndice = usuarios.findIndex(u => u.email === usuario.email);
  if (existeIndice >= 0) {
    usuarios[existeIndice] = { ...usuarios[existeIndice], ...usuario };
  } else {
    usuarios.push(usuario);
  }
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
  return usuario;
};

export const obtenerUsuarioActivo = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USUARIO_ACTIVO);
  return data ? JSON.parse(data) : null;
};