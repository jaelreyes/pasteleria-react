import React, { useState, useEffect } from 'react';
import { obtenerUsuarios, guardarUsuario, obtenerOrdenesPorUsuario } from '../../data/db';
import { validarCorreo } from '../../utils/validaciones';

export const UsersAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', rol: 'cliente' });
  const [errorEmail, setErrorEmail] = useState('');
  const [usuarioHistorial, setUsuarioHistorial] = useState(null);
  const [compras, setCompras] = useState([]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    const existentes = obtenerUsuarios();
    if (existentes.length === 0) {
      const demo = [
        { nombre: 'Administrador Demo', email: 'admin@duoc.cl', rol: 'admin' },
        { nombre: 'Vendedor Demo', email: 'vendedor@duoc.cl', rol: 'vendedor' },
        { nombre: 'Cliente Demo', email: 'cliente@gmail.com', rol: 'cliente' }
      ];
      demo.forEach(u => guardarUsuario(u));
      setUsuarios(demo);
    } else {
      setUsuarios(existentes);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'email' && !modoEdicion) {
      setErrorEmail(validarCorreo && !validarCorreo(value) ? 'Correo inválido o dominio no permitido' : '');
    }
  };

  const handleGuardarUsuario = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || (!modoEdicion && errorEmail)) return;

    guardarUsuario(form);
    setUsuarios(obtenerUsuarios());
    setForm({ nombre: '', email: '', rol: 'cliente' });
    setModoEdicion(false);
    setErrorEmail('');
  };

  const handleEditar = (usuario) => {
    setForm(usuario);
    setModoEdicion(true);
    setErrorEmail('');
  };

  const handleCancelarEdicion = () => {
    setForm({ nombre: '', email: '', rol: 'cliente' });
    setModoEdicion(false);
    setErrorEmail('');
  };

  const handleVerHistorial = (usuario) => {
    setUsuarioHistorial(usuario);
    setCompras(obtenerOrdenesPorUsuario(usuario.email));
  };

  // Filtrar usuarios según la barra de búsqueda
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '20px', color: '#5c3d2e' }}>Gestión de Usuarios</h2>

      {/* Formulario de Crear / Actualizar */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h4 style={{ marginTop: 0, color: '#333', marginBottom: '15px' }}>
          {modoEdicion ? `Actualizar Usuario: ${form.email}` : 'Crear Nuevo Usuario'}
        </h4>
        <form onSubmit={handleGuardarUsuario} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="email"
            name="email"
            placeholder="correo@duoc.cl"
            value={form.email}
            onChange={handleChange}
            disabled={modoEdicion} // El correo no se cambia para mantener la llave de búsqueda
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', width: '100%', boxSizing: 'border-box', background: modoEdicion ? '#e9ecef' : '#fff' }}
          />
          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', width: '100%', boxSizing: 'border-box', background: '#fff' }}
          >
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', background: '#8d5524', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}
            >
              {modoEdicion ? 'Actualizar' : 'Guardar'}
            </button>
            {modoEdicion && (
              <button
                type="button"
                onClick={handleCancelarEdicion}
                style={{ padding: '10px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
        {errorEmail && <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '8px' }}>{errorEmail}</div>}
      </div>

      {/* Barra de Búsqueda */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar usuario por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontSize: '1rem', background: '#fff' }}
        />
      </div>

      {/* Tabla Responsiva */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }} border="1" cellPadding="12">
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                  No se encontraron usuarios coincidentes.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u, i) => (
                <tr key={i}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      background: u.rol === 'admin' ? '#cce5ff' : '#e2e3e5',
                      color: u.rol === 'admin' ? '#004085' : '#383d41'
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEditar(u)}
                      style={{ padding: '6px 12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleVerHistorial(u)}
                      style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Historial
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Historial de Compras */}
      {usuarioHistorial && (
        <div style={{ marginTop: '25px', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Historial de compras: {usuarioHistorial.nombre} ({usuarioHistorial.email})</h4>
            <button
              onClick={() => setUsuarioHistorial(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6c757d' }}
            >
              ✕
            </button>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />
          {compras.length === 0 ? (
            <p style={{ color: '#6c757d', margin: 0 }}>Este usuario no registra compras asociadas en el sistema.</p>
          ) : (
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {compras.map(c => (
                <li key={c.id} style={{ marginBottom: '8px' }}>
                  <strong>{c.id}</strong> — {new Date(c.fecha).toLocaleDateString('es-CL')} — 
                  Total: <strong>${c.total?.toLocaleString('es-CL')}</strong> ({c.estado})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;