import React from 'react';
import { Link } from 'react-router-dom';

export const PagoFallo = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#f8d7da', color: '#dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px' }}>
        ✕
      </div>
      <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Error al Procesar el Pago</h2>
      <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>No se pudo completar la transacción. Por favor intenta nuevamente.</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
        <Link to="/checkout" style={{ padding: '10px 20px', background: '#e83e8c', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Reintentar Pago
        </Link>
        <Link to="/" style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default PagoFallo;