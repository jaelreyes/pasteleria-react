// Componente principal de la tienda: guarda el catálogo, el carrito y la sesión,
// y define las rutas. Pasa datos y funciones a las páginas por props.
import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";

import { obtenerProductos } from "./data/db";
import { obtenerDescuentoUsuario } from "./utils/precios";

import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Blogs from "./pages/Blogs";
import BlogDetalle from "./pages/BlogDetalle";
import Pedido from "./pages/Pedido";
import Categorias from "./pages/Categorias";
import Ofertas from "./pages/Ofertas";
import PagoExito from "./pages/PagoExito";
import PagoFallo from "./pages/PagoFallo";
import AdminRoutes from "./admin/AdminRoutes";

// Recupera los datos actuales del catálogo conservando las cantidades.
function sincronizarCarrito(items, catalogo) {
  const productosPorId = new Map(
    catalogo.map((producto) => [String(producto.id), producto])
  );

  // Junta cantidades del mismo producto y descarta ítems inválidos.
  const cantidadesPorId = new Map();

  let retirados = false;
  let cantidadesAjustadas = false;
  let preciosActualizados = false;

  for (const item of items) {
    if (!item || item.id === undefined || item.id === null) {
      retirados = true;
      continue;
    }

    const cantidad = Number(item.cantidad ?? 1);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      retirados = true;
      continue;
    }

    const id = String(item.id);

    cantidadesPorId.set(
      id,
      (cantidadesPorId.get(id) || 0) + cantidad
    );
  }

  // Usa el producto actual del catálogo y limita la cantidad al stock.
  const actualizados = [];

  for (const [id, cantidadSolicitada] of cantidadesPorId) {
    const producto = productosPorId.get(id);
    const stock = Number(producto?.stock);

    if (
      !producto ||
      !Number.isInteger(stock) ||
      stock <= 0
    ) {
      retirados = true;
      continue;
    }

    const cantidad = Math.min(cantidadSolicitada, stock);

    if (cantidad !== cantidadSolicitada) {
      cantidadesAjustadas = true;
    }

    const anterior = items.find(
      (item) => item && String(item.id) === id
    );

    if (
      Number(anterior?.precio) !== Number(producto.precio) ||
      Number(anterior?.descuento || 0) !==
        Number(producto.descuento || 0)
    ) {
      preciosActualizados = true;
    }

    actualizados.push({
      ...producto,
      cantidad,
    });
  }

  // Mensajes para avisar al cliente qué cambió en su carrito.
  const mensajes = [];

  if (preciosActualizados) {
    mensajes.push("Actualizamos los precios y ofertas de tu carrito.");
  }

  if (cantidadesAjustadas) {
    mensajes.push("Ajustamos algunas cantidades al stock disponible.");
  }

  if (retirados) {
    mensajes.push("Retiramos productos que ya no están disponibles.");
  }

  return {
    items: actualizados,
    aviso: mensajes.join(" "),
  };
}

// Obtiene la clave según la sesión activa (correo o email)
function obtenerClaveCarrito(usuario) {
  try {
    const u =
      usuario ||
      JSON.parse(localStorage.getItem("usuarioActivo") || "null");
    const correo = u?.correo || u?.email;
    return correo ? `carrito_${correo}` : "carrito_invitado";
  } catch {
    return "carrito_invitado";
  }
}

// Lee el carrito correspondiente a la sesión
function leerCarrito(catalogo, usuario) {
  try {
    const clave = obtenerClaveCarrito(usuario);
    const guardado = JSON.parse(
      localStorage.getItem(clave) || "[]"
    );

    if (!Array.isArray(guardado)) {
      throw new Error("Carrito inválido");
    }

    return sincronizarCarrito(guardado, catalogo);
  } catch {
    return {
      items: [],
      aviso:
        "No pudimos recuperar el carrito guardado. Puedes agregar tus productos nuevamente.",
    };
  }
}

