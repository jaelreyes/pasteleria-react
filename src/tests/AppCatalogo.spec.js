import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import api from '../services/api';

describe('Carga remota del catálogo en App', () => {
  let almacenamiento;
  const anterior = [{ id: 1, codigo: 'TC001', nombre: 'Torta guardada', cantidad: 2, precio: 100, stock: 4 }];
  const remoto = { id: 81, codigo: 'TC001', nombre: 'Torta remota', precio: 200, descuento: 10, stock: 4,
    categoria: { id: 3, nombre: 'Tortas' }, imagenUrl: '/images/productos/TC001.jpg' };

  beforeEach(() => {
    almacenamiento = { carrito_invitado: JSON.stringify(anterior), productos: 'datos locales intactos' };
    spyOn(Storage.prototype, 'getItem').and.callFake(clave => almacenamiento[clave] ?? null);
    spyOn(Storage.prototype, 'setItem').and.callFake((clave, valor) => { almacenamiento[clave] = valor; });
    spyOn(Storage.prototype, 'removeItem').and.callFake(clave => { delete almacenamiento[clave]; });
  });
  afterEach(cleanup);

  it('conserva el carrito durante carga, fallo de red, reintento y cambio verificado de ID', async () => {
    let rechazar;
    spyOn(api, 'get').and.callFake(ruta => ruta === '/categorias'
      ? Promise.resolve({ data: [{ id: 3, nombre: 'Tortas' }] })
      : new Promise((_resolve, reject) => { rechazar = reject; }));
    render(<MemoryRouter initialEntries={['/productos']}><App /></MemoryRouter>);
    expect(screen.getByText('Cargando catálogo...')).toBeTruthy();
    expect(almacenamiento.carrito_invitado).toBe(JSON.stringify(anterior));
    rechazar(new Error('sin red'));
    await screen.findByText(/No se pudo actualizar el catálogo/);
    expect(almacenamiento.carrito_invitado).toBe(JSON.stringify(anterior));

    api.get.and.callFake(ruta => Promise.resolve({ data: ruta === '/productos' ? [remoto] : [{ id: 3, nombre: 'Tortas' }] }));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await screen.findByText('Torta remota');
    expect(almacenamiento.carrito_invitado).toBe(JSON.stringify(anterior));
    expect(almacenamiento.productos).toBe('datos locales intactos');
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it('permite corregir la cantidad usando el nuevo ID sin perder el ítem', async () => {
    spyOn(api, 'get').and.callFake(ruta => Promise.resolve({ data: ruta === '/productos'
      ? [{ ...remoto, stock: 1 }] : [{ id: 3, nombre: 'Tortas' }] }));
    render(<MemoryRouter initialEntries={['/carrito']}><App /></MemoryRouter>);
    await screen.findByText(/Conservamos tu carrito/);
    expect(screen.queryByText('Cargando catálogo...')).toBeNull();
    expect(almacenamiento.carrito_invitado).toBe(JSON.stringify(anterior));
    expect(screen.getByText(/Conservamos tu carrito/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir cantidad de Torta remota' }));
    expect(JSON.parse(almacenamiento.carrito_invitado)[0]).toEqual(
      jasmine.objectContaining({ id: 81, codigo: 'TC001', cantidad: 1 })
    );
    expect(screen.queryByText(/Conservamos tu carrito/)).toBeNull();
  });

  it('refresca tras una baja administrativa sin modificar el carrito guardado', async () => {
    const sesion = { correo: 'admin@duoc.cl', rol: 'admin', nombre: 'Admin' };
    almacenamiento.usuarioActivo = JSON.stringify(sesion);
    almacenamiento.refreshToken = `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;
    almacenamiento['carrito_admin@duoc.cl'] = JSON.stringify(anterior);
    let activo = true;
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(api, 'get').and.callFake(ruta => Promise.resolve({ data:
      ruta === '/categorias' ? [{ id: 3, nombre: 'Tortas' }] :
      ruta === '/productos/admin' ? [{ ...remoto, activo }] : activo ? [remoto] : [] }));
    spyOn(api, 'delete').and.callFake(() => { activo = false; return Promise.resolve({}); });
    render(<MemoryRouter initialEntries={['/admin/productos']}><App /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar', exact: true }));
    await screen.findByText('Inactivo');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(api.get.calls.allArgs().filter(([ruta]) => ruta === '/productos').length).toBeGreaterThan(1);
    expect(almacenamiento['carrito_admin@duoc.cl']).toBe(JSON.stringify(anterior));
    expect(Storage.prototype.setItem.calls.allArgs().some(([clave]) => clave.startsWith('carrito_'))).toBe(false);
  });
});
