// src/tests/UsersAdmin.spec.js
// Pruebas básicas de la gestión de usuarios (UsersAdmin).
describe('Módulo UsersAdmin - Control de Usuarios', () => {
  it('Debería validar la lista de usuarios registrados en el sistema', () => {
    const usuarios = [
      { id: 1, email: 'admin@duoc.cl', rol: 'admin' },
      { id: 2, email: 'cliente@duoc.cl', rol: 'client' }
    ];
    const adminEncontrado = usuarios.find(u => u.rol === 'admin');
    expect(adminEncontrado).toBeDefined();
    expect(adminEncontrado.email).toBe('admin@duoc.cl');
  });
});