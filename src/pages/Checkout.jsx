import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import REGIONES_COMUNAS from '../data/regiones-comunas';
import { crearOrden, obtenerUsuarioActivo } from '../data/db';

export const Checkout = ({ carrito = [], descuento = 0, onCompraConfirmada }) => {
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

  // Autocompletar con usuario en sesión si existe
  useEffect(() => {
    const usuario = obtenerUsuarioActivo();
    if (usuario) {
      setFormData(prev => ({
        ...prev,
        nombre: usuario.nombre ? `${usuario.nombre} ${usuario.apellidos || ''}`.trim() : '',
        email: usuario.correo || usuario.email || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || ''
      }));
    }
  }, []);

  const handleRegionChange = (e) => {
    const regionSeleccionada = e.target.value;
    const regionObj = REGIONES_COMUNAS.find(r => r.region === regionSeleccionada);
    setFormData(prev => ({ ...prev, region: regionSeleccionada, comuna: '' }));
    setComunasDisponibles(regionObj ? regionObj.comunas : []);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.region || !formData.comuna || !formData.direccion) {
      setError('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    try {
      const subtotal = carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
      const montoDescuento = subtotal * (descuento / 100);
      const total = Math.max(0, subtotal - montoDescuento);

      const nuevaOrden = crearOrden({
        cliente: { ...formData },
        items: carrito,
        subtotal,
        descuento,
        total
      });

      if (onCompraConfirmada) {
        onCompraConfirmada();
      }
      localStorage.removeItem('carrito');
      navigate(`/pago/exito/${nuevaOrden.id}`);
    } catch (err) {
      navigate('/pago/error');
    }
  };

  return (
    <div className="container mt-4 checkout-view" style={{ maxWidth: '750px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Finalizar Compra</h2>
      {error && <div style={{ padding: '10px 15px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Región *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleRegionChange}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            >
              <option value="">Seleccione región...</option>
              {REGIONES_COMUNAS.map((reg) => (
                <option key={reg.region} value={reg.region}>{reg.region}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comuna *</label>
            <select
              name="comuna"
              value={formData.comuna}
              onChange={handleChange}
              disabled={!formData.region}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            >
              <option value="">Seleccione comuna...</option>
              {comunasDisponibles.map((com) => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dirección de Despacho *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Método de Pago</label>
          <select
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          >
            <option value="credito">Tarjeta de Débito / Crédito (Webpay)</option>
            <option value="transferencia">Transferencia Bancaria</option>
          </select>
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '12px', background: '#e83e8c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Pagar y Confirmar Pedido
        </button>
      </form>
    </div>
  );
};

export default Checkout;