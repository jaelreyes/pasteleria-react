// --- USUARIOS Y ROLES ---
export const obtenerUsuarios = () => {
  try {
    const demo = [
      { nombre: 'Administrador Demo', email: 'admin@duoc.cl', password: 'admin123', rol: 'admin', tipo: 'Administrador' },
      { nombre: 'Vendedor Demo', email: 'vendedor@duoc.cl', password: 'venta123', rol: 'vendedor', tipo: 'Vendedor' },
      { nombre: 'Cliente Demo', email: 'cliente@gmail.com', password: 'cliente1', rol: 'cliente', tipo: 'Cliente' }
    ];

    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    demo.forEach(d => {
      const idx = usuarios.findIndex(u => String(u.email || u.correo || '').trim().toLowerCase() === d.email.toLowerCase());
      if (idx === -1) {
        usuarios.push(d);
      } else {
        usuarios[idx].password = d.password;
        usuarios[idx].rol = d.rol;
        usuarios[idx].tipo = d.tipo;
      }
    });

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return usuarios;
  } catch {
    return [];
  }
};

export const obtenerUsuarioActivo = () => {
  try {
    return JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
  } catch {
    return null;
  }
};

export const eliminarUsuario = (email) => {
  try {
    let usuarios = obtenerUsuarios();
    usuarios = usuarios.filter(u => String(u.email || u.correo) !== String(email));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
};

// Función obligatoria para proteger el acceso al panel
export const puedeEntrarAlPanel = () => {
  const usuario = obtenerUsuarioActivo();
  if (!usuario) return false;
  const rol = (usuario.rol || usuario.tipo || '').toLowerCase();
  return rol === 'admin' || rol === 'administrador' || rol === 'vendedor';
};

// --- PRODUCTOS ---
export const obtenerProductos = () => {
  try {
    const porDefecto = [
      { id: 1, nombre: 'Torta de Mil Hojas', precio: 18000, stock: 4, categoria: 'Tortas', descuento: 0 },
      { id: 2, nombre: 'Kuchen de Manzana', precio: 12000, stock: 12, categoria: 'Kuchen', descuento: 10 },
      { id: 3, nombre: 'Torta de Chocolate', precio: 20000, stock: 3, categoria: 'Tortas', descuento: 5 }
    ];
    let prods = JSON.parse(localStorage.getItem('productos') || 'null');
    if (!prods || prods.length === 0) {
      localStorage.setItem('productos', JSON.stringify(porDefecto));
      return porDefecto;
    }
    return prods;
  } catch {
    return [];
  }
};

export const guardarProducto = (producto) => {
  try {
    let prods = obtenerProductos();
    if (producto.id) {
      prods = prods.map(p => p.id === producto.id ? producto : p);
    } else {
      producto.id = Date.now();
      prods.push(producto);
    }
    localStorage.setItem('productos', JSON.stringify(prods));
  } catch (error) {
    console.error('Error al guardar producto:', error);
  }
};

export const eliminarProducto = (id) => {
  try {
    let prods = obtenerProductos();
    prods = prods.filter(p => p.id !== id);
    localStorage.setItem('productos', JSON.stringify(prods));
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
};

// --- CATEGORÍAS ---
export const obtenerCategorias = () => {
  return ['Tortas', 'Kuchen', 'Galletas', 'Postres'];
};

// --- ÓRDENES ---
export const obtenerOrdenes = () => {
  try {
    return JSON.parse(localStorage.getItem('ordenes') || '[]');
  } catch {
    return [];
  }
};

export const guardarOrden = (orden) => {
  try {
    const ordenes = obtenerOrdenes();
    ordenes.push(orden);
    localStorage.setItem('ordenes', JSON.stringify(ordenes));
  } catch (error) {
    console.error('Error al guardar la orden:', error);
  }
};

export const obtenerOrdenPorId = (id) => {
  try {
    const ordenes = obtenerOrdenes();
    return ordenes.find(o => String(o.id) === String(id));
  } catch {
    return null;
  }
};

export const actualizarEstadoOrden = (id, nuevoEstado) => {
  try {
    let ordenes = obtenerOrdenes();
    ordenes = ordenes.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o);
    localStorage.setItem('ordenes', JSON.stringify(ordenes));
  } catch (error) {
    console.error('Error al actualizar la orden:', error);
  }
};