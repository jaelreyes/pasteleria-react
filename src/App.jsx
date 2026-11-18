// Componente principal de la tienda: guarda el catálogo, el carrito y la sesión,
// y define las rutas. Pasa datos y funciones a las páginas por props.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Alert, Button, Toast, ToastContainer } from "react-bootstrap";
import { haySesionValida, limpiarSesion, obtenerToken } from "./services/sesion";
import { obtenerPerfil } from "./services/authService";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";

import { obtenerCatalogo } from "./services/catalogoService";
import { EVENTO_CATALOGO } from "./services/eventosCatalogo";
import { sincronizarCarrito } from "./utils/carrito";
import { obtenerRol } from "./utils/roles";
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
function leerCarrito(usuario) {
  try {
    const clave = obtenerClaveCarrito(usuario);
    const guardado = JSON.parse(
      localStorage.getItem(clave) || "[]"
    );

    if (!Array.isArray(guardado) || guardado.some(item => !item || typeof item !== "object")) {
      throw new Error("Carrito inválido");
    }

    return { items: guardado, aviso: "", persistir: false };
  } catch {
    return {
      items: [],
      persistir: false,
      aviso:
        "No pudimos recuperar el carrito guardado. Puedes agregar tus productos nuevamente.",
    };
  }
}

// Lee el carrito que se armó sin sesión (un usuario sin correo usa la clave "carrito_invitado").
function leerCarritoInvitado() {
  return leerCarrito({});
}

