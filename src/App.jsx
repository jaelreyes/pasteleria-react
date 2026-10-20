import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";
import productos from "./data/productos";
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

// Módulos Persona 3
import PagoExito from "./pages/PagoExito";
import PagoFallo from "./pages/PagoFallo";
import AdminRoutes from "./admin/AdminRoutes";

function App() {
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
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return;
    }

    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id === producto.id);
      const cantidadActual = existe ? existe.cantidad : 0;
      const disponibles = Math.max(0, producto.stock - cantidadActual);
      const cantidadAgregar = Math.min(cantidad, disponibles);

      if (cantidadAgregar <= 0) {
        return carritoActual;
      }

      if (existe) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidadAgregar }
            : item,
        );
      }

      return [...carritoActual, { ...producto, cantidad: cantidadAgregar }];
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
    const producto = productos.find((producto) => producto.id === id);

    if (
      !producto ||
      !Number.isInteger(nuevaCantidad) ||
      nuevaCantidad < 1 ||
      nuevaCantidad > producto.stock
    ) {
      return;
    }

    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item,
      ),
    );
  }

  function iniciarSesion(usuario) {
    const sesion = {
      run: usuario.run,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
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

  useEffect(() => {
    document.title = `(${cantidadTotal}) Pastelería 1000 Sabores`;
  }, [cantidadTotal]);

  return (
    <>
      <Routes>
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
          <Route index element={<Home />} />
          <Route path="productos" element={<ProductList productos={productos} onAgregar={agregarProducto} />} />
          <Route path="productos/:id" element={<ProductDetail onAgregar={agregarProducto} carrito={carrito} />} />
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

          {/* Rutas Persona 3 */}
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
<<<<<<< HEAD
          
          <Route
            path="categorias"
            element={
              <Categorias productos={productos} onAgregar={agregarProducto} />
            }
          />

          <Route
            path="categorias/:slug"
            element={
              <Categorias productos={productos} onAgregar={agregarProducto} />
            }
          />

=======
>>>>>>> 446ec024459bfb17ac2622a36327f367dd0b322b
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogDetalle />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="registro" element={<Registro />} />
          <Route path="login" element={<Login onIniciarSesion={iniciarSesion} />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Panel Administrativo Modular (fuera del Layout de cliente) */}
        <Route path="/admin/*" element={<AdminRoutes />} />
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