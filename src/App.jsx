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

function leerCarrito(catalogo) {
  try {
    const guardado = JSON.parse(
      localStorage.getItem("carrito") || "[]"
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

function App() {
  const ubicacion = useLocation();

  const [productos, setProductos] = useState(() => obtenerProductos());

  const [estadoCarrito, setEstadoCarrito] = useState(() =>
    leerCarrito(productos)
  );

  const carrito = estadoCarrito.items;

  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("usuarioActivo") || "null"
      );
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

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
  // localStorage es un sistema externo a React: el efecto lo vuelve a leer
  // cuando cambia la ruta, por eso aquí sí se actualiza el estado.
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
            : sincronizado.aviso || actual.aviso,
      };
    });
  }

  function vaciarCarrito() {
    setEstadoCarrito({
      items: [],
      aviso: "",
    });
  }

  function eliminarProducto(idAEliminar) {
    setEstadoCarrito((actual) => ({
      items: actual.items.filter(
        (item) => item.id !== idAEliminar
      ),
      aviso: actual.aviso,
    }));
  }

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
  }

  function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    setUsuarioActivo(null);
  }

  const descuentoUsuario = obtenerDescuentoUsuario(usuarioActivo);

  const cantidadTotal = carrito.reduce(
    (suma, item) => suma + item.cantidad,
    0
  );

  useEffect(() => {
    document.title = `(${cantidadTotal}) Pastelería 1000 Sabores`;
  }, [cantidadTotal]);

  const esAdministracion =
    ubicacion.pathname === "/admin" ||
    ubicacion.pathname.startsWith("/admin/");

  return (
    <>
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
        </Route>

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <CartPanel
        mostrar={mostrarCarrito}
        onCerrar={() => setMostrarCarrito(false)}
        carrito={carrito}
        descuento={descuentoUsuario}
        onVaciar={vaciarCarrito}
        onEliminar={eliminarProducto}
        onCambiarCantidad={cambiarCantidad}
      />

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
          role="status"
          aria-live="polite"
          style={{ width: "100%" }}
        >
          <Toast.Header>
            <strong className="me-auto">Carrito actualizado</strong>
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