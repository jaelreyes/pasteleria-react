import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Pedido from '../pages/Pedido'

const ordenAna = {
  id: 'ORD-ANA-001',
  nombre: 'Ana Soto',
  email: 'ana@gmail.com',
  direccion: 'Calle Las Flores 123',
  telefono: '+56912345678',
  fecha: '2026-10-25T10:00:00.000Z',
  estado: 'pendiente',
  total: 20000,
  ahorro: 0,
  pagoSimulado: true,
  productos: [
    {
      id: 1,
      nombre: 'Torta de Chocolate',
      imagen: '/images/productos/TC001.jpg',
      cantidad: 1,
      precioFinal: 20000,
    },
  ],
}

const otraOrdenAna = {
  ...ordenAna,
  id: 'ORD-ANA-002',
  fecha: '2026-10-24T10:00:00.000Z',
}

const ordenBeatriz = {
  ...ordenAna,
  id: 'ORD-BEA-001',
  nombre: 'Beatriz Pérez',
  email: 'beatriz@gmail.com',
  direccion: 'Avenida Los Aromos 456',
}

function dibujarPedido() {
  render(
    <MemoryRouter>
      <Pedido />
    </MemoryRouter>
  )
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  })
}

function consultarPedido({
  id = ordenAna.id,
  correo = ordenAna.email,
} = {}) {
  escribir('ID de la orden', id)
  escribir('Correo de compra', correo)

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Consultar pedido',
    })
  )
}

function buscarTituloPedido(id) {
  return screen.queryByRole('heading', {
    name: `Pedido ${id}`,
    exact: true,
  })
}

function obtenerSeguimiento() {
  return screen.getByRole('region', {
    name: 'Seguimiento del pedido',
  })
}

function obtenerEtapaActual() {
  return within(obtenerSeguimiento())
    .getAllByRole('listitem')
    .find(
      etapa => etapa.getAttribute('aria-current') === 'step'
    )
}

