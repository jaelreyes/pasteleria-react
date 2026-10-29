import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import ProductDetailModal from '../admin/components/ProductDetailModal'

const producto = {
  id: 1,
  codigo: 'TC001',
  nombre: 'Torta de Chocolate',
  categoria: 'Tortas Cuadradas',
  descripcion: 'Bizcocho con ganache.',
  imagen: '/images/productos/TC001.jpg',
  precio: 45000,
  descuento: 0,
  stock: 9,
  stockCritico: 5,
}

async function dibujarDetalle(cambios = {}) {
  const onCerrar = jasmine.createSpy('onCerrar')
  render(<ProductDetailModal producto={{ ...producto, ...cambios }} onCerrar={onCerrar} />)
  const dialogo = await screen.findByRole('dialog', { name: 'Detalle del producto' })
  return { dialogo, consultas: within(dialogo), onCerrar }
}

function valorDetalle(dialogo, etiqueta) {
  return within(dialogo).getByText(etiqueta, { selector: 'dt' }).nextElementSibling.textContent
}

describe('ProductDetailModal: componente real', () => {
  afterEach(cleanup)

  it('no abre el modal si no se seleccionó un producto', () => {
    const onCerrar = jasmine.createSpy('onCerrar')
    render(<ProductDetailModal producto={null} onCerrar={onCerrar} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onCerrar).not.toHaveBeenCalled()
  })

  it('muestra los datos reales y clasifica stock superior al límite como disponible', async () => {
    const { dialogo, consultas } = await dibujarDetalle()
    expect(consultas.getByRole('heading', { name: producto.nombre })).toBeTruthy()
    expect(consultas.getByRole('img', { name: producto.nombre }).getAttribute('src')).toBe(producto.imagen)
    expect(consultas.getByText(producto.categoria)).toBeTruthy()
    expect(consultas.getByText(producto.codigo)).toBeTruthy()
    expect(consultas.getByText(producto.descripcion)).toBeTruthy()
    expect(consultas.getByText('Disponible')).toBeTruthy()
    expect(valorDetalle(dialogo, 'Stock disponible')).toBe('9 unidades')
    expect(valorDetalle(dialogo, 'Límite de stock crítico')).toBe('5 unidades')
  })

  it('calcula el precio de oferta sin alterar el precio base del producto', async () => {
    const { dialogo } = await dibujarDetalle({ descuento: 15 })
    expect(valorDetalle(dialogo, 'Precio base')).toBe('$45.000')
    expect(valorDetalle(dialogo, 'Descuento del producto')).toBe('15%')
    expect(valorDetalle(dialogo, 'Precio con oferta')).toBe('$38.250')
    expect(producto.precio).toBe(45000)
  })

  it('distingue agotado de crítico cuando el stock es cero', async () => {
    const { consultas } = await dibujarDetalle({ stock: 0 })
    expect(consultas.getByText('Agotado')).toBeTruthy()
    expect(consultas.queryByText('Stock crítico', { exact: true })).toBeNull()
    expect(consultas.queryByText('Disponible', { exact: true })).toBeNull()
  })

  it('marca crítico cuando el stock es exactamente igual al límite', async () => {
    const { consultas } = await dibujarDetalle({ stock: 6, stockCritico: 6 })
    expect(consultas.getByText('Stock crítico', { exact: true })).toBeTruthy()
    expect(consultas.queryByText('Disponible', { exact: true })).toBeNull()
  })

  it('respeta un límite crítico válido de cero', async () => {
    const { dialogo, consultas } = await dibujarDetalle({ stock: 1, stockCritico: 0 })
    expect(valorDetalle(dialogo, 'Límite de stock crítico')).toBe('0 unidades')
    expect(consultas.getByText('Disponible')).toBeTruthy()
  })

  const limitesInvalidos = [
    { nombre: 'vacío', valor: '' },
    { nombre: 'nulo', valor: null },
    { nombre: 'ausente', valor: undefined },
    { nombre: 'negativo', valor: -1 },
    { nombre: 'decimal', valor: 1.5 },
    { nombre: 'no numérico', valor: 'invalido' },
  ]

  limitesInvalidos.forEach(({ nombre, valor }) => {
    it(`usa límite 5 cuando el límite guardado es ${nombre}`, async () => {
      const { dialogo, consultas } = await dibujarDetalle({ stock: 5, stockCritico: valor })
      expect(valorDetalle(dialogo, 'Límite de stock crítico')).toBe('5 unidades')
      expect(consultas.getByText('Stock crítico', { exact: true })).toBeTruthy()
    })
  })

  it('presenta alternativas legibles si faltan imagen, categoría, código y descripción', async () => {
    const { consultas } = await dibujarDetalle({ imagen: '', categoria: '', codigo: '', descripcion: '' })
    expect(consultas.getByText('Sin imagen registrada')).toBeTruthy()
    expect(consultas.queryByRole('img')).toBeNull()
    expect(consultas.getByText('Sin categoría')).toBeTruthy()
    expect(consultas.getByText('Sin código')).toBeTruthy()
    expect(consultas.getByText('Sin descripción registrada.')).toBeTruthy()
  })

  it('solicita el cierre al presionar el botón del pie del modal', async () => {
    const { consultas, onCerrar } = await dibujarDetalle()
    fireEvent.click(consultas.getByRole('button', { name: /^cerrar$/i }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })
})
