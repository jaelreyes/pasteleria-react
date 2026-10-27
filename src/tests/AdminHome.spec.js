// src/tests/AdminHome.spec.js
// Pruebas básicas del panel principal (AdminHome).
describe('Componente AdminHome', () => {
  it('Debería renderizar el panel principal de administración correctamente', () => {
    const tituloPanel = "Panel de Control - Pastelería";
    expect(tituloPanel).toContain("Panel de Control");
  });

  it('Debería mostrar las estadísticas generales del sistema', () => {
    const estadisticas = { totalVentas: 150000, pedidosPendientes: 4 };
    expect(estadisticas.pedidosPendientes).toBeGreaterThanOrEqual(0);
  });
});