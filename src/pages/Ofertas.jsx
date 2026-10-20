import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import { obtenerOfertas, precioConOferta } from '../utils/precios'
import '../styles/Productos.css'

function Ofertas({ productos, onAgregar }) {
  const ofertas = obtenerOfertas(productos)

  return (
    <section className="catalogo-page">
      <h1>Ofertas</h1>
      <p className="catalogo-subtitulo">Productos con descuento por tiempo limitado.</p>

      {ofertas.length === 0 ? (
        <p className="text-center">
          No hay ofertas disponibles. <Link to="/productos">Ver todos los productos</Link>
        </p>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {ofertas.map(producto => {
            const precioOferta = precioConOferta(producto)

            return (
              <Col key={producto.id}>
                <ProductCard
                  id={producto.id}
                  nombre={producto.nombre}
                  categoria={producto.categoria}
                  descripcion={producto.descripcion}
                  precio={precioOferta}
                  precioAnterior={producto.precio}
                  descuento={producto.descuento}
                  imagen={producto.imagen}
                  stock={producto.stock}
                  onAgregar={() => onAgregar({ ...producto, precio: precioOferta })}
                />
              </Col>
            )
          })}
        </Row>
      )}
    </section>
  )
}

export default Ofertas