// --- Estado global de la tienda ---
function App() {
  const ubicacion = useLocation();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState("");
  const [catalogoListo, setCatalogoListo] = useState(false);
  const peticionCatalogo = useRef(0);

    // Sesión actual; null si nadie inició sesión.
  // Al recargar la página: si el refresh token sigue vigente se recupera la sesión;
  // si venció (o no hay token), se borra todo y el usuario queda como invitado.
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    if (!haySesionValida()) {
      limpiarSesion();
      return null;
    }
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
    leerCarrito(usuarioActivo)
  );

  const carrito = estadoCarrito.items;

  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Guarda en localStorage usando la clave dinámica del usuario conectado
  useEffect(() => {
    const clave = obtenerClaveCarrito(usuarioActivo);
    if (estadoCarrito.persistir) localStorage.setItem(clave, JSON.stringify(carrito));
  }, [carrito, usuarioActivo, estadoCarrito.persistir]);

  // Solo la respuesta completa más reciente reemplaza el catálogo en memoria.
  const actualizarCatalogo = useCallback(async () => {
    const peticion = ++peticionCatalogo.current;
    setCargandoCatalogo(true);
    setErrorCatalogo("");
    try {
      const nuevo = await obtenerCatalogo();
      if (peticion !== peticionCatalogo.current) return;
      setProductos(nuevo.productos);
      setCategorias(nuevo.categorias);
      setCatalogoListo(true);
    } catch {
      if (peticion === peticionCatalogo.current) {
        setErrorCatalogo("No se pudo actualizar el catálogo. Tu carrito se conserva.");
      }
    } finally {
      if (peticion === peticionCatalogo.current) setCargandoCatalogo(false);
    }
  }, []);

  // Recupera los cambios al navegar entre páginas.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    actualizarCatalogo();
    return () => { peticionCatalogo.current += 1; };
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

    window.addEventListener(EVENTO_CATALOGO, actualizarCatalogo);
    window.addEventListener("focus", actualizarCatalogo);
    window.addEventListener("storage", alCambiarAlmacenamiento);
    document.addEventListener(
      "visibilitychange",
      alCambiarVisibilidad
    );

    return () => {
      window.removeEventListener(EVENTO_CATALOGO, actualizarCatalogo);
      window.removeEventListener("focus", actualizarCatalogo);
      window.removeEventListener("storage", alCambiarAlmacenamiento);
      document.removeEventListener(
        "visibilitychange",
        alCambiarVisibilidad
      );
    };
  }, [actualizarCatalogo]);

  const carritoVerificado = catalogoListo
    ? sincronizarCarrito(carrito, productos)
    : { items: carrito, pendiente: true, aviso: "" };
  const carritoBloqueado = !catalogoListo || cargandoCatalogo || Boolean(errorCatalogo) ||
    carritoVerificado.pendiente || Boolean(estadoCarrito.aviso && !estadoCarrito.persistir);

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

  // Las acciones explícitas del usuario son las únicas que persisten su carrito.
  function agregarProducto(producto, cantidad = 1) {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1 || carritoBloqueado) return;
    const productoActual = productos.find(p => p.id === producto.id && p.codigo === producto.codigo);
    if (!productoActual) return;
    setEstadoCarrito(actual => {
      const sincronizado = sincronizarCarrito(actual.items, productos);
      if (sincronizado.pendiente) return { ...actual, aviso: sincronizado.aviso };
      const existe = sincronizado.items.find(item => item.id === productoActual.id);
      const disponibles = Math.min(productoActual.stock, 99) - (existe?.cantidad || 0);
      const agregar = Math.min(cantidad, disponibles);
      if (agregar <= 0) return { ...actual, aviso: "No hay más unidades disponibles." };
      return {
        persistir: true,
        items: existe ? sincronizado.items.map(item => item.id === productoActual.id
          ? { ...productoActual, cantidad: item.cantidad + agregar } : item)
          : [...sincronizado.items, { ...productoActual, cantidad: agregar }],
        aviso: `Agregaste "${productoActual.nombre}" al carrito.`,
      };
    });
  }

  function vaciarCarrito() {
    setEstadoCarrito({ items: [], aviso: "", persistir: true });
  }

  function eliminarProducto(id) {
    const indices = carritoVerificado.items.flatMap((item, indice) => String(item.id) === String(id) ? [indice] : []);
    if (indices.length !== 1) {
      setEstadoCarrito(actual => ({ ...actual, aviso: "Hay identificadores repetidos. Revisa el carrito antes de retirar este producto." }));
      return;
    }
    setEstadoCarrito(actual => ({
      items: actual.items.filter((_item, indice) => indice !== indices[0]),
      aviso: "", persistir: true,
    }));
  }

  function cambiarCantidad(id, cantidad) {
    if (!catalogoListo || cargandoCatalogo || errorCatalogo ||
        !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 99) return;
    const indices = carritoVerificado.items.flatMap((item, indice) => String(item.id) === String(id) ? [indice] : []);
    if (indices.length !== 1) return;
    const indice = indices[0];
    const codigo = String(carrito[indice]?.codigo || "").trim().toUpperCase();
    const candidatos = productos.filter(p => codigo && String(p.codigo).trim().toUpperCase() === codigo);
    if (candidatos.length !== 1 ||
        (cantidad > candidatos[0].stock && cantidad >= Number(carrito[indice].cantidad))) return;
    setEstadoCarrito(actual => ({
      items: actual.items.map((item, i) => i === indice ? { ...candidatos[0], cantidad } : item),
      aviso: "", persistir: true,
    }));
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

    // Carrito armado como invitado: se lee ANTES de guardar la sesión.
    const carritoInvitado = leerCarritoInvitado();

    localStorage.setItem("usuarioActivo", JSON.stringify(sesion));
    setUsuarioActivo(sesion);

    // Si el usuario no tenía nada en su carrito, se lleva lo que agregó como invitado
    // (así no pierde su compra al iniciar sesión en el checkout).
    const carritoUsuario = leerCarrito(sesion);

    if (!usuarioActivo && !carritoUsuario.aviso &&
        carritoUsuario.items.length === 0 && carritoInvitado.items.length > 0) {
      setEstadoCarrito({ ...carritoInvitado, persistir: true });
    } else {
      setEstadoCarrito(carritoUsuario);
    }
  }

    // Borra la sesión (token, refreshToken y usuarioActivo) y vuelve al carrito de invitado.
  function cerrarSesion() {
    limpiarSesion();
    setUsuarioActivo(null);
    setEstadoCarrito(leerCarrito(null));
  }

  // Al abrir la app (o recargar la página) se confirma con el backend que el token
  // sigue siendo válido y se actualizan los datos del usuario (por si un admin los cambió).
  // Si el token venció, api.js lo renueva solo con el refresh token.
  useEffect(() => {
    if (!obtenerToken()) return;

    obtenerPerfil()
      .then((perfil) => iniciarSesion(perfil))
      .catch(() => cerrarSesion());
    // Se valida el perfil una sola vez al montar, conservando el flujo de sesión existente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Descuento del usuario (por edad o código), 0 si no tiene.
  const descuentoUsuario = obtenerDescuentoUsuario(usuarioActivo);

  const cantidadTotal = carrito.reduce(
    (suma, item) => suma + (Number.isSafeInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 0),
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
              avisoCatalogo={<>
                {cargandoCatalogo && <p role="status">Cargando catálogo...</p>}
                {errorCatalogo && <Alert variant="danger">{errorCatalogo} <Button onClick={actualizarCatalogo}>Reintentar</Button></Alert>}
                {carritoVerificado.aviso && <Alert variant="warning">{carritoVerificado.aviso}</Alert>}
                {estadoCarrito.aviso && !estadoCarrito.persistir && <Alert variant="warning">{estadoCarrito.aviso}</Alert>}
              </>}
              ocultarContenido={(!catalogoListo || Boolean(errorCatalogo)) &&
                (/^\/(productos|categorias|ofertas)(\/|$)/.test(ubicacion.pathname) || ubicacion.pathname === "/")}
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
                carrito={carritoVerificado.items}
                descuentoUsuario={descuentoUsuario}
              />
            }
          />

          <Route
            path="carrito"
            element={
              <Cart
                carrito={carritoVerificado.items}
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
              carritoBloqueado && obtenerRol(usuarioActivo) !== "vendedor" ? <Alert variant="warning">
                Debes verificar los productos y cantidades del carrito antes de comprar. <Link to="/carrito">Revisar carrito</Link>{" "}
                <Button onClick={actualizarCatalogo}>Reintentar</Button>
              </Alert> : <Checkout
                carrito={carritoVerificado.items}
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
                categoriasAPI={categorias}
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
                categoriasAPI={categorias}
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
        carrito={carritoVerificado.items}
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
