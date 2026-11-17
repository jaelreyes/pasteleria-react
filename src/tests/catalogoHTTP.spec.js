import api from '../services/api';
import { obtenerProductosAPI, errorCatalogo } from '../services/productoService';
import { obtenerCategoriasAPI } from '../services/categoriaService';
import { sincronizarCarrito } from '../utils/carrito';

describe('Catálogo HTTP y protección del carrito', () => {
  const producto = { id: 95, codigo: 'TC001', nombre: 'Torta', precio: '45000', descuento: '15', stock: 3,
    imagenUrl: '/images/productos/TC001.jpg', categoria: { id: 8, nombre: 'Tortas' } };

  it('informa los errores HTTP y las validaciones de campos', () => {
    for (const status of [400, 401, 403, 404, 409]) {
      expect(errorCatalogo({ response: { status, data: {} } })).toContain(String(status));
    }
    expect(errorCatalogo({ response: { status: 400, data: { errores: { precio: 'Debe ser positivo' } } } })).toContain('Debe ser positivo');
  });

  it('usa el cliente compartido y adapta el DTO sin perder categoría ni imagen', async () => {
    spyOn(api, 'get').and.resolveTo({ data: [producto] });
    const [resultado] = await obtenerProductosAPI();
    expect(api.get).toHaveBeenCalledWith('/productos');
    expect(resultado).toEqual(jasmine.objectContaining({ precio: 45000, descuento: 15,
      categoria: 'Tortas', categoriaId: 8, imagen: producto.imagenUrl }));
  });

  it('obtiene también categorías sin productos', async () => {
    spyOn(api, 'get').and.resolveTo({ data: [{ id: 9, nombre: 'Nueva' }] });
    expect(await obtenerCategoriasAPI()).toEqual([{ id: 9, nombre: 'Nueva' }]);
    expect(api.get).toHaveBeenCalledWith('/categorias');
  });

  it('rechaza una respuesta mal formada en lugar de tratarla como catálogo vacío', async () => {
    spyOn(api, 'get').and.resolveTo({ data: {} });
    await expectAsync(obtenerProductosAPI()).toBeRejected();
  });

  it('reconoce por código un producto cuyo ID cambió sin alterar el carrito original', () => {
    const anterior = [{ id: 1, codigo: 'TC001', cantidad: 2 }];
    const resultado = sincronizarCarrito(anterior, [producto]);
    expect(resultado.items[0].id).toBe(95);
    expect(resultado.items[0].cantidad).toBe(2);
    expect(resultado.pendiente).toBe(false);
    expect(anterior[0].id).toBe(1);
  });

  it('no sustituye un producto por otro que reutiliza su ID', () => {
    const anterior = [{ id: 95, codigo: 'OTRO', cantidad: 2 }];
    const resultado = sincronizarCarrito(anterior, [producto]);
    expect(resultado.items).toEqual(anterior);
    expect(resultado.pendiente).toBe(true);
  });

  it('conserva productos sin coincidencia incluso con un catálogo vacío', () => {
    const anterior = [{ id: 1, codigo: 'TC001', cantidad: 2 }];
    expect(sincronizarCarrito(anterior, []).items).toEqual(anterior);
    expect(sincronizarCarrito(anterior, []).pendiente).toBe(true);
  });

  it('conserva cantidades sin stock y bloquea la compra', () => {
    const resultado = sincronizarCarrito([{ id: 1, codigo: 'TC001', cantidad: 5 }], [producto]);
    expect(resultado.items[0].cantidad).toBe(5);
    expect(resultado.pendiente).toBe(true);
  });

  it('bloquea códigos ambiguos y productos sin código', () => {
    expect(sincronizarCarrito([{ id: 1, codigo: 'TC001', cantidad: 1 }], [producto, producto]).pendiente).toBe(true);
    expect(sincronizarCarrito([{ id: 95, cantidad: 1 }], [producto]).pendiente).toBe(true);
  });
});
