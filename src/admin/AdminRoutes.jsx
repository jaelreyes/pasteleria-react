import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import OrdersAdmin from './pages/OrdersAdmin';
import UsersAdmin from './pages/UsersAdmin';
import AdminProfile from './pages/AdminProfile';

export const AdminRoutes = () => {
  const location = useLocation();

  const getEstiloEnlace = (ruta) => ({
    display: 'inline-block',
    padding: '8px 14px',
    color: location.pathname.includes(ruta) ? '#fff' : '#5c3d2e',
    textDecoration: 'none',
    borderRadius: '20px',
    background: location.pathname.includes(ruta) ? '#8d5524' : 'transparent',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '85vh', 
      background: '#fdfbf7' 
    }}>
      {/* Barra superior estilo Pastelería */}
      <aside style={{ 
        width: '100%', 
        background: '#fff8ec', 
        padding: '15px 25px', 
        color: '#5c3d2e',
        boxSizing: 'border-box',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '2px solid #f0e6d2',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ color: '#8d5524', margin: 0, fontSize: '1.3rem', fontFamily: 'serif' }}>
          🍰 Panel Admin
        </h3>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Link to="/admin/ordenes" style={getEstiloEnlace('ordenes')}>
            📋 Órdenes
          </Link>
          <Link to="/admin/usuarios" style={getEstiloEnlace('usuarios')}>
            👥 Usuarios
          </Link>
          <Link to="/admin/perfil" style={getEstiloEnlace('perfil')}>
            👤 Perfil
          </Link>
          <Link to="/" style={{ color: '#8d5524', textDecoration: 'none', padding: '8px 12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            ← Volver a la Tienda
          </Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, padding: '20px', boxSizing: 'border-box', overflowX: 'auto' }}>
        <Routes>
          <Route path="ordenes" element={<OrdersAdmin />} />
          <Route path="usuarios" element={<UsersAdmin />} />
          <Route path="perfil" element={<AdminProfile />} />
          <Route path="*" element={<OrdersAdmin />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminRoutes;