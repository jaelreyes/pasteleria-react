import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout y componentes globales
import Header from './components/Header';
import Footer from './components/Footer';

// Vistas públicas existentes
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ProductDetail from './pages/ProductDetail';
import Blogs from './pages/Blogs';
import BlogDetalle from './pages/BlogDetalle';
import Contacto from './pages/Contacto';
import Nosotros from './pages/Nosotros';
import NotFound from './pages/NotFound';

// Vistas del flujo de Compra (Persona 3)
import Checkout from './pages/Checkout';
import PagoExito from './pages/PagoExito';
import PagoFallo from './pages/PagoFallo';

// Módulo de Administración (Persona 3)
import AdminRoutes from './admin/AdminRoutes';

export function App() {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  return (
    <Router>
      <Header carrito={carrito} />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/producto/:id" element={<ProductDetail setCarrito={setCarrito} />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetalle />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />

        {/* Flujo de Compra y Pagos (Persona 3) */}
        <Route 
          path="/checkout" 
          element={<Checkout carrito={carrito} limpiarCarrito={limpiarCarrito} />} 
        />
        <Route path="/pago/exito/:idOrden" element={<PagoExito />} />
        <Route path="/pago/error" element={<PagoFallo />} />

        {/* Módulo Admin Modular (Persona 3) */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;