import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrdersAdmin from '../admin/pages/OrdersAdmin';

describe('Permisos de consulta de ordenes', () => {
  let datos;
  beforeEach(() => {
    datos = { ordenes: JSON.stringify([
      { id: 'QA-1', nombre: 'Ana', estado: 'pendiente', total: 1500, productos: [] },
      { id: 'QA-2', nombre: 'Luis', estado: 'completado', total: 2000, productos: [] },
    ]) };
    spyOn(Storage.prototype, 'getItem').and.callFake(clave => datos[clave] ?? null);
    spyOn(Storage.prototype, 'setItem').and.callFake((clave, valor) => { datos[clave] = valor; });
    spyOn(window, 'open').and.returnValue(null);
  });
  afterEach(cleanup);
  function dibujar(props = {}) {
    render(<MemoryRouter><OrdersAdmin {...props} /></MemoryRouter>);
  }
  it('permite consultar, buscar, filtrar y abrir detalles sin escribir ni exportar', () => {
    dibujar();
    expect(screen.getAllByRole('link', { name: 'Ver boleta' })[0].getAttribute('href')).toBe('/admin/ordenes/QA-1');
    expect(screen.queryByRole('button', { name: /Exportar/ })).toBeNull();
    expect(screen.queryByRole('combobox', { name: /Cambiar estado/ })).toBeNull();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Ana' } });
    expect(screen.queryByText('Luis')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'completado' } });
    expect(screen.queryByText('Ana')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });
  it('ADMIN conserva el cambio de estado', () => {
    dibujar({ puedeModificar: true, puedeExportar: true });
    fireEvent.change(screen.getAllByRole('combobox', { name: 'Cambiar estado de la orden QA-1' })[0], { target: { value: 'procesando' } });
    expect(JSON.parse(datos.ordenes)[0].estado).toBe('procesando');
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeTruthy();
  });
  it('ADMIN conserva la exportacion CSV y PDF', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:qa');
    spyOn(URL, 'revokeObjectURL').and.stub();
    spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    dibujar({ puedeModificar: true, puedeExportar: true });
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }));
    expect(window.open).toHaveBeenCalled();
  });
});
