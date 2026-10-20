import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { obtenerUsuarioActivo, guardarOrden } from '../data/db';

export default function Checkout() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState(() => {
    const usuario = obtenerUsuarioActivo();
    return {
      nombre: usuario ? `${usuario.nombre} ${usuario.apellidos || ''}`.trim() : '',
      email: usuario ? (usuario.correo || usuario.email || '') : '',
      telefono: '',
      direccion: '',
      region: '',
      comuna: '',
      metodoPago: 'webpay'
    };
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.direccion || !formData.telefono) {
      setError('Por favor completa todos los campos obligatorios de despacho.');
      return;
    }

    try {
      const nuevaOrden = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        ...formData,
        fecha: new Date().toISOString(),
        estado: 'completado',
        total: 25000
      };

      guardarOrden(nuevaOrden);
      navigate(`/pago-exito/${nuevaOrden.id}`);
    } catch {
      setError('Ocurrió un error al procesar la orden.');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4" style={{ color: '#5c3d2e' }}>Finalizar Compra</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit} className="p-4 bg-white shadow-sm rounded">
        <Form.Group className="mb-3">
          <Form.Label>Nombre y Apellidos</Form.Label>
          <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección de Despacho</Form.Label>
          <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100" style={{ background: '#8d5524', border: 'none' }}>
          Pagar y Confirmar Pedido
        </Button>
      </Form>
    </div>
  );
}