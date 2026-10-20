import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Registro from '../pages/Registro'

describe('Registro', () => {
  afterEach(cleanup)

  it('habilita las comunas solo después de elegir una región', () => {
    render(<MemoryRouter><Registro /></MemoryRouter>)

    const comuna = screen.getByLabelText(/Comuna/)
    expect(comuna.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/Región/), { target: { value: 'Valparaíso' } })

    expect(comuna.disabled).toBe(false)
    expect(screen.getByRole('option', { name: 'Viña del Mar' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Providencia' })).toBeNull()
  })
})