describe('Pedido', () => {
  let almacenamiento

  beforeEach(() => {
    almacenamiento = {
      ordenes: JSON.stringify([
        ordenAna,
        otraOrdenAna,
        ordenBeatriz,
      ]),
    }

    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      Object.prototype.hasOwnProperty.call(
        almacenamiento,
        clave
      )
        ? almacenamiento[clave]
        : null
    )
  })

  afterEach(cleanup)

  it('no muestra compras al invitado antes de consultar', () => {
    dibujarPedido()

    expect(
      screen.getByRole('heading', {
        name: 'Consultar una compra como invitado',
      })
    ).toBeTruthy()

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
    expect(buscarTituloPedido(ordenBeatriz.id)).toBeNull()
    expect(screen.queryByText(ordenAna.direccion)).toBeNull()
    expect(
      screen.queryByText(ordenBeatriz.direccion)
    ).toBeNull()
  })

  it('muestra únicamente las compras del usuario conectado', () => {
    almacenamiento.usuarioActivo = JSON.stringify({
      nombre: 'Ana Soto',
      correo: ' ANA@GMAIL.COM ',
    })

    dibujarPedido()

    expect(buscarTituloPedido(ordenAna.id)).toBeTruthy()
    expect(buscarTituloPedido(otraOrdenAna.id)).toBeTruthy()
    expect(buscarTituloPedido(ordenBeatriz.id)).toBeNull()

    expect(
      screen.queryByText(ordenBeatriz.direccion)
    ).toBeNull()

    expect(
      screen.queryByLabelText('ID de la orden')
    ).toBeNull()
  })

  it('informa cuando la cuenta no tiene pedidos', () => {
    almacenamiento.usuarioActivo = JSON.stringify({
      nombre: 'Cliente nuevo',
      email: 'nuevo@gmail.com',
    })

    dibujarPedido()

    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes pedidos',
      })
    ).toBeTruthy()

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
  })

  it('solicita ID y correo si la consulta está vacía', () => {
    dibujarPedido()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Consultar pedido',
      })
    )

    expect(screen.getByRole('alert').textContent).toContain(
      'Ingresa el ID de la orden y el correo de compra.'
    )

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
  })

  it('rechaza un correo inválido', () => {
    dibujarPedido()

    consultarPedido({ correo: 'correo-invalido' })

    expect(screen.getByRole('alert').textContent).toContain(
      'Ingresa un correo electrónico válido.'
    )

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
  })

  it('consulta solo la orden indicada y normaliza ID y correo', () => {
    dibujarPedido()

    consultarPedido({
      id: ' ord-ana-001 ',
      correo: 'ANA@GMAIL.COM',
    })

    expect(buscarTituloPedido(ordenAna.id)).toBeTruthy()
    expect(buscarTituloPedido(otraOrdenAna.id)).toBeNull()
    expect(buscarTituloPedido(ordenBeatriz.id)).toBeNull()
  })

  it('no muestra la orden cuando el correo no coincide', () => {
    dibujarPedido()

    consultarPedido({
      id: ordenAna.id,
      correo: 'otro@gmail.com',
    })

    expect(screen.getByRole('status').textContent).toContain(
      'No encontramos una orden con ese ID y correo.'
    )

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
    expect(screen.queryByText(ordenAna.direccion)).toBeNull()
  })

  it('limpia los campos y oculta el resultado consultado', () => {
    dibujarPedido()
    consultarPedido()

    expect(buscarTituloPedido(ordenAna.id)).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Limpiar' })
    )

    expect(
      screen.getByLabelText('ID de la orden').value
    ).toBe('')

    expect(
      screen.getByLabelText('Correo de compra').value
    ).toBe('')

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
  })

  it('oculta el resultado anterior al modificar la consulta', () => {
    dibujarPedido()
    consultarPedido()

    escribir('ID de la orden', 'ORD-OTRA')

    expect(buscarTituloPedido(ordenAna.id)).toBeNull()
    expect(screen.queryByText(ordenAna.direccion)).toBeNull()
  })

  const etapas = [
    {
      estado: 'pendiente',
      titulo: 'Pedido recibido',
      posicion: 0,
    },
    {
      estado: 'procesando',
      titulo: 'En preparación',
      posicion: 1,
    },
    {
      estado: 'enviado',
      titulo: 'Enviado',
      posicion: 2,
    },
    {
      estado: 'completado',
      titulo: 'Entregado',
      posicion: 3,
    },
  ]

  etapas.forEach(({ estado, titulo, posicion }) => {
    it(`marca la etapa actual del pedido ${estado}`, () => {
      almacenamiento.ordenes = JSON.stringify([
        { ...ordenAna, estado },
      ])

      dibujarPedido()
      consultarPedido()

      const seguimiento = obtenerSeguimiento()
      const elementos =
        within(seguimiento).getAllByRole('listitem')

      expect(elementos.length).toBe(4)
      expect(obtenerEtapaActual()).toBe(elementos[posicion])

      expect(
        within(obtenerEtapaActual()).getByText(titulo)
      ).toBeTruthy()

      expect(
        within(obtenerEtapaActual()).getByText('Estado actual')
      ).toBeTruthy()

      elementos.forEach((elemento, indice) => {
        if (indice === posicion) return

        expect(
          within(elemento).getByText(
            indice < posicion
              ? 'Etapa superada'
              : 'Por realizar'
          )
        ).toBeTruthy()
      })
    })
  })

  it('muestra la cancelación sin presentar etapas de entrega', () => {
    almacenamiento.ordenes = JSON.stringify([
      { ...ordenAna, estado: 'cancelado' },
    ])

    dibujarPedido()
    consultarPedido()

    expect(screen.getByRole('note').textContent).toContain(
      'Este pedido fue cancelado.'
    )

    expect(
      screen.queryByRole('region', {
        name: 'Seguimiento del pedido',
      })
    ).toBeNull()
  })

  it('recupera los cambios de estado al actualizar pedidos', () => {
    dibujarPedido()
    consultarPedido()

    expect(
      within(obtenerEtapaActual()).getByText('Pedido recibido')
    ).toBeTruthy()

    almacenamiento.ordenes = JSON.stringify([
      { ...ordenAna, estado: 'enviado' },
    ])

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Actualizar pedidos',
      })
    )

    expect(
      within(obtenerEtapaActual()).getByText('Enviado')
    ).toBeTruthy()
  })
})