// --- Estado global de la tienda ---
function App() {
  const ubicacion = useLocation();

  // Catálogo leído desde db.js (localStorage).
  const [productos, setProductos] = useState(() => obtenerProductos());

  // Sesión actual; null si nadie inició sesión.
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("usuarioActivo") || "null"
      );
    } catch {
      return null;
    }
  });

  // Carrito de la sesión + mensaje de aviso (toast).
  const [estadoCarrito, setEstadoCarrito] = useState(() =>
    leerCarrito(productos, usuarioActivo)
  );

  const carrito = estadoCarrito.items;

  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Guarda en localStorage usando la clave dinámica del usuario conectado
  useEffect(() => {
    const clave = obtenerClaveCarrito(usuarioActivo);
    localStorage.setItem(clave, JSON.stringify(carrito));
  }, [carrito, usuarioActivo]);

  // Relee los productos y ajusta el carrito si cambiaron precios o stock.
  const actualizarCatalogo = useCallback(() => {
    const catalogoActual = obtenerProductos();

    setProductos(catalogoActual);

    setEstadoCarrito((actual) => {
      const sincronizado = sincronizarCarrito(
        actual.items,
        catalogoActual
      );

      const mismosItems =
        JSON.stringify(actual.items) ===
        JSON.stringify(sincronizado.items);

      const aviso = sincronizado.aviso || actual.aviso;

      if (mismosItems && aviso === actual.aviso) {
        return actual;
      }

      return {
        items: mismosItems ? actual.items : sincronizado.items,
        aviso,
      };
    });
  }, []);

  // Recupera los cambios al navegar entre páginas.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    actualizarCatalogo();
  }, [ubicacion.pathname, actualizarCatalogo]);

  // Recupera cambios realizados en otra pestaña o al volver a la página.
  useEffect(() => {
    function alCambiarAlmacenamiento(evento) {
      if (evento.key === "productos" || evento.key === null) {
        actualizarCatalogo();
      }
    }

    function alCambiarVisibilidad() {
      if (document.visibilityState === "visible") {
        actualizarCatalogo();
      }
    }

    window.addEventListener("focus", actualizarCatalogo);
    window.addEventListener("storage", alCambiarAlmacenamiento);
    document.addEventListener(
      "visibilitychange",
      alCambiarVisibilidad
    );

    return () => {
      window.removeEventListener("focus", actualizarCatalogo);
      window.removeEventListener("storage", alCambiarAlmacenamiento);
      document.removeEventListener(
        "visibilitychange",
        alCambiarVisibilidad
      );
    };
  }, [actualizarCatalogo]);

  // --- Acciones del carrito (se pasan a las páginas por props) ---
  function abrirCarrito() {
    actualizarCatalogo();
    setMostrarCarrito(true);
  }

  function cerrarAvisoCarrito() {
    setEstadoCarrito((actual) => ({
      ...actual,
      aviso: "",
    }));
  }

  // Agrega unidades sin superar el stock disponible.
  function agregarProducto(producto, cantidad = 1) {
    if (!Number.isInteger(cantidad) || cantidad < 1) return;

    const catalogoActual = obtenerProductos();
    setProductos(catalogoActual);

    setEstadoCarrito((actual) => {
      const sincronizado = sincronizarCarrito(
        actual.items,
        catalogoActual
      );

      const productoActual = catalogoActual.find(
        (item) => String(item.id) === String(producto.id)
      );

      const stock = Number(productoActual?.stock);

      if (
        !productoActual ||
        !Number.isInteger(stock) ||
        stock <= 0
      ) {
        return {
          items: sincronizado.items,
          aviso: "Este producto ya no está disponible.",
        };
      }

      const existe = sincronizado.items.find(
        (item) => item.id === productoActual.id
      );

      const cantidadActual = existe?.cantidad || 0;
      const disponibles = Math.max(0, stock - cantidadActual);
      const cantidadAgregar = Math.min(cantidad, disponibles);

      if (cantidadAgregar <= 0) {
        return {
          items: sincronizado.items,
          aviso:
            "Ya tienes todas las unidades disponibles de este producto.",
        };
      }

      const items = existe
        ? sincronizado.items.map((item) =>
            item.id === productoActual.id
              ? {
                  ...productoActual,
                  cantidad: item.cantidad + cantidadAgregar,
                }
              : item
          )
        : [
            ...sincronizado.items,
            { ...productoActual, cantidad: cantidadAgregar },
          ];

      return {
        items,
        aviso:
          cantidadAgregar < cantidad
            ? "Agregamos únicamente las unidades disponibles."
            : `¡Agregaste "${productoActual.nombre}" al carrito!`,
      };
    });
  }

  // Deja el carrito vacío (también se usa al confirmar la compra).
  function vaciarCarrito() {
    setEstadoCarrito({
      items: [],
      aviso: "",
    });
  }

  // Quita un producto del carrito.
  function eliminarProducto(idAEliminar) {
    setEstadoCarrito((actual) => ({
      items: actual.items.filter(
        (item) => item.id !== idAEliminar
      ),
      aviso: actual.aviso,
    }));
  }

  // Cambia la cantidad si está entre 1 y el stock.
  function cambiarCantidad(id, nuevaCantidad) {
    const catalogoActual = obtenerProductos();

    setProductos(catalogoActual);

    setEstadoCarrito((actual) => {
      const sincronizado = sincronizarCarrito(
        actual.items,
        catalogoActual
      );

      const productoActual = catalogoActual.find(
        (producto) => String(producto.id) === String(id)
      );

      if (
        !productoActual ||
        !Number.isInteger(nuevaCantidad) ||
        nuevaCantidad < 1 ||
        nuevaCantidad > Number(productoActual.stock)
      ) {
        return {
          items: sincronizado.items,
          aviso:
            sincronizado.aviso ||
            "La cantidad solicitada no está disponible.",
        };
      }

      return {
        items: sincronizado.items.map((item) =>
          item.id === productoActual.id
            ? { ...productoActual, cantidad: nuevaCantidad }
            : item
        ),
        aviso: sincronizado.aviso || actual.aviso,
      };
    });
  }

  // Guarda la sesión en localStorage y carga el carrito de ese usuario.
  function iniciarSesion(usuario) {
    const sesion = {
      run: usuario.run,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.email || usuario.correo,
      telefono: usuario.telefono || "",
      direccion: usuario.direccion || "",
      region: usuario.region || "",
      comuna: usuario.comuna || "",
      rol: usuario.rol || "cliente",
      tipo: usuario.tipo || "Cliente",
      beneficios: usuario.beneficios || [],
      descuentoEdad: usuario.descuentoEdad || 0,
      descuentoCodigo: usuario.descuentoCodigo || 0,
      tortaGratisDuoc: usuario.tortaGratisDuoc || false,
      fechaLogin: new Date().toISOString(),
    };

    localStorage.setItem("usuarioActivo", JSON.stringify(sesion));
    setUsuarioActivo(sesion);
    setEstadoCarrito(leerCarrito(productos, sesion));
  }

  // Borra la sesión y vuelve al carrito de invitado.
  function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    setUsuarioActivo(null);
    setEstadoCarrito(leerCarrito(productos, null));
  }

  // Descuento del usuario (por edad o código), 0 si no tiene.
  const descuentoUsuario = obtenerDescuentoUsuario(usuarioActivo);

  const cantidadTotal = carrito.reduce(
    (suma, item) => suma + item.cantidad,
    0
  );

  useEffect(() => {
    document.title = `(${cantidadTotal}) Pastelería 1000 Sabores`;
  }, [cantidadTotal]);

  // En el panel admin no se muestran los avisos del carrito.
  const esAdministracion =
    ubicacion.pathname === "/admin" ||
    ubicacion.pathname.startsWith("/admin/");

  return (
    <>
      {/* Rutas: la tienda usa Layout (menú y pie); /admin tiene su propio diseño */}
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              cantidad={cantidadTotal}
              onVerCarrito={abrirCarrito}
              usuarioActivo={usuarioActivo}
              onCerrarSesion={cerrarSesion}
            />
          }
        >
          <Route index element={<Home productos={productos} />} />

          <Route
            path="productos"
            element={
              <ProductList
                productos={productos}
                onAgregar={agregarProducto}
                descuentoUsuario={descuentoUsuario}
              />
            }
          />

          <Route
            path="productos/:id"
            element={
              <ProductDetail
                productos={productos}
                onAgregar={agregarProducto}
                carrito={carrito}
                descuentoUsuario={descuentoUsuario}
              />
            }
          />

          <Route
            path="carrito"
            element={
              <Cart
                carrito={carrito}
                descuento={descuentoUsuario}
                onVaciar={vaciarCarrito}
                onEliminar={eliminarProducto}
                onCambiarCantidad={cambiarCantidad}
              />
            }
          />

          <Route
            path="checkout"
            element={
              <Checkout
                carrito={carrito}
                descuento={descuentoUsuario}
                onCompraConfirmada={vaciarCarrito}
              />
            }
          />

          <Route
            path="pago/exito/:idOrden"
            element={<PagoExito />}
          />

          <Route path="pago/error" element={<PagoFallo />} />
          <Route path="pedido" element={<Pedido />} />

          <Route
            path="categorias"
            element={
              <Categorias
                productos={productos}
                onAgregar={agregarProducto}
                descuentoUsuario={descuentoUsuario}
              />
            }
          />

          <Route
            path="categorias/:slug"
            element={
              <Categorias
                productos={productos}
                onAgregar={agregarProducto}
                descuentoUsuario={descuentoUsuario}
              />
            }
          />

          <Route
            path="ofertas"
            element={
              <Ofertas
                productos={productos}
                onAgregar={agregarProducto}
                descuentoUsuario={descuentoUsuario}
              />
            }
          />

          <Route path="nosotros" element={<Nosotros />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogDetalle />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="registro" element={<Registro />} />

          <Route
            path="login"
            element={<Login onIniciarSesion={iniciarSesion} />}
          />

          {/* Cualquier ruta que no existe muestra la página 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Panel de administración (tiene su propio diseño y rutas) */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>

      {/* Carrito lateral que se abre desde el menú */}
      <CartPanel
        mostrar={mostrarCarrito}
        onCerrar={() => setMostrarCarrito(false)}
        carrito={carrito}
        descuento={descuentoUsuario}
        onVaciar={vaciarCarrito}
        onEliminar={eliminarProducto}
        onCambiarCantidad={cambiarCantidad}
      />

      {/* Aviso flotante al agregar productos o cambiar el carrito */}
      <ToastContainer
        position="bottom-center"
        className="p-3"
        style={{
          position: "fixed",
          zIndex: 1090,
          width: "min(100%, 480px)",
        }}
      >
        <Toast
          show={Boolean(estadoCarrito.aviso) && !esAdministracion}
          onClose={cerrarAvisoCarrito}
          autohide
          delay={3500}
          role="status"
          aria-live="polite"
          style={{ width: "100%" }}
        >
          <Toast.Header>
            <strong className="me-auto">Pastelería 1000 Sabores</strong>
          </Toast.Header>

          <Toast.Body>
            <p className="mb-2">{estadoCarrito.aviso}</p>

            <Link
              to="/carrito"
              onClick={() => {
                setMostrarCarrito(false);
                cerrarAvisoCarrito();
              }}
            >
              Revisar mi carrito
            </Link>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default App;