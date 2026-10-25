import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

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

function App() {
  // Lee el catálogo compartido con administración al iniciar.
  const [productos, setProductos] = useState(() => obtenerProductos());
  const ubicacion = useLocation();

  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  function agregarProducto(producto, cantidad = 1) {
    if (!Number.isInteger(cantidad) || cantidad < 1) return;

    const productoActual = obtenerProductos().find(
      (item) => item.id === producto.id,
    );

    if (!productoActual) return;

    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id === productoActual.id,
      );

      const cantidadActual = existe ? existe.cantidad : 0;
      const disponibles = Math.max(0, productoActual.stock - cantidadActual);

      const cantidadAgregar = Math.min(cantidad, disponibles);

      if (cantidadAgregar <= 0) return carritoActual;

      if (existe) {
        return carritoActual.map((item) =>
          item.id === productoActual.id
            ? {
                ...productoActual,
                cantidad: item.cantidad + cantidadAgregar,
              }
            : item,
        );
      }

      return [
        ...carritoActual,
        { ...productoActual, cantidad: cantidadAgregar },
      ];
    });
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  function eliminarProducto(idAEliminar) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== idAEliminar),
    );
  }

  function cambiarCantidad(id, nuevaCantidad) {
    const productoActual = obtenerProductos().find(
      (producto) => producto.id === id,
    );

    if (
      !productoActual ||
      !Number.isInteger(nuevaCantidad) ||
      nuevaCantidad < 1 ||
      nuevaCantidad > productoActual.stock
    ) {
      return;
    }

    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id === id ? { ...productoActual, cantidad: nuevaCantidad } : item,
      ),
    );
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

  const cantidadTotal = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  // Actualiza el título de la pestaña.
  useEffect(() => {
    document.title = `(${cantidadTotal}) Pastelería 1000 Sabores`;
  }, [cantidadTotal]);

  // Recupera los cambios del catálogo al navegar entre páginas.
  useEffect(() => {
    setProductos(obtenerProductos());
  }, [ubicacion.pathname]);

  return (
    <>
      <Routes>
        {/* Tienda pública */}
        <Route
          path="/"
          element={
            <Layout
              cantidad={cantidadTotal}
              onVerCarrito={() => setMostrarCarrito(true)}
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

          <Route path="pago/exito/:idOrden" element={<PagoExito />} />

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

        {/* Administración */}
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
    </>
  );
}

export default App;
