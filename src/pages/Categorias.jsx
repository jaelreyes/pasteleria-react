// PESTAÑA 2 · Categorías de la tienda (/categorias y /categorias/:slug).
import { Link, useParams } from "react-router-dom";
import { Alert, Col, Row } from "react-bootstrap";
import CategoriaCard from "../components/CategoriaCard";
import ProductCard from "../components/ProductCard";
import { obtenerCategorias } from "../utils/categorias";
import "../styles/Productos.css";
import "../styles/Categorias.css";
import { calcularPrecioProducto } from "../utils/precios";

// /categorias muestra las tarjetas.
// /categorias/:slug muestra además los productos de esa categoría.
function Categorias({ productos, onAgregar, descuentoUsuario = 0 }) {
  // slug = categoría de la URL, ej: "tortas-cuadradas". En /categorias no viene (undefined).
  const { slug } = useParams();

  // Arma la lista de categorías a partir de los productos (utils/categorias.js).
  const categorias = obtenerCategorias(productos);
  // Categoría elegida según el slug de la URL.
  const categoriaActiva = categorias.find(
    (categoria) => categoria.slug === slug,
  );

  // Productos que pertenecen a la categoría elegida.
  const productosCategoria = categoriaActiva
    ? productos.filter(
        (producto) => producto.categoria === categoriaActiva.nombre,
      )
    : [];

  return (
    <section className="catalogo-page categorias-page">
      <h1>Categorías</h1>
      <p className="catalogo-subtitulo">
        Elige una categoría para ver sus productos.
      </p>

      <Row xs={2} md={4} className="g-3 mb-5">
        {/* Una tarjeta por categoría; la del slug actual se marca como activa */}
        {categorias.map((categoria) => (
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

      {/* El slug no corresponde a ninguna categoría */}
      {slug && !categoriaActiva && (
        <Alert variant="warning">
          La categoría no existe.{" "}
          <Link to="/categorias">Ver todas las categorías</Link>
        </Alert>
      )}

      {/* Si hay una categoría elegida, se muestran sus productos */}
      {categoriaActiva && (
        <>
          <h2 className="categorias-titulo">{categoriaActiva.nombre}</h2>

          <Row xs={1} sm={2} lg={3} className="g-4">
            {productosCategoria.map((producto) => {
              // Precio con el mayor descuento: oferta del producto o beneficio del usuario.
              const { precioBase, precioFinal, descuento } =
                calcularPrecioProducto(producto, descuentoUsuario);

              return (
                <Col key={producto.id}>
                  <ProductCard
                    id={producto.id}
                    nombre={producto.nombre}
                    categoria={producto.categoria}
                    descripcion={producto.descripcion}
                    precio={precioFinal}
                    precioAnterior={precioBase}
                    descuento={descuento}
                    imagen={producto.imagen}
                    stock={producto.stock}
                    onAgregar={() => onAgregar(producto)}
                  />
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </section>
  );
}

export default Categorias;
