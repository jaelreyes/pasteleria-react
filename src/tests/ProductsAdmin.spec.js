import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ProductsAdmin from '../admin/pages/ProductsAdmin';
import api from '../services/api';
const producto = { id: 17, codigo: 'TC001', nombre: 'Torta', descripcion: 'Ganache', imagenUrl: '/images/torta.jpg',
  precio: 45000, stock: 5, stockCritico: 2, categoria: { id: 8, nombre: 'Tortas' }, descuento: 15, activo: true };
describe('ProductsAdmin HTTP', () => {
  beforeEach(() => {
    spyOn(api, 'get').and.callFake(ruta => Promise.resolve({ data: ruta === '/productos/admin' ? [producto] : [{ id: 8, nombre: 'Tortas' }] }));
    spyOn(Storage.prototype, 'setItem').and.stub();
    spyOn(Element.prototype, 'scrollIntoView').and.stub();
    spyOn(window, 'confirm').and.returnValue(true);
  });
  afterEach(cleanup);
  async function dibujar(props = {}) {
    render(<ProductsAdmin puedeModificar={true} {...props} />);
    await screen.findByRole('button', { name: 'Editar', exact: true });
  }
  function editar() { fireEvent.click(screen.getByRole('button', { name: 'Editar', exact: true })); }
  function guardar() { fireEvent.click(screen.getByRole('button', { name: 'Actualizar Producto' })); }
  it('carga IDs reales, imagen y descuento; codigo de solo lectura', async () => {
    await dibujar(); editar();
    expect(screen.getByLabelText('Categor\u00eda').value).toBe('8');
    expect(screen.getByLabelText('C\u00f3digo').readOnly).toBe(true);
    expect(screen.getByLabelText('Imagen').value).toBe(producto.imagenUrl);
    expect(screen.getByLabelText('Descuento %').value).toBe('15');
  });
  it('actualiza por Axios, conserva stock cero y notifica al catalogo', async () => {
    spyOn(api, 'put').and.resolveTo({ data: { ...producto, stock: 0 } });
    const notificar = jasmine.createSpy().and.resolveTo();
    await dibujar({ onCatalogoActualizado: notificar }); editar();
    fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '0' } }); guardar();
    await screen.findByText('Producto actualizado correctamente.');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(api.put).toHaveBeenCalledWith('/productos/17', jasmine.objectContaining({ codigo: 'TC001', categoria: { id: 8 }, stock: 0, imagenUrl: producto.imagenUrl, descuento: 15 }), { conservarFormulario: true });
    expect(notificar).toHaveBeenCalled(); expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });
  it('rechaza precio cero sin enviar el formulario', async () => {
    spyOn(api, 'put'); await dibujar(); editar();
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '0' } }); guardar();
    expect(api.put).not.toHaveBeenCalled(); expect(screen.getByLabelText('Precio').value).toBe('0');
  });
  it('crea producto con relacion por ID sin enviar campos locales', async () => {
    spyOn(api, 'post').and.resolveTo({ data: producto });
    render(<ProductsAdmin puedeModificar={true} modo="nuevo" />);
    await screen.findByRole('option', { name: 'Tortas' });
    for (const [etiqueta, valor] of [['Código', 'TC002'], ['Nombre', 'Torta nueva'], ['Descripción', 'Ganache'],
      ['Imagen', '/images/torta.jpg'], ['Precio', '1200'], ['Stock', '3'], ['Categoría', '8']]) {
      fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Producto' }));
    await screen.findByText('Producto creado correctamente.');
    expect(api.post).toHaveBeenCalledWith('/productos', jasmine.objectContaining({ codigo: 'TC002', categoria: { id: 8 }, precio: 1200 }), { conservarFormulario: true });
    expect(api.post.calls.mostRecent().args[1].imagen).toBeUndefined();
  });
  it('guardado exitoso con recarga fallida no repite la escritura', async () => {
    spyOn(api, 'put').and.resolveTo({ data: producto });
    await dibujar(); editar();
    api.get.and.rejectWith(new Error('red')); guardar();
    await screen.findByText(/El cambio fue guardado/);
    expect(screen.getByText('Producto actualizado correctamente.')).toBeTruthy();
    expect(api.put.calls.count()).toBe(1);
  });
  it('mantiene el formulario y muestra 409', async () => {
    spyOn(api, 'put').and.rejectWith({ response: { status: 409, data: { mensaje: 'Conflicto de codigo' } } });
    await dibujar(); editar();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nombre pendiente' } }); guardar();
    await screen.findByText(/409: Conflicto de codigo/);
    expect(screen.getByLabelText('Nombre').value).toBe('Nombre pendiente');
  });
  it('evita envios duplicados mientras hay peticion pendiente', async () => {
    let resolver; spyOn(api, 'put').and.returnValue(new Promise(resolve => { resolver = resolve; }));
    await dibujar(); editar(); guardar(); guardar(); expect(api.put.calls.count()).toBe(1);
    resolver({ data: producto }); await screen.findByText('Producto actualizado correctamente.');
  });
  it('desactiva por DELETE y muestra inactivos', async () => {
    spyOn(api, 'delete').and.resolveTo({}); await dibujar();
    api.get.and.callFake(ruta => Promise.resolve({ data: ruta === '/productos/admin' ? [{ ...producto, activo: false }] : [{ id: 8, nombre: 'Tortas' }] }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar', exact: true }));
    await screen.findByText('Inactivo'); expect(api.delete).toHaveBeenCalledWith('/productos/17', { conservarFormulario: true });
    expect(screen.getByRole('button', { name: 'Eliminar', exact: true }).disabled).toBe(true);
  });
  it('vendedor consulta sin controles de escritura', async () => {
    render(<ProductsAdmin puedeModificar={false} />); await screen.findByText('Torta');
    expect(screen.queryByRole('button', { name: 'Editar', exact: true })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Eliminar', exact: true })).toBeNull();
  });
  it('permite reintentar lectura fallida', async () => {
    api.get.and.rejectWith(new Error('red')); render(<ProductsAdmin puedeModificar={true} />);
    await screen.findByText(/Revisa la conexion/);
    api.get.and.callFake(ruta => Promise.resolve({ data: ruta === '/productos/admin' ? [producto] : [{ id: 8, nombre: 'Tortas' }] }));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar lectura' })); await screen.findByText('Torta');
  });
});
