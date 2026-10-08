import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import { useState, useEffect } from "react";
import Cart from "./components/Cart";
import productos from "./data/productos";
import { Routes, Route } from 'react-router-dom';
import NotFound from "./components/NotFound";
import ProductDetail from "./components/ProductDetail";
import Home from "./components/Home";
import Navigation from "./components/Navigation";

function App() {
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");

    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  function agregarProducto(producto) {
    setCarrito((carritoActual) => [...carritoActual, producto]);
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  function eliminarProducto(indiceAEliminar) {
    setCarrito((carritoActual) =>
      carritoActual.filter((producto, indice) => indice !== indiceAEliminar),
    );
  }

  return (
    <div>
      <Header />

      <Navigation cantidad={carrito.length} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/productos"
            element={
              <ProductList productos={productos} onAgregar={agregarProducto} />
            }
          />

          <Route
            path="/carrito"
            element={
              <Cart
                carrito={carrito}
                onVaciar={vaciarCarrito}
                onEliminar={eliminarProducto}
              />
            }
          />

          <Route
            path="/productos/:id"
            element={<ProductDetail onAgregar={agregarProducto} />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
