import React, { useState, useEffect } from 'react';
import { obtenerProductos, guardarProducto, eliminarProducto, obtenerCategorias } from '../../data/db';

export const ProductsAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ id: '', nombre: '', precio: '', stock: '', categoria: '', descuento: 0 });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [soloCriticos, setSoloCriticos] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setProductos(obtenerProductos());
    setCategorias(obtenerCategorias());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.stock) return;

    guardarProducto({
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      descuento: Number(form.descuento || 0)
    });

    setForm({ id: '', nombre: '', precio: '', stock: '', categoria: '', descuento: 0 });
    setModoEdicion(false);
    cargarDatos();
  };

  const handleEditar = (p) => {
    setForm(p);
    setModoEdicion(true);
  };

  const handleEliminar = (id) => {
    eliminarProducto(id);
    cargarDatos();
  };

  // Filtrar stock crítico (ej: stock menor a 5)
  const productosMostrados = soloCriticos ? productos.filter(p => p.stock < 5) : productos;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#5c3d2e' }}>Gestión de Productos</h2>

      {/* Formulario */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h4>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h4>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} style={{ padding: '8px' }} required />
          <input type="number" name="precio" placeholder="Precio ($)" value={form.precio} onChange={handleChange} style={{ padding: '8px' }} required />
          <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} style={{ padding: '8px' }} required />
          <input type="number" name="descuento" placeholder="Descuento (%)" value={form.descuento} onChange={handleChange} style={{ padding: '8px' }} />
          <select name="categoria" value={form.categoria} onChange={handleChange} style={{ padding: '8px' }}>
            <option value="">Seleccione Categoría</option>
            {categorias.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
          <button type="submit" style={{ padding: '8px 15px', background: '#8d5524', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {modoEdicion ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </div>

      {/* Filtro Críticos */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setSoloCriticos(!soloCriticos)} 
          style={{ padding: '8px 15px', background: soloCriticos ? '#dc3545' : '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {soloCriticos ? 'Ver Todos los Productos' : '⚠️ Ver Listado de Stock Crítico'}
        </button>
      </div>

      {/* Tabla de Productos */}
      <div style={{ background: '#fff', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }} border="1" cellPadding="10">
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th>Nombre</th><th>Precio</th><th>Stock</th><th>Descuento</th><th>Categoría</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosMostrados.map(p => (
              <tr key={p.id}>
                <td><strong>{p.nombre}</strong></td>
                <td>${p.precio?.toLocaleString('es-CL')}</td>
                <td style={{ color: p.stock < 5 ? 'red' : 'inherit', fontWeight: p.stock < 5 ? 'bold' : 'normal' }}>
                  {p.stock} {p.stock < 5 && '(Crítico)'}
                </td>
                <td>{p.descuento}%</td>
                <td>{p.categoria}</td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleEditar(p)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleEliminar(p.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsAdmin;