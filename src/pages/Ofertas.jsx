import { Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import ProductCard from "../components/ProductCard";
import { obtenerOfertas, calcularPrecioProducto } from "../utils/precios";
import "../styles/Productos.css";

// Vista Ofertas: solo productos con descuento (/ofertas).
function Ofertas({ productos, onAgregar, descuentoUsuario = 0 }) {
  const ofertas = obtenerOfertas(productos);

  return (
    <section className="catalogo-page">
      <h1>Ofertas</h1>
      <p className="catalogo-subtitulo">
        Productos con descuento por tiempo limitado.
      </p>

      {ofertas.length === 0 ? (
        <p className="text-center">
          No hay ofertas disponibles.{" "}
          <Link to="/productos">Ver todos los productos</Link>
        </p>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {ofertas.map((producto) => {
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
      )}
    </section>
  );
}

export default Ofertas;
