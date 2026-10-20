import { Link, useParams } from 'react-router-dom'
import { Alert, Col, Row } from 'react-bootstrap'
import CategoriaCard from '../components/CategoriaCard'
import ProductCard from '../components/ProductCard'
import { obtenerCategorias } from '../utils/categorias'
import '../styles/Productos.css'
import '../styles/Categorias.css'

// /categorias muestra las tarjetas.
// /categorias/:slug muestra además los productos de esa categoría.
function Categorias({ productos, onAgregar }) {
  const { slug } = useParams()

  const categorias = obtenerCategorias(productos)
  const categoriaActiva = categorias.find(categoria => categoria.slug === slug)

  const productosCategoria = categoriaActiva
    ? productos.filter(producto => producto.categoria === categoriaActiva.nombre)
    : []

  return (
    <section className="catalogo-page categorias-page">
      <h1>Categorías</h1>
      <p className="catalogo-subtitulo">Elige una categoría para ver sus productos.</p>

      <Row xs={2} md={4} className="g-3 mb-5">
        {categorias.map(categoria => (
          <Col key={categoria.slug}>
            <CategoriaCard
              nombre={categoria.nombre}
              slug={categoria.slug}
              imagen={categoria.imagen}
              cantidad={categoria.cantidad}
              activa={categoria.slug === slug}
            />
          </Col>
        ))}
      </Row>

      {slug && !categoriaActiva && (
        <Alert variant="warning">
          La categoría no existe. <Link to="/categorias">Ver todas las categorías</Link>
        </Alert>
      )}

      {categoriaActiva && (
        <>
          <h2 className="categorias-titulo">{categoriaActiva.nombre}</h2>

          <Row xs={1} sm={2} lg={3} className="g-4">
            {productosCategoria.map(producto => (
              <Col key={producto.id}>
                <ProductCard
                  id={producto.id}
                  nombre={producto.nombre}
                  categoria={producto.categoria}
                  descripcion={producto.descripcion}
                  precio={producto.precio}
                  imagen={producto.imagen}
                  stock={producto.stock}
                  onAgregar={() => onAgregar(producto)}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </section>
  )
}

export default Categorias