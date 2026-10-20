import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Ofertas from '../pages/Ofertas'
import { obtenerOfertas, precioConOferta } from '../utils/precios'

const productos = [
  { id: 1, codigo: 'TC002', nombre: 'Torta de Frutas', categoria: 'Tortas Cuadradas', descripcion: '', precio: 50000, stock: 4, imagen: 'a.jpg', descuento: 20 },
  { id: 2, codigo: 'TT002', nombre: 'Torta de Manjar', categoria: 'Tortas Circulares', descripcion: '', precio: 42000, stock: 8, imagen: 'b.jpg' },
]

function dibujarOfertas(lista, onAgregar = () => {}) {
  render(
    <MemoryRouter>
      <Ofertas productos={lista} onAgregar={onAgregar} />
    </MemoryRouter>
  )
}

describe('Ofertas', () => {
  afterEach(cleanup)

  it('calcula el precio con el descuento del producto', () => {
    expect(precioConOferta(productos[0])).toBe(40000)
    expect(precioConOferta(productos[1])).toBe(42000)
  })

  it('obtenerOfertas deja solo los productos con descuento', () => {
    expect(obtenerOfertas(productos).map(p => p.id)).toEqual([1])
  })

  it('muestra el porcentaje, el precio de oferta y el precio anterior', () => {
    dibujarOfertas(productos)

    expect(screen.getByText('Torta de Frutas')).toBeTruthy()
    expect(screen.queryByText('Torta de Manjar')).toBeNull()
    expect(screen.getByText('-20%')).toBeTruthy()
    expect(screen.getByText('$50.000').tagName).toBe('DEL')
  })

  it('muestra un mensaje cuando no hay ofertas', () => {
    dibujarOfertas([productos[1]])
    expect(screen.getByText(/No hay ofertas disponibles/)).toBeTruthy()
  })

  it('agrega al carrito con el precio de oferta', () => {
    const onAgregar = jasmine.createSpy('onAgregar')
    dibujarOfertas(productos, onAgregar)

    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }))
    expect(onAgregar).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, precio: 40000 }))
  })
})