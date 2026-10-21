import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import {
  MemoryRouter,
  useLocation,
} from 'react-router-dom'
import ProductList from '../components/ProductList'

// Datos independientes del catálogo real y de localStorage.
const productos = [
  {
    id: 1,
    codigo: 'TC001',
    nombre: 'Torta de Chocolate',
    categoria: 'Tortas',
    descripcion: 'Bizcocho de chocolate.',
    precio: 45000,
    stock: 5,
    imagen: '/images/productos/TC001.jpg',
  },
  {
    id: 2,
    codigo: 'TC002',
    nombre: 'Torta de Frutas',
    categoria: 'Tortas',
    descripcion: 'Bizcocho con frutas.',
    precio: 50000,
    descuento: 15,
    stock: 4,
    imagen: '/images/productos/TC002.jpg',
  },
  {
    id: 3,
    nombre: 'Galletas de Avena',
    categoria: 'Galletas',
    descripcion: 'Galletas artesanales.',
    precio: 4500,
    stock: 8,
    imagen: '/images/productos/PV002.jpg',
  },
]

// Permite observar la dirección del router durante las pruebas.
function UbicacionActual() {
  const ubicacion = useLocation()

  return (
    <output data-testid="ubicacion">
      {ubicacion.pathname}
      {ubicacion.search}
    </output>
  )
}

function dibujarCatalogo(
  ruta = '/productos',
  descuentoUsuario = 0
) {
  const onAgregar = jasmine.createSpy('onAgregar')

  render(
    <MemoryRouter initialEntries={[ruta]}>
      <ProductList
        productos={productos}
        onAgregar={onAgregar}
        descuentoUsuario={descuentoUsuario}
      />
      <UbicacionActual />
    </MemoryRouter>
  )

  return onAgregar
}

function buscar(texto) {
  fireEvent.change(
    screen.getByRole('searchbox', { name: 'Buscar productos' }),
    { target: { value: texto } }
  )
}

function elegirCategoria(categoria) {
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Categoría' }),
    { target: { value: categoria } }
  )
}

function parametrosActuales() {
  const direccion = screen.getByTestId('ubicacion').textContent
  return new URLSearchParams(direccion.split('?')[1] || '')
}

describe('ProductList', () => {
  afterEach(cleanup)

  it('muestra todos los productos cuando no hay filtros', () => {
    dibujarCatalogo()

    expect(
      screen.getAllByRole('heading', { level: 3 }).length
    ).toBe(3)
  })

  it('busca por nombre sin distinguir mayúsculas ni espacios exteriores', () => {
    dibujarCatalogo()
    buscar('  CHOCOLATE  ')

    expect(
      screen.getByRole('heading', { name: 'Torta de Chocolate' })
    ).toBeTruthy()

    expect(
      screen.queryByRole('heading', { name: 'Torta de Frutas' })
    ).toBeNull()

    expect(
      screen.getAllByRole('heading', { level: 3 }).length
    ).toBe(1)
  })

  it('busca por código sin fallar si otro producto no tiene código', () => {
    dibujarCatalogo()
    buscar('tc002')

    expect(
      screen.getByRole('heading', { name: 'Torta de Frutas' })
    ).toBeTruthy()

    expect(
      screen.getAllByRole('heading', { level: 3 }).length
    ).toBe(1)
  })

  it('muestra solo los productos de la categoría seleccionada', () => {
    dibujarCatalogo()
    elegirCategoria('Galletas')

    expect(
      screen.getByRole('heading', { name: 'Galletas de Avena' })
    ).toBeTruthy()

    expect(
      screen.getAllByRole('heading', { level: 3 }).length
    ).toBe(1)
  })

  it('combina búsqueda y categoría conservando ambos parámetros', () => {
    dibujarCatalogo()
    buscar('torta')
    elegirCategoria('Galletas')

    expect(
      screen.getByText('No se encontraron productos con esos filtros.')
    ).toBeTruthy()

    expect(
      screen.queryAllByRole('heading', { level: 3 }).length
    ).toBe(0)

    const parametros = parametrosActuales()

    expect(parametros.get('q')).toBe('torta')
    expect(parametros.get('categoria')).toBe('Galletas')
  })

  it('recupera los filtros desde una URL compartida', () => {
    dibujarCatalogo('/productos?q=frutas&categoria=Tortas')

    expect(
      screen.getByRole('searchbox', { name: 'Buscar productos' }).value
    ).toBe('frutas')

    expect(
      screen.getByRole('combobox', { name: 'Categoría' }).value
    ).toBe('Tortas')

    expect(
      screen.getByRole('heading', { name: 'Torta de Frutas' })
    ).toBeTruthy()

    expect(
      screen.getAllByRole('heading', { level: 3 }).length
    ).toBe(1)
  })

  it('al borrar la búsqueda conserva la categoría y otros parámetros', () => {
    dibujarCatalogo(
      '/productos?q=frutas&categoria=Tortas&origen=inicio'
    )

    buscar('')

    const parametros = parametrosActuales()

    expect(parametros.has('q')).toBe(false)
    expect(parametros.get('categoria')).toBe('Tortas')
    expect(parametros.get('origen')).toBe('inicio')

    expect(
      screen.getAllByRole('heading', { level: 3 }).length
    ).toBe(2)
  })

  it('envía el producto con su precio base aunque muestre un descuento', () => {
    const onAgregar = dibujarCatalogo('/productos?q=frutas', 50)

    expect(screen.getByText('-50%')).toBeTruthy()
    expect(screen.getByText(/^\$25\.000/)).toBeTruthy()
    expect(screen.getByText('$50.000').tagName).toBe('DEL')

    fireEvent.click(
      screen.getByRole('button', { name: 'Añadir al carrito' })
    )

    expect(onAgregar).toHaveBeenCalledTimes(1)
    expect(onAgregar).toHaveBeenCalledWith(productos[1])
  })
})