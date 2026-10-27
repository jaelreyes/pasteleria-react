// Pruebas de la vista Categorías de la tienda.
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Categorias from '../pages/Categorias'
import CategoriaCard from '../components/CategoriaCard'
import { crearSlug, obtenerCategorias } from '../utils/categorias'

// Productos de prueba: así no dependemos del catálogo real.
const productos = [
  { id: 1, codigo: 'TC001', nombre: 'Torta de Chocolate', categoria: 'Tortas Cuadradas', descripcion: '', precio: 45000, stock: 5, imagen: 'a.jpg' },
  { id: 2, codigo: 'TC002', nombre: 'Torta de Frutas', categoria: 'Tortas Cuadradas', descripcion: '', precio: 50000, stock: 5, imagen: 'b.jpg' },
  { id: 3, codigo: 'PV001', nombre: 'Torta Vegana', categoria: 'Productos Veganos', descripcion: '', precio: 50000, stock: 5, imagen: 'c.jpg' },
]

function dibujarCategorias(ruta, onAgregar = () => {}) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/categorias" element={<Categorias productos={productos} onAgregar={onAgregar} />} />
        <Route path="/categorias/:slug" element={<Categorias productos={productos} onAgregar={onAgregar} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Categorías', () => {
  afterEach(cleanup)

  it('crea el slug de la URL sin tildes ni espacios', () => {
    expect(crearSlug('Productos Sin Azúcar')).toBe('productos-sin-azucar')
  })

  it('agrupa los productos y cuenta cuántos hay por categoría', () => {
    const categorias = obtenerCategorias(productos)
    expect(categorias.length).toBe(2)
    expect(categorias[0]).toEqual(jasmine.objectContaining({ nombre: 'Tortas Cuadradas', cantidad: 2 }))
  })

  it('CategoriaCard muestra el nombre, la cantidad y el enlace que recibe por props', () => {
    render(
      <MemoryRouter>
        <CategoriaCard nombre="Tortas Especiales" slug="tortas-especiales" imagen="x.jpg" cantidad={1} />
      </MemoryRouter>
    )

    expect(screen.getByText('Tortas Especiales')).toBeTruthy()
    expect(screen.getByText('1 producto')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/categorias/tortas-especiales')
  })

  it('sin categoría elegida muestra solo las tarjetas', () => {
    dibujarCategorias('/categorias')
    expect(screen.getAllByRole('link', { name: /productos?$/ }).length).toBe(2)
    expect(screen.queryByText('Torta de Chocolate')).toBeNull()
  })

  it('muestra solo los productos de la categoría elegida', () => {
    dibujarCategorias('/categorias/tortas-cuadradas')
    expect(screen.getByText('Torta de Chocolate')).toBeTruthy()
    expect(screen.getByText('Torta de Frutas')).toBeTruthy()
    expect(screen.queryByText('Torta Vegana')).toBeNull()
  })

  it('avisa cuando la categoría de la URL no existe', () => {
    dibujarCategorias('/categorias/no-existe')
    expect(screen.getByText(/La categoría no existe/)).toBeTruthy()
  })

  it('al hacer clic en Añadir llama a onAgregar con el producto', () => {
    const onAgregar = jasmine.createSpy('onAgregar')
    dibujarCategorias('/categorias/productos-veganos', onAgregar)

    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }))
    expect(onAgregar).toHaveBeenCalledWith(productos[2])
  })
})