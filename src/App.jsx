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
import CartPanel from './components/CartPanel'
import Nosotros from './pages/Nosotros'
import Contacto from './pages/Contacto'

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

  // Agrega un producto o aumenta su cantidad.
  function agregarProducto(producto) {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id === producto.id);

      if (existe) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...carritoActual, { ...producto, cantidad: 1 }];
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
            <ProductList
              productos={productos}
              onAgregar={agregarProducto}
            />
          }
        />

        <Route
          path="productos/:id"
          element={<ProductDetail onAgregar={agregarProducto} />}
        />

        <Route
          path="carrito"
          element={
            <Cart
              carrito={carrito}
              onVaciar={vaciarCarrito}
              onEliminar={eliminarProducto}
            />
          }
        />

        <Route
          path="checkout"
          element={<Checkout carrito={carrito} />}
        />

        <Route path="nosotros" element={<Nosotros />} />

        <Route path="contacto" element={<Contacto />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>

    <CartPanel
      mostrar={mostrarCarrito}
      onCerrar={() => setMostrarCarrito(false)}
      carrito={carrito}
      onVaciar={vaciarCarrito}
      onEliminar={eliminarProducto}
    />
  </>
);
}

export default App;
