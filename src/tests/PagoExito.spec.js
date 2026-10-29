import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PagoExito from '../pages/PagoExito'

const ordenBase = {
  id: 'ORD-PRUEBA-001',
  fecha: '2026-10-29T13:00:00.000Z',
  estado: 'pendiente',
  nombre: 'Ana Soto',
  email: 'ana@gmail.com',
  telefono: '+56912345678',
  direccion: 'Las Flores 123, Viña del Mar',
  ahorro: 5000,
  total: 40000,
  pagoSimulado: true,
  productos: [{ id: 1, nombre: 'Torta de Chocolate', cantidad: 2, precioFinal: 20000 }],
}

function dibujarPago(id = ordenBase.id) {
  const ruta = id === null ? '/sin-identificador' : `/pago/exito/${encodeURIComponent(id)}`
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/pago/exito/:idOrden" element={<PagoExito />} />
        <Route path="/sin-identificador" element={<PagoExito />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PagoExito: consulta y comprobante', () => {
  let almacenamiento
  let descriptorClipboard
  let escribirPortapapeles
  let descarga
  let relojInstalado

  beforeEach(() => {
    almacenamiento = { ordenes: JSON.stringify([ordenBase]) }
    descarga = null
    relojInstalado = false
    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave) ? almacenamiento[clave] : null
    )

    // Reemplaza el portapapeles durante la prueba; no usa el del equipo.
    descriptorClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    escribirPortapapeles = jasmine.createSpy('writeText').and.returnValue(Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: escribirPortapapeles },
    })

    // Intercepta el archivo y el clic para evitar una descarga real.
    spyOn(URL, 'createObjectURL').and.returnValue('blob:comprobante-prueba')
    spyOn(URL, 'revokeObjectURL').and.stub()
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function () {
      descarga = {
        nombre: this.download,
        href: this.getAttribute('href'),
        conectado: document.body.contains(this),
      }
    })
  })

  afterEach(() => {
    cleanup()
    document.querySelectorAll('a[download]').forEach(enlace => enlace.remove())
    if (relojInstalado) jasmine.clock().uninstall()
    if (descriptorClipboard) {
      Object.defineProperty(navigator, 'clipboard', descriptorClipboard)
    } else {
      delete navigator.clipboard
    }
  })

  function guardarOrden(cambios) {
    almacenamiento.ordenes = JSON.stringify([{ ...ordenBase, ...cambios }])
  }

  function solicitarDescarga() {
    // Controla únicamente el temporizador que libera la URL del archivo.
    jasmine.clock().install()
    relojInstalado = true
    fireEvent.click(screen.getByRole('button', { name: 'Descargar comprobante' }))
  }

  function contenidoDescargado() {
    const archivo = URL.createObjectURL.calls.mostRecent().args[0]
    expect(archivo instanceof Blob).toBe(true)
    expect(archivo.type).toBe('text/plain;charset=utf-8')
    return archivo.text()
  }

  it('muestra la orden pendiente, el detalle y los totales guardados', () => {
    dibujarPago()
    expect(screen.getByRole('heading', { name: '¡Compra registrada!' })).toBeTruthy()
    expect(screen.getByText('Estado: Pendiente')).toBeTruthy()
    expect(screen.getByText(ordenBase.id)).toBeTruthy()
    expect(screen.getByText('Torta de Chocolate × 2')).toBeTruthy()
    expect(screen.getByText('Ahorro total: $5.000')).toBeTruthy()
    expect(screen.getByText('Total de la compra: $40.000')).toBeTruthy()
    expect(screen.getByRole('note').textContent).toContain('pago simulado')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('no confirma una orden cuyo identificador no existe', () => {
    dibujarPago('ORD-INEXISTENTE')
    expect(screen.getByRole('alert').textContent).toContain('No encontramos esta orden')
    expect(screen.queryByRole('heading', { name: '¡Compra registrada!' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Descargar comprobante' })).toBeNull()
    expect(screen.queryByText(ordenBase.direccion)).toBeNull()
  })

  it('informa que no hay orden si el componente no recibe parámetro de ruta', () => {
    dibujarPago(null)
    expect(screen.getByRole('alert').textContent).toContain('No encontramos esta orden')
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  const estados = [
    { valor: 'procesando', texto: 'En preparación', color: 'secondary' },
    { valor: 'enviado', texto: 'Enviado', color: 'secondary' },
    { valor: 'completado', texto: 'Entregado', color: 'success' },
    { valor: 'cancelado', texto: 'Cancelado', color: 'danger' },
  ]

  estados.forEach(({ valor, texto, color }) => {
    it(`presenta el estado ${valor} con el título y etiqueta correspondientes`, () => {
      guardarOrden({ estado: valor })
      dibujarPago()
      const etiqueta = screen.getByText(`Estado: ${texto}`)
      expect(etiqueta.classList.contains(`bg-${color}`)).toBe(true)
      expect(screen.getByRole('heading', {
        name: valor === 'cancelado' ? 'Pedido cancelado' : '¡Compra registrada!',
      })).toBeTruthy()
      if (valor === 'cancelado') {
        expect(screen.getByText('Esta orden figura como cancelada.')).toBeTruthy()
      }
    })
  })

  it('conserva un estado no reconocido para no informar otro estado distinto', () => {
    guardarOrden({ estado: 'En revisión' })
    dibujarPago()
    expect(screen.getByText('Estado: En revisión')).toBeTruthy()
  })

  it('presenta órdenes antiguas sin productos, teléfono, ahorro ni marca de simulación', () => {
    guardarOrden({ estado: '', productos: null, telefono: '', ahorro: 0, pagoSimulado: false, email: '', correo: 'antiguo@gmail.com' })
    dibujarPago()
    expect(screen.getByText('Estado: Pendiente')).toBeTruthy()
    expect(screen.getByText(/antiguo@gmail.com/)).toBeTruthy()
    expect(screen.getByText(/Sin registrar/)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Productos', exact: true })).toBeNull()
    expect(screen.queryByText(/^Ahorro total:/)).toBeNull()
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('copia exactamente el ID y confirma el resultado sin modificar la orden', async () => {
    const antes = almacenamiento.ordenes
    dibujarPago()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar número de orden' }))
    expect((await screen.findByRole('status')).textContent).toContain('Número de orden copiado.')
    expect(escribirPortapapeles).toHaveBeenCalledOnceWith(ordenBase.id)
    expect(almacenamiento.ordenes).toBe(antes)
  })

  it('ofrece copia manual cuando el navegador rechaza el portapapeles', async () => {
    escribirPortapapeles.and.returnValue(Promise.reject(new Error('Permiso rechazado')))
    dibujarPago()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar número de orden' }))
    expect((await screen.findByRole('status')).textContent).toContain('No pudimos copiar automáticamente.')
    expect(screen.getByText(ordenBase.id)).toBeTruthy()
  })

  it('ofrece copia manual cuando el navegador no tiene API de portapapeles', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    dibujarPago()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar número de orden' }))
    expect((await screen.findByRole('status')).textContent).toContain('cópialo manualmente')
    expect(escribirPortapapeles).not.toHaveBeenCalled()
  })

  it('genera el comprobante con productos y totales y libera la URL al terminar', async () => {
    const antes = almacenamiento.ordenes
    dibujarPago()
    solicitarDescarga()
    expect(descarga).toEqual({
      nombre: `comprobante-${ordenBase.id}.txt`,
      href: 'blob:comprobante-prueba',
      conectado: true,
    })
    expect(document.querySelector('a[download]')).toBeNull()
    expect(screen.getByRole('status').textContent).toContain('Se solicitó la descarga del comprobante.')
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    jasmine.clock().tick(1000)
    expect(URL.revokeObjectURL).toHaveBeenCalledOnceWith('blob:comprobante-prueba')
    const texto = await contenidoDescargado()
    expect(texto).toContain(`Número de orden: ${ordenBase.id}`)
    expect(texto).toContain(`Fecha: ${new Date(ordenBase.fecha).toLocaleString('es-CL')}`)
    expect(texto).toContain('Estado: Pendiente')
    expect(texto).toContain('Torta de Chocolate\nCantidad: 2\nPrecio unitario: $20.000\nSubtotal: $40.000')
    expect(texto).toContain('Ahorro total: $5.000')
    expect(texto).toContain('Total de la compra: $40.000')
    expect(texto).toContain('No se realizó ningún cobro real.')
    expect(almacenamiento.ordenes).toBe(antes)
  })

  it('descarga datos de una orden antigua usando los valores alternativos', async () => {
    guardarOrden({ fecha: undefined, estado: undefined, nombre: undefined, email: '', correo: 'antiguo@gmail.com', telefono: '', direccion: '', productos: undefined, ahorro: undefined, pagoSimulado: false })
    dibujarPago()
    solicitarDescarga()
    jasmine.clock().tick(1000)
    const texto = await contenidoDescargado()
    expect(texto).toContain('Fecha: Sin fecha registrada')
    expect(texto).toContain('Estado: Pendiente')
    expect(texto).toContain('Correo: antiguo@gmail.com')
    expect(texto).toContain('Teléfono: Sin registrar')
    expect(texto).toContain('Dirección: Sin registrar')
    expect(texto).toContain('Esta orden no tiene un detalle de productos registrado.')
    expect(texto).toContain('Ahorro total: $0')
    expect(texto).not.toContain('No se realizó ningún cobro real.')
    expect(texto).not.toContain('undefined')
  })

  it('normaliza el nombre del archivo y tolera una fecha inválida y correo ausente', async () => {
    guardarOrden({ id: 'ORD:1', fecha: 'fecha-invalida', estado: 'En revisión', email: '', correo: '' })
    dibujarPago('ORD:1')
    solicitarDescarga()
    jasmine.clock().tick(1000)
    expect(descarga.nombre).toBe('comprobante-ORD_1.txt')
    const texto = await contenidoDescargado()
    expect(texto).toContain('Fecha: Sin fecha registrada')
    expect(texto).toContain('Estado: En revisión')
    expect(texto).toContain('Correo: \n')
  })

  it('muestra un aviso si falla la creación del archivo sin modificar la orden', () => {
    const antes = almacenamiento.ordenes
    URL.createObjectURL.and.throwError('No se puede crear el archivo')
    dibujarPago()
    solicitarDescarga()
    expect(screen.getByRole('status').textContent).toContain('No pudimos descargar el comprobante.')
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled()
    jasmine.clock().tick(1000)
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    expect(almacenamiento.ordenes).toBe(antes)
  })

  it('libera la URL incluso si falla el clic que solicita la descarga', () => {
    HTMLAnchorElement.prototype.click.and.throwError('Descarga bloqueada')
    dibujarPago()
    solicitarDescarga()
    expect(screen.getByRole('status').textContent).toContain('No pudimos descargar el comprobante.')
    jasmine.clock().tick(1000)
    expect(URL.revokeObjectURL).toHaveBeenCalledOnceWith('blob:comprobante-prueba')
  })
})
