// Capa de datos de la app: CRUD en localStorage de usuarios,
// productos, categorías y órdenes. Las vistas solo llaman a estas funciones.
import productosIniciales from "./productos";
import { calcularPrecioProducto, calcularTotales } from "../utils/precios";

// --- USUARIOS Y ROLES ---

// Lee los usuarios; la primera vez crea las 3 cuentas demo.
export const obtenerUsuarios = () => {
  try {
    const guardados = localStorage.getItem("usuarios");

    if (guardados === null) {
      const usuariosDemo = [
        {
          nombre: "Administrador Demo",
          email: "admin@duoc.cl",
          password: "admin123",
          rol: "admin",
          tipo: "Administrador",
        },
        {
          nombre: "Vendedor Demo",
          email: "vendedor@duoc.cl",
          password: "venta123",
          rol: "vendedor",
          tipo: "Vendedor",
        },
        {
          nombre: "Cliente Demo",
          email: "cliente@gmail.com",
          password: "cliente1",
          rol: "cliente",
          tipo: "Cliente",
        },
      ];

      localStorage.setItem("usuarios", JSON.stringify(usuariosDemo));
      return usuariosDemo;
    }

    const usuarios = JSON.parse(guardados);

    if (!Array.isArray(usuarios)) {
      throw new Error("Los usuarios guardados no tienen un formato válido.");
    }

    return usuarios;
  } catch (error) {
    console.error("Error al leer usuarios:", error);
    return [];
  }
};

// Usuario con sesión iniciada, o null si no hay sesión.
export const obtenerUsuarioActivo = () => {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  } catch {
    return null;
  }
};

