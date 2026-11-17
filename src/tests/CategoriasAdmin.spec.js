import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import CategoriasAdmin from '../admin/pages/CategoriasAdmin';
import api from '../services/api';
const grupos = [{ id: 8, nombre: 'Tortas', descripcion: 'Descripcion existente' }, { id: 21, nombre: 'Galletas' }];
const inactivo = { id: 17, codigo: 'TC001', nombre: 'Torta', precio: 100, stock: 0, activo: false, categoria: { id: 8, nombre: 'Tortas' } };
describe('CategoriasAdmin HTTP', () => {
  beforeEach(() => {
    spyOn(api, 'get').and.callFake(ruta => Promise.resolve({ data: ruta === '/categorias' ? grupos : [inactivo] }));
    spyOn(window, 'confirm').and.returnValue(true); spyOn(Storage.prototype, 'setItem').and.stub();
  });
  afterEach(cleanup);
  async function dibujar(props = {}) { render(<CategoriasAdmin {...props} />); await screen.findByText('Galletas'); }
  it('no muestra reintento durante carga ni despues de consultas exitosas', async () => {
    render(<CategoriasAdmin />);
    expect(screen.queryByRole('button', { name: 'Reintentar lectura' })).toBeNull();
    await screen.findByText('Galletas');
    expect(screen.queryByRole('button', { name: 'Reintentar lectura' })).toBeNull();
    expect(api.get.calls.allArgs()).toEqual([['/categorias'], ['/productos/admin']]);
  });
  for (const rutaFallida of ['/categorias', '/productos/admin']) {
    it(`muestra reintento si falla ${rutaFallida} y lo oculta al recuperarse`, async () => {
      api.get.and.callFake(ruta => ruta === rutaFallida ? Promise.reject(new Error('sin red'))
        : Promise.resolve({ data: ruta === '/categorias' ? grupos : [inactivo] }));
      render(<CategoriasAdmin />);
      const boton = await screen.findByRole('button', { name: 'Reintentar lectura' });
      expect(boton.disabled).toBe(false);
      api.get.and.callFake(ruta => Promise.resolve({ data: ruta === '/categorias' ? grupos : [inactivo] }));
      fireEvent.click(boton);
      await screen.findByText('Galletas');
      expect(screen.queryByRole('button', { name: 'Reintentar lectura' })).toBeNull();
    });
  }
  it('cuenta inactivos y bloquea eliminar su categoria', async () => {
    await dibujar(); const fila = screen.getByText('Tortas').closest('tr');
    expect(within(fila).getByText('1')).toBeTruthy();
    expect(within(fila).getByRole('button', { name: 'Eliminar' }).disabled).toBe(true);
  });
  it('crea por Axios y refresca el catalogo', async () => {
    spyOn(api, 'post').and.resolveTo({ data: { id: 40, nombre: 'Bombones' } });
    const notificar = jasmine.createSpy().and.resolveTo(); await dibujar({ onCatalogoActualizado: notificar });
    fireEvent.change(screen.getByLabelText('Nueva categor\u00eda'), { target: { value: 'Bombones' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' })); await screen.findByText('Categoria creada correctamente.');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(api.post).toHaveBeenCalledWith('/categorias', { nombre: 'Bombones', descripcion: '' }, { conservarFormulario: true });
    expect(notificar).toHaveBeenCalled(); expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });
  it('edita por ID y conserva descripcion', async () => {
    spyOn(api, 'put').and.resolveTo({ data: grupos[0] }); await dibujar();
    fireEvent.click(within(screen.getByText('Tortas').closest('tr')).getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Nuevo nombre para Tortas'), { target: { value: 'Postres' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' })); await screen.findByText('Categoria actualizada correctamente.');
    expect(api.put).toHaveBeenCalledWith('/categorias/8', { nombre: 'Postres', descripcion: 'Descripcion existente' }, { conservarFormulario: true });
  });
  it('conserva categoria ante 409 por asociacion concurrente', async () => {
    spyOn(api, 'delete').and.rejectWith({ response: { status: 409, data: { mensaje: 'Tiene productos asociados' } } });
    await dibujar(); fireEvent.click(within(screen.getByText('Galletas').closest('tr')).getByRole('button', { name: 'Eliminar' }));
    await screen.findByText(/409: Tiene productos asociados/); expect(screen.getByText('Galletas')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reintentar lectura' })).toBeNull();
    expect(api.delete).toHaveBeenCalledWith('/categorias/21', { conservarFormulario: true });
  });
  it('mantiene formulario ante 403', async () => {
    spyOn(api, 'post').and.rejectWith({ response: { status: 403, data: {} } }); await dibujar();
    fireEvent.change(screen.getByLabelText('Nueva categor\u00eda'), { target: { value: 'Bombones' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' })); await screen.findByText(/403:/);
    expect(screen.getByLabelText('Nueva categor\u00eda').value).toBe('Bombones');
  });
  it('evita creacion duplicada', async () => {
    let resolver; spyOn(api, 'post').and.returnValue(new Promise(resolve => { resolver = resolve; }));
    await dibujar(); fireEvent.change(screen.getByLabelText('Nueva categor\u00eda'), { target: { value: 'Bombones' } });
    const boton = screen.getByRole('button', { name: 'Agregar' }); fireEvent.click(boton); fireEvent.click(boton);
    expect(api.post.calls.count()).toBe(1); resolver({ data: { id: 40, nombre: 'Bombones' } });
    await screen.findByText('Categoria creada correctamente.');
  });
});
