// Componente principal de la tienda: guarda el catálogo, el carrito y la sesión,
// y define las rutas. Pasa datos y funciones a las páginas por props.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Toast, ToastContainer, Alert, Button } from "react-bootstrap";
import { haySesionValida, limpiarSesion, obtenerToken } from "./services/sesion";
import { obtenerPerfil } from "./services/authService";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";

import { obtenerProductosAPI } from "./services/productoService";
import { obtenerCategoriasAPI } from "./services/categoriaService";
import { sincronizarCarrito } from "./utils/carrito";
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

    if (!Array.isArray(guardado)) {
      throw new Error("Carrito inválido");
    }

    return { items: guardado, aviso: "", persistir: false };
  } catch {
    return {
      items: [],
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

  // Catálogo remoto; no se escribe en la base local del panel administrativo.
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

  // Solo una respuesta completa y vigente sustituye el catálogo en memoria.
  const actualizarCatalogo = useCallback(async () => {
    const peticion = ++peticionCatalogo.current;
    setCargandoCatalogo(true);
    setErrorCatalogo("");
    try {
      const [nuevosProductos, nuevasCategorias] = await Promise.all([
        obtenerProductosAPI(), obtenerCategoriasAPI(),
      ]);
      if (peticion !== peticionCatalogo.current) return;
      setProductos(nuevosProductos);
      setCategorias(nuevasCategorias);
      setCatalogoListo(true);
    } catch {
      if (peticion === peticionCatalogo.current) {
        setErrorCatalogo("No se pudo actualizar el catálogo. Tu carrito se conserva.");
      }
    } finally {
      if (peticion === peticionCatalogo.current) setCargandoCatalogo(false);
    }
  }, []);

  useEffect(() => {
    // La petición sincroniza el estado con el servidor al cambiar de ruta.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    actualizarCatalogo();
    return () => { peticionCatalogo.current += 1; };
  }, [ubicacion.pathname, actualizarCatalogo]);

  // Se verifica por código, nunca únicamente por el ID de la antigua base local.
  const carritoVerificado = catalogoListo
    ? sincronizarCarrito(carrito, productos)
    : { items: carrito, pendiente: true, aviso: "" };
  const carritoBloqueado = cargandoCatalogo || Boolean(errorCatalogo) || carritoVerificado.pendiente;

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

    if (carritoBloqueado) return;
    const catalogoActual = productos;

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
        persistir: true,
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
      persistir: true,
      items: [],
      aviso: "",
    });
  }

  // Quita un producto del carrito.
  function eliminarProducto(idAEliminar) {
    if (carritoVerificado.items.filter(item => item?.id === idAEliminar).length !== 1) {
      setEstadoCarrito(actual => ({ ...actual, aviso: "Hay identificadores repetidos en el carrito. Revisa los productos antes de eliminarlos." }));
      return;
    }
    setEstadoCarrito((actual) => ({
      persistir: true,
      items: actual.items.filter(
        (_item, indice) => carritoVerificado.items[indice]?.id !== idAEliminar
      ),
      aviso: actual.aviso,
    }));
  }

  // Cambia la cantidad si está entre 1 y el stock.
  function cambiarCantidad(id, nuevaCantidad) {
    if (!catalogoListo || cargandoCatalogo || errorCatalogo) return;
    const indices = carritoVerificado.items.flatMap((item, indice) => item.id === id ? [indice] : []);
    if (indices.length !== 1) return;
    const original = carrito[indices[0]];
    const candidatos = productos.filter(p => p.codigo && p.codigo === original.codigo);
    if (candidatos.length !== 1) return;
    const catalogoActual = productos;

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
        (nuevaCantidad > Number(productoActual.stock) && nuevaCantidad >= original.cantidad)
      ) {
        return {
          items: sincronizado.items,
          aviso:
            sincronizado.aviso ||
            "La cantidad solicitada no está disponible.",
        };
      }

      return {
        persistir: true,
        items: sincronizado.items.map((item) =>
          item.id === productoActual.id
            ? { ...productoActual, cantidad: nuevaCantidad }
            : item
        ),
        aviso: "Cantidad actualizada.",
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

    // Carrito armado como invitado: se lee ANTES de guardar la sesión.
    const carritoInvitado = leerCarritoInvitado();

    localStorage.setItem("usuarioActivo", JSON.stringify(sesion));
    setUsuarioActivo(sesion);

    // Si el usuario no tenía nada en su carrito, se lleva lo que agregó como invitado
    // (así no pierde su compra al iniciar sesión en el checkout).
    const carritoUsuario = leerCarrito(sesion);

    if (carritoUsuario.items.length === 0 && carritoInvitado.items.length > 0) {
      setEstadoCarrito(carritoInvitado);
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
  }, []);

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
              avisoCatalogo={
                <>
                  {cargandoCatalogo && <p role="status">Cargando catálogo...</p>}
                  {errorCatalogo && <Alert variant="danger">{errorCatalogo} <Button onClick={actualizarCatalogo}>Reintentar</Button></Alert>}
                  {carritoVerificado.aviso && <Alert variant="warning">{carritoVerificado.aviso}</Alert>}
                </>
              }
              ocultarContenido={(!catalogoListo || Boolean(errorCatalogo)) && (/^\/(productos|categorias|ofertas)(\/|$)/.test(ubicacion.pathname) || ubicacion.pathname === "/") }
            />
          }
        >
          <Route index element={<Home productos={productos} />} />

          <Route
            path="productos"
            element={
              <ProductList
                productos={productos}
                categoriasAPI={categorias}
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
                categoriasAPI={categorias}
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
              carritoBloqueado ? <Alert variant="warning">Es necesario cargar el catálogo y verificar los productos y cantidades del carrito antes de continuar. <Link to="/carrito">Revisar carrito</Link> <Button onClick={actualizarCatalogo}>Reintentar</Button></Alert> : <Checkout
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
                productos={productos}
                categoriasAPI={categorias}
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
                categoriasAPI={categorias}
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
                categoriasAPI={categorias}
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
