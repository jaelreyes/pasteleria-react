import React from 'react';
import { obtenerUsuarioActivo } from '../../data/db';

export const AdminProfile = () => {
  const admin = obtenerUsuarioActivo() || {
    nombre: 'Administrador Pastelería',
    email: 'admin@duoc.cl',
    rol: 'admin'
  };

  return (
    <div style={{ padding: '25px', maxWidth: '600px' }}>
      <h2>Mi Perfil de Administrador</h2>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 5px' }}>{admin.nombre}</h3>
        <p style={{ color: '#6c757d', margin: '0 0 15px' }}>{admin.email || admin.correo}</p>
        <hr />
        <p><strong>Rol:</strong> {admin.rol || admin.tipo || 'Administrador'}</p>
        <p><strong>Permisos:</strong> Control de órdenes, boletas y usuarios.</p>
      </div>
    </div>
  );
};

export default AdminProfile;