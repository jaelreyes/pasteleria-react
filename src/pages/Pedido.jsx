import { Link } from 'react-router-dom'
import { Button, ProgressBar } from 'react-bootstrap'
import { cargarPedido } from '../utils/pedidos'
import { formatearPrecio } from '../utils/precios'
import '../styles/Pedido.css'

const ETAPAS_ENVIO = [
  {
    nombre: 'Pedido recibido',
    icono: '📝',
    detalle:
      'Hemos recibido tu pedido y confirmado el pago. Estamos preparando tus dulces.',
  },
  {
    nombre: 'En preparación',
    icono: '🧁',
    detalle:
      'Nuestros reposteros están elaborando tus productos con mucho cariño.',
  },
  {
    nombre: 'Enviado',
    icono: '🚚',
    detalle:
      'Tu pedido salió de nuestra pastelería. Lo recibirás en la fecha estimada.',
  },
  {
    nombre: 'Entregado',
    icono: '🎁',
    detalle:
      '¡Tu pedido fue entregado! Disfruta cada bocado de Pastelería 1000 Sabores.',
  },
]

function Pedido() {
  const pedido = cargarPedido()

  if (!pedido) {
    return (
      <section className="pedido-vacio">
        <h1>Aún no tienes pedidos</h1>
        <p>
          Cuando realices una compra podrás seguir aquí el estado de tu
          pedido.
        </p>
        <Button as={Link} to="/productos" className="carrito-btn-continuar">
          Ir a la tienda
        </Button>
      </section>
    )
  }

  const ultimaEtapa = ETAPAS_ENVIO.length - 1
  const pasoActual = Math.min(pedido.pasoActual || 0, ultimaEtapa)
  const etapa = ETAPAS_ENVIO[pasoActual]
  const avance = Math.round((pasoActual / ultimaEtapa) * 100)

  return (
    <section className="pedido">
      <h1>Mis pedidos</h1>
      <p className="pedido-subtitulo">Sigue el estado de tu envío.</p>

      <div className="pedido-panel">
        <div className="pedido-cabecera">
          <div>
            <span className="pedido-badge">
              {pasoActual === ultimaEtapa ? 'Entregado' : 'En curso'}
            </span>
            <h2>Seguimiento de tu pedido</h2>
            <p>
              Pedido <strong>{pedido.numero}</strong> · realizado el{' '}
              {pedido.fecha}
            </p>
          </div>

          <div className="pedido-entrega">
            <span>Entrega estimada</span>
            <strong>{pedido.fechaEntrega}</strong>
          </div>
        </div>

        <ProgressBar
          now={avance}
          label={`${avance}%`}
          className="pedido-progreso"
        />

        <ol className="pedido-etapas">
          {ETAPAS_ENVIO.map((item, indice) => {
            let clase = 'pedido-etapa'
            if (indice < pasoActual) clase += ' completa'
            if (indice === pasoActual) clase += ' actual'

            return (
              <li key={item.nombre} className={clase}>
                <span className="pedido-etapa-icono">{item.icono}</span>
                <span>{item.nombre}</span>
              </li>
            )
          })}
        </ol>

        <div className="pedido-grid">
          <div className="pedido-tarjeta">
            <h3>Productos del pedido</h3>

            <ul className="pedido-productos">
              {pedido.productos.map(producto => (
                <li key={producto.id}>
                  <img src={producto.imagen} alt={producto.nombre} />
                  <span>
                    {producto.nombre}
                    <small>
                      {producto.cantidad} × {formatearPrecio(producto.precioFinal)}
                    </small>
                  </span>
                  <strong>
                    {formatearPrecio(producto.precioFinal * producto.cantidad)}
                  </strong>
                </li>
              ))}
            </ul>

            {pedido.ahorro > 0 && (
              <p className="pedido-ahorro">
                Ahorraste {formatearPrecio(pedido.ahorro)} ({pedido.descuento}%
                de descuento)
              </p>
            )}

            <p className="pedido-total">
              Total pagado <strong>{formatearPrecio(pedido.total)}</strong>
            </p>
          </div>

          <div className="pedido-tarjeta">
            <h3>Estado actual</h3>
            <p className="pedido-estado">
              <span>{etapa.icono}</span> <strong>{etapa.nombre}</strong>
            </p>
            <p>{etapa.detalle}</p>
          </div>
        </div>

        <div className="pedido-acciones">
          <Button as={Link} to="/productos" className="carrito-btn-continuar">
            Seguir comprando
          </Button>
          <Link to="/contacto">¿Dudas con tu envío? Contáctanos</Link>
        </div>
      </div>
    </section>
  )
}

export default Pedido