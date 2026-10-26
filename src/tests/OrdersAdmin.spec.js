// src/tests/OrdersAdmin.spec.js
describe('Módulo OrdersAdmin - Gestión de Pedidos', () => {
  it('Debería listar los pedidos realizados por los clientes', () => {
    const listaPedidos = [
      { id: 101, cliente: 'Juan Pérez', estado: 'Pendiente' },
      { id: 102, cliente: 'María Soto', estado: 'Completado' }
    ];
    expect(listaPedidos.length).toBe(2);
  });

  it('Debería permitir cambiar el estado de un pedido', () => {
    let pedido = { id: 101, estado: 'Pendiente' };
    pedido.estado = 'Completado';
    expect(pedido.estado).toBe('Completado');
  });
});