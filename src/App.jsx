import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Layout from "./components/Layout";
import productos from "./data/productos";

import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import CartPanel from "./components/CartPanel";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Registro from './pages/Registro'


function App() {
  // Recupera el carrito guardado al iniciar la aplicación.
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Guarda el carrito cada vez que cambia.
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  function agregarProducto(producto, cantidad = 1) {
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

  // Elimina el producto identificado por su id.
  function eliminarProducto(idAEliminar) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== idAEliminar),
    );
  }

  // Suma las unidades de todos los productos.
  const cantidadTotal = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  // Actualiza el título de la pestaña cuando cambia la cantidad.
  useEffect(() => {
    document.title = `(${cantidadTotal}) Pastelería 1000 Sabores`;
  }, [cantidadTotal]);

  // Cambia la cantidad respetando el stock del catálogo.
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

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              cantidad={cantidadTotal}
              onVerCarrito={() => setMostrarCarrito(true)}
            />
          }
        >
          <Route index element={<Home />} />

          <Route
            path="productos"
            element={
              <ProductList productos={productos} onAgregar={agregarProducto} />
            }
          />

          <Route
            path="productos/:id"
            element={
              <ProductDetail onAgregar={agregarProducto} carrito={carrito} />
            }
          />

          <Route
            path="carrito"
            element={
              <Cart
                carrito={carrito}
                onVaciar={vaciarCarrito}
                onEliminar={eliminarProducto}
                onCambiarCantidad={cambiarCantidad}
              />
            }
          />

          <Route path="checkout" element={<Checkout carrito={carrito} />} />

          <Route path="nosotros" element={<Nosotros />} />

          <Route path="contacto" element={<Contacto />} />

          <Route path="registro" element={<Registro />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <CartPanel
        mostrar={mostrarCarrito}
        onCerrar={() => setMostrarCarrito(false)}
        carrito={carrito}
        onVaciar={vaciarCarrito}
        onEliminar={eliminarProducto}
        onCambiarCantidad={cambiarCantidad}
      />
    </>
  );
}

export default App;