// Borra un usuario por su correo.
export const eliminarUsuario = (email) => {
  try {
    const usuarios = obtenerUsuarios().filter(
      (usuario) => String(usuario.email || usuario.correo) !== String(email),
    );

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
};

// Solo admin y vendedor pueden entrar al panel /admin.
export const puedeEntrarAlPanel = () => {
  const usuario = obtenerUsuarioActivo();

  if (!usuario) return false;

  const rol = String(usuario.rol || usuario.tipo || "")
    .trim()
    .toLowerCase();

  return ["admin", "administrador", "vendedor"].includes(rol);
};

// --- PRODUCTOS ---

// Lee los productos; la primera vez copia el catálogo inicial.
export function obtenerProductos() {
  const guardados = localStorage.getItem("productos");

  if (guardados === null) {
    const productos = productosIniciales.map((producto) => ({
      ...producto,
      descuento: Number(producto.descuento) || 0,
    }));

    localStorage.setItem("productos", JSON.stringify(productos));
    return productos;
  }

  const productos = JSON.parse(guardados);

  if (!Array.isArray(productos)) {
    throw new Error("Los productos guardados no tienen un formato válido.");
  }

  return productos;
}

// Crear (sin id) o editar (con id) un producto.
export const guardarProducto = (producto) => {
  try {
    let productos = obtenerProductos();

    if (producto.id) {
      productos = productos.map((actual) =>
        actual.id === producto.id ? producto : actual,
      );
    } else {
      producto.id = Date.now();
      productos.push(producto);
    }

    localStorage.setItem("productos", JSON.stringify(productos));
  } catch (error) {
    console.error("Error al guardar producto:", error);
  }
};

// Borra un producto por su id.
export const eliminarProducto = (id) => {
  try {
    const productos = obtenerProductos().filter(
      (producto) => producto.id !== id,
    );

    localStorage.setItem("productos", JSON.stringify(productos));
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
};

// PESTAÑA 5 · CRUD de categorías guardado en localStorage (clave "categorias").
// --- CATEGORÍAS ---

// Categorías base de la pastelería.
const CATEGORIAS_INICIALES = [
  "Tortas Cuadradas",
  "Tortas Circulares",
  "Postres Individuales",
  "Productos Sin Azúcar",
  "Pastelería Tradicional",
  "Productos Sin Gluten",
  "Productos Veganos",
  "Tortas Especiales",
];

// Categorías guardadas, o las iniciales si nunca se han modificado.
function leerCategoriasGuardadas() {
  const guardadas = localStorage.getItem("categorias");

  // Solo lectura: se guardan recién cuando alguien crea, edita o elimina.
  if (guardadas === null) {
    return [...CATEGORIAS_INICIALES];
  }

  const categorias = JSON.parse(guardadas);

  if (!Array.isArray(categorias)) {
    throw new Error("Las categorías guardadas no tienen un formato válido.");
  }

  return categorias;
}

// Compara nombres sin importar mayúsculas ni espacios.
function mismoNombre(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

// Leer: categorías guardadas más las que usan los productos.
export const obtenerCategorias = () => {
  return [
    // new Set quita las categorías repetidas.
    ...new Set([
      ...leerCategoriasGuardadas(),
      ...obtenerProductos()
        .map((producto) => producto.categoria)
        .filter(Boolean),
    ]),
  ];
};

// Cuántos productos pertenecen a una categoría.
export const contarProductosPorCategoria = (nombre) =>
  obtenerProductos().filter((producto) => producto.categoria === nombre)
    .length;

// Crear (sin nombreAnterior) o editar (con nombreAnterior).
// Al renombrar, también actualiza la categoría de sus productos.
export const guardarCategoria = (nombre, nombreAnterior = null) => {
  // Nombre sin espacios al inicio ni al final.
  const limpio = String(nombre || "").trim();

  // Regla 1: entre 3 y 50 caracteres. throw corta la función y la vista muestra el mensaje.
  if (limpio.length < 3 || limpio.length > 50) {
    throw new Error("El nombre debe tener entre 3 y 50 caracteres.");
  }

  const categorias = obtenerCategorias();

  // Regla 2: no repetir nombres ("galletas" = "Galletas"). Al editar se ignora su propio nombre.
  const repetida = categorias.some(
    (actual) => mismoNombre(actual, limpio) && actual !== nombreAnterior,
  );

  if (repetida) {
    throw new Error(`Ya existe la categoría "${limpio}".`);
  }

  // CREAR: agrega la nueva al final y guarda.
  if (nombreAnterior === null) {
    localStorage.setItem("categorias", JSON.stringify([...categorias, limpio]));
    return limpio;
  }

  // EDITAR: la categoría a renombrar tiene que existir.
  if (!categorias.includes(nombreAnterior)) {
    throw new Error("No encontramos la categoría a editar.");
  }

  localStorage.setItem(
    "categorias",
    JSON.stringify(
      // Reemplaza el nombre viejo por el nuevo.
      categorias.map((actual) => (actual === nombreAnterior ? limpio : actual)),
    ),
  );

  // Los productos de esa categoría pasan al nombre nuevo (no quedan huérfanos).
  const productos = obtenerProductos().map((producto) =>
    producto.categoria === nombreAnterior
      ? { ...producto, categoria: limpio }
      : producto,
  );

  localStorage.setItem("productos", JSON.stringify(productos));
  return limpio;
};

// Eliminar: solo si ningún producto la usa.
export const eliminarCategoria = (nombre) => {
  // ELIMINAR: primero cuenta cuántos productos la usan.
  const cantidad = contarProductosPorCategoria(nombre);

  if (cantidad > 0) {
    throw new Error(
      `No se puede eliminar "${nombre}" porque tiene ${cantidad} producto(s).`,
    );
  }

  localStorage.setItem(
    "categorias",
    // filter deja todas menos la eliminada.
    JSON.stringify(obtenerCategorias().filter((actual) => actual !== nombre)),
  );
};

// --- ÓRDENES ---

// Todas las órdenes de compra (lista vacía si no hay).
export const obtenerOrdenes = () => {
  try {
    const ordenes = JSON.parse(localStorage.getItem("ordenes") || "[]");

    return Array.isArray(ordenes) ? ordenes : [];
  } catch {
    return [];
  }
};

// Agrega una orden nueva al final de la lista.
export const guardarOrden = (orden) => {
  try {
    const ordenes = obtenerOrdenes();

    ordenes.push(orden);

    localStorage.setItem("ordenes", JSON.stringify(ordenes));
  } catch (error) {
    console.error("Error al guardar la orden:", error);
  }
};

// Busca una orden por id (se usa en la boleta).
export const obtenerOrdenPorId = (id) => {
  try {
    return obtenerOrdenes().find((orden) => String(orden.id) === String(id));
  } catch {
    return null;
  }
};

// Cambia el estado y devuelve stock al cancelar, cuando corresponde.
export const actualizarEstadoOrden = (id, nuevoEstado) => {
  const estadosPermitidos = [
    "pendiente",
    "procesando",
    "enviado",
    "completado",
    "cancelado",
  ];

  if (!estadosPermitidos.includes(nuevoEstado)) {
    throw new Error("El estado seleccionado no es válido.");
  }

  const ordenes = JSON.parse(localStorage.getItem("ordenes") || "[]");

  if (!Array.isArray(ordenes)) {
    throw new Error("Las órdenes guardadas no tienen un formato válido.");
  }

  const indice = ordenes.findIndex((orden) => String(orden.id) === String(id));

  if (indice === -1) {
    throw new Error("No encontramos la orden.");
  }

  const orden = ordenes[indice];
  const estadoActual = orden.estado || "pendiente";

  // No repite movimientos de stock si el estado no cambia.
  if (estadoActual === nuevoEstado) {
    return orden;
  }

  // Una orden cancelada ya no puede cambiar de estado.
  if (estadoActual === "cancelado") {
    throw new Error(
      "Una orden cancelada no se puede reactivar. Debe realizarse una compra nueva.",
    );
  }

  // Solo se devuelve stock si se descontó y aún no se devolvió.
  const debeRestituirStock =
    nuevoEstado === "cancelado" &&
    orden.stockDescontado === true &&
    orden.stockRestituido !== true;

  let productosAnteriores = null;
  let productosActualizados = null;

  if (debeRestituirStock) {
    if (!Array.isArray(orden.productos) || orden.productos.length === 0) {
      throw new Error(
        "La orden no tiene productos válidos para devolver al inventario.",
      );
    }

    const catalogo = obtenerProductos();
    productosAnteriores = localStorage.getItem("productos");

    // Suma por producto las unidades que vuelven al inventario.
    const cantidadesADevolver = new Map();

    for (const item of orden.productos) {
      if (
        !item ||
        item.id === null ||
        item.id === undefined ||
        !Number.isSafeInteger(item.cantidad) ||
        item.cantidad < 1
      ) {
        throw new Error(
          "La orden contiene cantidades inválidas. Revisa sus productos antes de cancelarla.",
        );
      }

      const idProducto = String(item.id);

      const producto = catalogo.find(
        (actual) => String(actual.id) === idProducto,
      );

      if (!producto) {
        throw new Error(
          `No se puede devolver "${item.nombre || idProducto}" porque ya no existe en el catálogo.`,
        );
      }

      const cantidad =
        (cantidadesADevolver.get(idProducto) || 0) + item.cantidad;

      if (!Number.isSafeInteger(cantidad)) {
        throw new Error("La cantidad a devolver no es válida.");
      }

      cantidadesADevolver.set(idProducto, cantidad);
    }

    productosActualizados = catalogo.map((producto) => {
      const cantidad = cantidadesADevolver.get(String(producto.id));

      if (cantidad === undefined) return producto;

      const stockActual = Number(producto.stock);
      const nuevoStock = stockActual + cantidad;

      if (
        !Number.isSafeInteger(stockActual) ||
        stockActual < 0 ||
        !Number.isSafeInteger(nuevoStock)
      ) {
        throw new Error(`El stock de "${producto.nombre}" no es válido.`);
      }

      return {
        ...producto,
        stock: nuevoStock,
      };
    });
  }

  const ordenActualizada = {
    ...orden,
    estado: nuevoEstado,
    ...(debeRestituirStock ? { stockRestituido: true } : {}),
  };

  const ordenesActualizadas = ordenes.map((actual, posicion) =>
    posicion === indice ? ordenActualizada : actual,
  );

  // Si falla al guardar la orden, se restaura el stock anterior.
  let stockGuardado = false;

  try {
    if (debeRestituirStock) {
      localStorage.setItem("productos", JSON.stringify(productosActualizados));

      stockGuardado = true;
    }

    localStorage.setItem("ordenes", JSON.stringify(ordenesActualizadas));
  } catch {
    if (stockGuardado) {
      try {
        if (productosAnteriores === null) {
          localStorage.removeItem("productos");
        } else {
          localStorage.setItem("productos", productosAnteriores);
        }
      } catch {
        throw new Error(
          "No se pudo actualizar la orden ni restaurar el inventario. Revisa el stock antes de intentar nuevamente.",
        );
      }
    }

    throw new Error("No se pudo guardar el cambio de estado.");
  }

  return ordenActualizada;
};

// --- CONFIRMACIÓN DE COMPRA ---

// Confirma una compra: valida el carrito contra el catálogo actual,
// guarda la orden y descuenta el stock. Si algo falla, no guarda nada.
export function confirmarCompra(datosOrden, carrito, descuentoUsuario = 0) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  if (!datosOrden?.id) {
    throw new Error("La compra no tiene un identificador válido.");
  }

  const catalogo = obtenerProductos();
  const productosAnteriores = localStorage.getItem("productos");

  const ordenes = JSON.parse(localStorage.getItem("ordenes") || "[]");

  if (!Array.isArray(ordenes)) {
    throw new Error("Las órdenes guardadas no tienen un formato válido.");
  }

  // Evita guardar dos veces la misma orden.
  if (ordenes.some((orden) => String(orden.id) === String(datosOrden.id))) {
    throw new Error("Esta orden ya fue registrada.");
  }

  const idsRevisados = new Set();

  // Revisa cada producto: id, cantidad, stock y precio vigentes.
  const productosCompra = carrito.map((item) => {
    if (!item || item.id === null || item.id === undefined) {
      throw new Error("Hay un producto inválido en el carrito.");
    }

    const id = String(item.id);

    if (idsRevisados.has(id)) {
      throw new Error("Hay productos repetidos. Revisa el carrito.");
    }

    idsRevisados.add(id);

    if (!Number.isSafeInteger(item.cantidad) || item.cantidad < 1) {
      throw new Error("Hay una cantidad inválida en el carrito.");
    }

    const productoActual = catalogo.find(
      (producto) => String(producto.id) === id,
    );

    if (!productoActual) {
      throw new Error(
        `"${item.nombre || "El producto"}" ya no está disponible. Retíralo del carrito.`,
      );
    }

    const stock = Number(productoActual.stock);

    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw new Error(`El stock de "${productoActual.nombre}" no es válido.`);
    }

    if (item.cantidad > stock) {
      throw new Error(
        `Solo quedan ${stock} unidades de "${productoActual.nombre}". Revisa la cantidad en el carrito.`,
      );
    }

    const precio = Number(productoActual.precio);

    if (!Number.isFinite(precio) || precio < 0) {
      throw new Error(`El precio de "${productoActual.nombre}" no es válido.`);
    }

    const precioAnterior = calcularPrecioProducto(item, descuentoUsuario);

    const precioActual = calcularPrecioProducto(
      productoActual,
      descuentoUsuario,
    );

    // Si el precio cambió desde que se agregó al carrito, se avisa.
    if (
      precioAnterior.precioBase !== precioActual.precioBase ||
      precioAnterior.precioFinal !== precioActual.precioFinal
    ) {
      throw new Error(
        `Cambió el precio de "${productoActual.nombre}". Retíralo del carrito y vuelve a agregarlo para revisar el nuevo total.`,
      );
    }

    return {
      ...productoActual,
      cantidad: item.cantidad,
    };
  });

  const { subtotal, ahorro, total } = calcularTotales(
    productosCompra,
    descuentoUsuario,
  );

  // Orden que se guarda, con los precios calculados al momento de comprar.
  const nuevaOrden = {
    ...datosOrden,
    estado: "pendiente",
    pagoSimulado: true,
    stockDescontado: true,
    stockRestituido: false,
    descuentoUsuario,
    subtotal,
    ahorro,
    total,

    productos: productosCompra.map((producto) => {
      const {
        precioBase,
        precioFinal,
        descuento: descuentoAplicado,
      } = calcularPrecioProducto(producto, descuentoUsuario);

      return {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        imagen: producto.imagen,
        cantidad: producto.cantidad,
        precioBase,
        precioFinal,
        descuentoAplicado,
      };
    }),
  };

  const cantidadesCompradas = new Map(
    productosCompra.map((producto) => [String(producto.id), producto.cantidad]),
  );

  // Descuenta del stock las unidades compradas.
  const catalogoActualizado = catalogo.map((producto) => {
    const cantidad = cantidadesCompradas.get(String(producto.id));

    if (cantidad === undefined) return producto;

    return {
      ...producto,
      stock: Number(producto.stock) - cantidad,
    };
  });

  // Si falla al guardar la orden, se restaura el stock anterior.
  let stockGuardado = false;

  try {
    localStorage.setItem("productos", JSON.stringify(catalogoActualizado));

    stockGuardado = true;

    localStorage.setItem("ordenes", JSON.stringify([...ordenes, nuevaOrden]));
  } catch {
    if (stockGuardado) {
      try {
        if (productosAnteriores === null) {
          localStorage.removeItem("productos");
        } else {
          localStorage.setItem("productos", productosAnteriores);
        }
      } catch {
        throw new Error(
          "No se pudo guardar la orden ni restaurar el stock. Revisa el inventario antes de intentar nuevamente.",
        );
      }
    }

    throw new Error("No se pudo guardar la compra. El carrito se conserva.");
  }

  return nuevaOrden;
}