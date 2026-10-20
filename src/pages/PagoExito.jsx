import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerOrdenPorId } from '../data/db';

export default function PagoExito() {
  const { idOrden } = useParams();
  const [orden] = useState(() => idOrden ? obtenerOrdenPorId(idOrden) : null);

  return (
    <div className="container text-center my-5" style={{ maxWidth: '600px' }}>
      <div className="p-5 bg-white shadow-sm rounded">
        <h1 className="text-success mb-3">¡Pago Exitoso! 🎉</h1>
        <p className="lead">Tu pedido ha sido procesado y registrado correctamente.</p>
        
        {orden && (
          <div className="my-4 p-3 bg-light rounded text-start">
            <p><strong>ID de Orden:</strong> {orden.id}</p>
            <p><strong>Nombre:</strong> {orden.nombre}</p>
            <p><strong>Dirección:</strong> {orden.direccion}</p>
            <p><strong>Total Pagado:</strong> ${orden.total?.toLocaleString('es-CL')}</p>
          </div>
        )}

        <Link to="/" className="btn btn-primary" style={{ background: '#8d5524', border: 'none' }}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}