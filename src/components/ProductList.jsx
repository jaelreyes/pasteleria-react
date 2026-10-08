import ProductCard from "./ProductCard";
import { useSearchParams } from "react-router-dom";
import { Form } from "react-bootstrap";

function ProductList({ productos, onAgregar }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const busqueda = searchParams.get("q") || "";

  function actualizarBusqueda(texto) {
    setSearchParams(texto ? { q: texto } : {});
  }
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );
  return (
    <section>
      <h2>Nuestros productos</h2>
      <Form.Group className="mb-4" controlId="busqueda-productos">
        <Form.Label>Buscar productos</Form.Label>

        <Form.Control
          type="search"
          placeholder="Escribe el nombre de un producto"
          value={busqueda}
          onChange={(evento) => actualizarBusqueda(evento.target.value)}
        />
      </Form.Group>

      {productosFiltrados.length === 0 ? (
        <p>No encontramos productos con ese nombre.</p>
      ) : (
        <div className="product-grid">
          {productosFiltrados.map((producto) => (
            <ProductCard
              key={producto.id}
              nombre={producto.nombre}
              descripcion={producto.descripcion}
              precio={producto.precio}
              imagen={producto.imagen}
              onAgregar={() => onAgregar(producto)}
              id={producto.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductList;
