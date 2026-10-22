import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from '@testing-library/react'
import ProductsAdmin from '../pages/ProductsAdmin'

const productoInicial = {
  id: 1,
  codigo: 'TC001',
  nombre: 'Torta de Chocolate',
  descripcion: 'Bizcocho con ganache.',
  imagen: '/images/productos/TC001.jpg',
  precio: 45000,
  stock: 5,
  stockCritico: 2,
  categoria: 'Tortas Cuadradas',
  descuento: 0,
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  })
}

function editarProducto() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Editar', exact: true })
  )
}

function actualizarProducto() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Actualizar Producto' })
  )
}

describe('ProductsAdmin', () => {
  let almacenamiento

  beforeEach(() => {
    almacenamiento = {
      productos: JSON.stringify([productoInicial]),
    }

    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave)
        ? almacenamiento[clave]
        : null
    )

    spyOn(Storage.prototype, 'setItem').and.callFake(
      (clave, valor) => {
        almacenamiento[clave] = String(valor)
      }
    )

    // Evita mover la pantalla real durante las pruebas.
    spyOn(Element.prototype, 'scrollIntoView').and.stub()
  })

  afterEach(cleanup)

  it('carga el producto en el formulario y enfoca su nombre', () => {
    render(<ProductsAdmin />)
    editarProducto()

    expect(
      screen.getByRole('heading', {
        name: 'Editar Producto Existente',
      })
    ).toBeTruthy()

    const nombre = screen.getByLabelText('Nombre')

    expect(nombre.value).toBe('Torta de Chocolate')
    expect(screen.getByLabelText('Precio').value).toBe('45000')
    expect(screen.getByLabelText('Stock').value).toBe('5')

    expect(screen.getByLabelText('Categoría').value).toBe(
      'Tortas Cuadradas'
    )

    expect(document.activeElement).toBe(nombre)
  })

  it('guarda stock cero conservando código, imagen y descripción', () => {
    render(<ProductsAdmin />)
    editarProducto()
    escribir('Stock', '0')

    actualizarProducto()

    const productos = JSON.parse(almacenamiento.productos)

    expect(productos).toEqual([
      { ...productoInicial, stock: 0 },
    ])

    expect(
      screen.getByText('Producto actualizado correctamente.')
    ).toBeTruthy()

    const fila = screen.getByRole('row', {
      name: /Torta de Chocolate/,
    })

    expect(within(fila).getByText('Crítico')).toBeTruthy()
  })

  it('rechaza un stock negativo sin modificar el catálogo', () => {
    render(<ProductsAdmin />)
    editarProducto()
    escribir('Stock', '-1')

    actualizarProducto()

    expect(
      screen.getByRole('alert').textContent
    ).toContain(
      'El stock debe ser un número entero mayor o igual a cero.'
    )

    expect(localStorage.setItem).not.toHaveBeenCalled()

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      productoInicial,
    ])
  })

  it('rechaza descuentos mayores al 100%', () => {
    render(<ProductsAdmin />)
    editarProducto()
    escribir('Descuento %', '120')

    actualizarProducto()

    expect(
      screen.getByRole('alert').textContent
    ).toContain(
      'El descuento debe ser un número entero entre 0 y 100.'
    )

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('cancelar descarta los cambios sin guardar', () => {
    render(<ProductsAdmin />)
    editarProducto()
    escribir('Nombre', 'Nombre que no se debe guardar')

    fireEvent.click(
      screen.getByRole('button', { name: 'Cancelar' })
    )

    expect(screen.getByLabelText('Nombre').value).toBe('')

    expect(
      screen.getByRole('heading', {
        name: 'Registrar Nuevo Producto',
      })
    ).toBeTruthy()

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      productoInicial,
    ])

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('informa cuando falla el guardado y mantiene el formulario', () => {
    localStorage.setItem.and.throwError('Almacenamiento bloqueado')
    spyOn(console, 'error').and.stub()

    render(<ProductsAdmin />)
    editarProducto()
    escribir('Stock', '6')

    actualizarProducto()

    expect(
      screen.getByRole('alert').textContent
    ).toContain(
      'No se pudo guardar el producto. Revisa el almacenamiento.'
    )

    expect(screen.getByLabelText('Stock').value).toBe('6')

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      productoInicial,
    ])
  })
})