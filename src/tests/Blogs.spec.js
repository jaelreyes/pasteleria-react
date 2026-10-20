import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Blogs from '../pages/Blogs'
import BlogDetalle from '../pages/BlogDetalle'
import blogs from '../data/blogs'

// Dibuja el detalle como si el usuario entrara a /blogs/:id
function dibujarDetalle(id) {
  render(
    <MemoryRouter initialEntries={[`/blogs/${id}`]}>
      <Routes>
        <Route path="/blogs/:id" element={<BlogDetalle />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Blogs', () => {
  afterEach(cleanup)

  it('muestra una tarjeta por cada artículo', () => {
    render(<MemoryRouter><Blogs /></MemoryRouter>)

    expect(screen.getAllByRole('button', { name: /Leer más/ }).length).toBe(blogs.length)
    blogs.forEach(blog => {
      expect(screen.getByRole('heading', { name: blog.titulo })).toBeTruthy()
    })
  })

  it('muestra el artículo que indica la URL', () => {
    dibujarDetalle(blogs[0].id)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(blogs[0].titulo)
  })

  it('muestra un aviso si el artículo no existe', () => {
    dibujarDetalle(999)
    expect(screen.getByText('Artículo no encontrado.')).toBeTruthy()
  })
})