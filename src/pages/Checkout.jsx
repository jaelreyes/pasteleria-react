import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionesYComunas } from '../data/regiones-comunas';
import { crearOrden, obtenerUsuarioActivo } from '../data/db';

export const Checkout = ({ carrito = [], limpiarCarrito }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    region: '',
    comuna: '',
    direccion: '',
    metodoPago: 'credito'
  });
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [error, setError] = useState('');

  // Autocompletar con usuario en sesion si existe
  useEffect(() => {
    const usuario = obtenerUsuarioActivo();
    if (usuario) {
      setFormData(prev => ({
        ...prev,
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || ''
      }));
    }
  }, []);

  const handleRegionChange = (e) => {
    const regionNombre = e.target.value;
    const regionEncontrada = regionesYComunas.find(r => r.nombre === regionNombre);
    setFormData(prev => ({ ...prev, region: regionNombre, comuna: '' }));
    setComunasDisponibles(regionEncontrada ? regionEncontrada.comunas : []);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.region || !formData.comuna || !formData.direccion) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const total = carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
      const nuevaOrden = crearOrden({
        cliente: { ...formData },
        items: carrito,
        total
      });

      if (limpiarCarrito) {
        limpiarCarrito();
      }
      localStorage.removeItem('carrito');
      navigate(`/pago/exito/${nuevaOrden.id}`);
    } catch (err) {
      navigate('/pago/error');
    }
  };

  return (
    <div className="container mt-4 checkout-view" style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h2>Finalizar Compra</h2>
      {error && <div className="alert alert-danger" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Nombre Completo *</label>
          <input
            type="text"
            name="nombre"
            className="form-control"
            value={formData.nombre}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Correo Electrónico *</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <label>Región *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleRegionChange}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Seleccione región...</option>
              {regionesYComunas.map((reg) => (
                <option key={reg.nombre} value={reg.nombre}>{reg.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Comuna *</label>
            <select
              name="comuna"
              value={formData.comuna}
              onChange={handleChange}
              disabled={!formData.region}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Seleccione comuna...</option>
              {comunasDisponibles.map((com) => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Dirección de Despacho *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Método de Pago</label>
          <select
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="credito">Tarjeta de Crédito / Débito</option>
            <option value="transferencia">Transferencia Bancaria</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '10px', background: '#e83e8c', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          Confirmar y Pagar
        </button>
      </form>
    </div>
  );
};

export default Checkout;