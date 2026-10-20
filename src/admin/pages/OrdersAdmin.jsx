import React, { useState, useEffect } from 'react';
import { obtenerOrdenes } from '../../data/db';

export const OrdersAdmin = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    setOrdenes(obtenerOrdenes());
  }, []);

  return (
    <div style={{ padding: '25px' }}>
      <h2 style={{ marginBottom: '20px' }}>Gestión de Órdenes y Boletas</h2>
      {ordenes.length === 0 ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', textAlign: 'center', color: '#6c757d' }}>
          No hay órdenes registradas aún.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: ordenSeleccionada ? '1fr 380px' : '1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="10">
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th>ID Orden</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.id}</strong></td>
                    <td>{new Date(o.fecha).toLocaleDateString('es-CL')}</td>
                    <td>{o.cliente?.nombre || 'Cliente'}</td>
                    <td>${o.total?.toLocaleString('es-CL')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setOrdenSeleccionada(o)}
                        style={{ padding: '6px 12px', background: '#e83e8c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Ver Boleta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ordenSeleccionada && (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px dashed #6c757d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, color: '#e83e8c' }}>Boleta Electrónica</h3>
                <button onClick={() => setOrdenSeleccionada(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
              </div>
              <hr />
              <p><strong>Folio:</strong> {ordenSeleccionada.id}</p>
              <p><strong>Cliente:</strong> {ordenSeleccionada.cliente?.nombre}</p>
              <p><strong>Dirección:</strong> {ordenSeleccionada.cliente?.direccion}, {ordenSeleccionada.cliente?.comuna}</p>
              <h4>Productos:</h4>
              <ul>
                {(ordenSeleccionada.items || []).map((it, idx) => (
                  <li key={idx}>{it.cantidad}x {it.nombre} — ${(it.precio * it.cantidad).toLocaleString('es-CL')}</li>
                ))}
              </ul>
              <hr />
              <h4>Total: ${ordenSeleccionada.total?.toLocaleString('es-CL')}</h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;