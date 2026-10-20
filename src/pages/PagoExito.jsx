import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerOrdenPorId } from '../data/db';

export const PagoExito = () => {
  const { idOrden } = useParams();
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    if (idOrden) {
      setOrden(obtenerOrdenPorId(idOrden));
    }
  }, [idOrden]);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#d4edda', color: '#28a745', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px' }}>
        ✓
      </div>
      <h2 style={{ color: '#28a745', marginBottom: '10px' }}>¡Pago Confirmado con Éxito!</h2>
      <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>Tu compra ha sido procesada correctamente.</p>
      {orden ? (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '6px', textAlign: 'left', margin: '25px 0', border: '1px solid #e9ecef' }}>
          <p style={{ margin: '6px 0' }}><strong>N° de Orden:</strong> {orden.id}</p>
          <p style={{ margin: '6px 0' }}><strong>Cliente:</strong> {orden.cliente?.nombre}</p>
          <p style={{ margin: '6px 0' }}><strong>Correo:</strong> {orden.cliente?.email}</p>
          <p style={{ margin: '6px 0' }}><strong>Dirección:</strong> {orden.cliente?.direccion}, {orden.cliente?.comuna}</p>
          <p style={{ margin: '6px 0' }}><strong>Total Pagado:</strong> ${orden.total?.toLocaleString('es-CL')}</p>
        </div>
      ) : (
        <p style={{ margin: '20px 0', fontWeight: 'bold' }}>Código de orden: {idOrden}</p>
      )}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <Link to="/" style={{ padding: '10px 20px', background: '#e83e8c', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Volver a la Tienda
        </Link>
      </div>
    </div>
  );
};

export default PagoExito;