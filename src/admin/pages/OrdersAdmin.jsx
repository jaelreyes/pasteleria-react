import React, { useState, useEffect } from 'react';
import { obtenerOrdenes } from '../../data/db';

export const OrdersAdmin = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    setOrdenes(obtenerOrdenes());
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Administración de Órdenes</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} border="1" cellPadding="10">
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th>N° Orden</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Comuna</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '15px', color: '#6c757d' }}>
                No hay órdenes registradas aún en el sistema.
              </td>
            </tr>
          ) : (
            ordenes.map((orden) => (
              <tr key={orden.id}>
                <td><strong>{orden.id}</strong></td>
                <td>{orden.cliente?.nombre || 'Sin nombre'}</td>
                <td>{orden.cliente?.email || 'Sin correo'}</td>
                <td>{orden.cliente?.comuna || 'N/A'}</td>
                <td>${orden.total?.toLocaleString('es-CL')}</td>
                <td>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#d4edda', color: '#155724', fontSize: '0.85rem' }}>
                    {orden.estado || 'Completada'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setOrdenSeleccionada(orden)}
                    style={{ padding: '6px 12px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Ver Boleta
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {ordenSeleccionada && (
        <div style={{ marginTop: '30px', padding: '25px', background: '#fff', border: '2px dashed #495057', borderRadius: '8px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#e83e8c' }}>Pastelería Mil Sabores</h3>
            <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>BOLETA ELECTRÓNICA</span>
          </div>

          <div style={{ margin: '15px 0', fontSize: '0.95rem' }}>
            <p style={{ margin: '4px 0' }}><strong>N° de Orden:</strong> {ordenSeleccionada.id}</p>
            <p style={{ margin: '4px 0' }}><strong>Fecha:</strong> {new Date(ordenSeleccionada.fecha).toLocaleString('es-CL')}</p>
            <p style={{ margin: '4px 0' }}><strong>Cliente:</strong> {ordenSeleccionada.cliente?.nombre}</p>
            <p style={{ margin: '4px 0' }}><strong>Contacto:</strong> {ordenSeleccionada.cliente?.email} | {ordenSeleccionada.cliente?.telefono || 'Sin teléfono'}</p>
            <p style={{ margin: '4px 0' }}><strong>Dirección:</strong> {ordenSeleccionada.cliente?.direccion}, {ordenSeleccionada.cliente?.comuna}, {ordenSeleccionada.cliente?.region}</p>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

          <h4 style={{ margin: '10px 0' }}>Detalle de Productos:</h4>
          <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
            {ordenSeleccionada.items?.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                {item.nombre} — {item.cantidad || 1} un. x ${(item.precio || 0).toLocaleString('es-CL')} = <strong>${((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-CL')}</strong>
              </li>
            ))}
          </ul>

          <div style={{ borderTop: '2px solid #333', paddingTop: '10px', marginTop: '15px', textAlign: 'right' }}>
            <h3 style={{ margin: 0 }}>Total Pagado: ${ordenSeleccionada.total?.toLocaleString('es-CL')}</h3>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Imprimir Boleta
            </button>
            <button
              onClick={() => setOrdenSeleccionada(null)}
              style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;