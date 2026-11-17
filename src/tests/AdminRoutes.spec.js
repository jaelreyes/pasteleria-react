import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import AdminRoutes from '../admin/AdminRoutes';
import api from '../services/api';
import { puedeEntrarAlPanel, rutaInicioSegunRol } from '../utils/roles';

function Ubicacion() {
  return <output data-testid="ruta">{useLocation().pathname}</output>;
}

describe('Rutas administrativas por rol', () => {
  let usuario;
  beforeEach(() => {
    usuario = { nombre: 'QA', rol: 'VENDEDOR' };
    const ordenes = [{ id: 'QA-1', nombre: 'Ana', estado: 'pendiente', total: 1500, productos: [] }];
    const producto = { id: 17, codigo: 'QA', nombre: 'Torta QA', precio: 1500, stock: 5, activo: true, categoria: { id: 1, nombre: 'Tortas' } };
    spyOn(Storage.prototype, 'getItem').and.callFake(clave => {
      if (clave === 'usuarioActivo') return JSON.stringify(usuario);
      if (clave === 'ordenes') return JSON.stringify(ordenes);
      if (clave === 'productos' || clave === 'usuarios') return '[]';
      return null;
    });
    spyOn(Storage.prototype, 'setItem').and.stub();
    spyOn(api, 'get').and.callFake(ruta => Promise.resolve({ data: ruta === '/productos/admin' ? [producto] : [{ id: 1, nombre: 'Tortas' }] }));
    spyOn(api, 'post').and.stub();
    spyOn(api, 'put').and.stub();
    spyOn(api, 'delete').and.stub();
    spyOn(window, 'print').and.stub();
    spyOn(Element.prototype, 'scrollIntoView').and.stub();
  });
  afterEach(cleanup);
  function dibujar(ruta) {
    render(<MemoryRouter initialEntries={[ruta]}>
      <Ubicacion />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/" element={<p>Tienda</p>} />
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>);
  }
  for (const ruta of ['/admin', '/admin/perfil', '/admin/categorias', '/admin/reportes', '/admin/usuarios', '/admin/usuarios/nuevo', '/admin/usuarios/qa/historial', '/admin/productos/nuevo', '/admin/no-permitida']) {
    it(`VENDEDOR redirige ${ruta} a productos`, async () => {
      dibujar(ruta);
      await screen.findByText('Torta QA');
      expect(screen.getByTestId('ruta').textContent).toBe('/admin/productos');
      expect(api.post).not.toHaveBeenCalled();
      expect(api.put).not.toHaveBeenCalled();
      expect(api.delete).not.toHaveBeenCalled();
    });
  }
  it('VENDEDOR ve solo productos y órdenes como funciones del menú', async () => {
    dibujar('/admin/productos');
    await screen.findByText('Torta QA');
    const menu = within(screen.getByRole('navigation', { name: 'Menú de administración' }));
    expect(menu.getAllByRole('link').map(enlace => enlace.getAttribute('href'))).toEqual(['/admin/productos', '/admin/ordenes', '/']);
    expect(screen.queryByRole('button', { name: 'Editar', exact: true })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Eliminar', exact: true })).toBeNull();
    expect(screen.getByRole('button', { name: 'Cerrar Sesión' })).toBeTruthy();
  });
  it('VENDEDOR consulta órdenes sin modificación ni exportación', () => {
    dibujar('/admin/ordenes');
    expect(screen.getAllByRole('link', { name: 'Ver boleta' }).length).toBe(2);
    expect(screen.queryByRole('button', { name: /Exportar/ })).toBeNull();
    expect(screen.queryByRole('combobox', { name: /Cambiar estado/ })).toBeNull();
  });
  it('VENDEDOR consulta el detalle sin imprimir', () => {
    dibujar('/admin/ordenes/QA-1');
    expect(screen.getByRole('heading', { name: 'Boleta de la orden' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Imprimir' })).toBeNull();
    expect(window.print).not.toHaveBeenCalled();
  });
  it('VENDEDOR abre detalles de productos sin enviar escrituras', async () => {
    usuario = { tipo: 'Vendedor' };
    dibujar('/admin/productos');
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });
  for (const ruta of ['/admin', '/admin/productos', '/admin/productos/nuevo', '/admin/ordenes', '/admin/ordenes/QA-1', '/admin/perfil', '/admin/categorias', '/admin/reportes', '/admin/usuarios', '/admin/usuarios/nuevo', '/admin/usuarios/qa/historial']) {
    it(`ADMIN conserva acceso directo a ${ruta}`, async () => {
      usuario = { rol: 'ADMIN', nombre: 'QA', correo: 'qa@example.test' };
      dibujar(ruta);
      expect((await screen.findByTestId('ruta')).textContent).toBe(ruta);
      expect(screen.getByRole('navigation', { name: 'Menú de administración' })).toBeTruthy();
    });
  }
  it('ADMIN conserva el menú completo y las acciones de órdenes', () => {
    usuario = { tipo: 'Administrador' };
    dibujar('/admin/ordenes');
    const menu = within(screen.getByRole('navigation', { name: 'Menú de administración' }));
    for (const nombre of ['Inicio', 'Nuevo Producto', 'Categorías', 'Reportes', 'Listado de Usuarios', 'Nuevo Usuario', 'Mi Perfil']) {
      expect(menu.getByRole('link', { name: nombre })).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeTruthy();
    expect(screen.getAllByRole('combobox', { name: /Cambiar estado/ }).length).toBe(2);
  });
  it('ADMIN conserva la impresión del detalle', () => {
    usuario = { rol: 'ADMIN' };
    dibujar('/admin/ordenes/QA-1');
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });
  for (const ruta of ['/admin', '/admin/productos', '/admin/productos/nuevo', '/admin/ordenes', '/admin/ordenes/QA-1', '/admin/perfil', '/admin/categorias', '/admin/reportes', '/admin/usuarios']) {
    it(`CLIENTE no puede abrir ${ruta}`, () => {
      usuario = { rol: 'CLIENTE' };
      dibujar(ruta);
      expect(screen.getByTestId('ruta').textContent).toBe('/');
      expect(api.get).not.toHaveBeenCalled();
    });
    it(`sin sesión ${ruta} redirige a login`, () => {
      usuario = null;
      dibujar(ruta);
      expect(screen.getByTestId('ruta').textContent).toBe('/login');
      expect(api.get).not.toHaveBeenCalled();
    });
  }
  it('admite rol y tipo conservando destinos de ADMIN y CLIENTE', () => {
    for (const valor of [{ rol: ' VENDEDOR ' }, { tipo: 'Vendedor' }]) {
      expect(puedeEntrarAlPanel(valor)).toBe(true);
      expect(rutaInicioSegunRol(valor)).toBe('/admin/productos');
    }
    expect(rutaInicioSegunRol({ rol: 'ADMIN' })).toBe('/admin');
    expect(rutaInicioSegunRol({ tipo: 'Cliente' })).toBe('/');
    expect(puedeEntrarAlPanel({ rol: 'desconocido' })).toBe(false);
  });
});
