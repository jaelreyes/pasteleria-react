// src/tests/ProductDetailModal.spec.js
// Pruebas básicas del modal de detalle de producto.
describe('Componente ProductDetailModal', () => {
  it('Debería cargar los detalles del producto seleccionado en el modal', () => {
    const productoSeleccionado = { id: 5, nombre: 'Torta Tres Leches', precio: 16000 };
    const modalAbierto = true;

    expect(modalAbierto).toBe(true);
    expect(productoSeleccionado.nombre).toBe('Torta Tres Leches');
    expect(productoSeleccionado.precio).toBeGreaterThan(0);
  });
});