import ProductList from "./components/ProductList";
import { useState, useEffect } from "react";
import Cart from "./components/Cart";
import productos from "./data/productos";
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import Layout from "./components/Layout";

function App() {
  // Recupera el carrito guardado al iniciar la aplicación.
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");

    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });
  // Guarda el carrito en localStorage cada vez que cambia.
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // Agrega un producto nuevo o aumenta su cantidad si ya está en el carrito.
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

// Elimina del carrito el producto identificado por su id.
  function eliminarProducto(idAEliminar) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== idAEliminar),
    );
  }

  // Calcula la cantidad total de unidades, no la cantidad de filas.
  const cantidadTotal = carrito.reduce(
  (suma, item) => suma + item.cantidad,
  0
)

  return (
    <Routes>
      <Route path="/" element={<Layout cantidad={cantidadTotal} />}>
        <Route index element={<Home />} />

        <Route
          path="productos"
          element={
            <ProductList productos={productos} onAgregar={agregarProducto} />
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

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
