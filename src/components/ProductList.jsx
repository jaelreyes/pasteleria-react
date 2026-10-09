import ProductCard from "./ProductCard";
import { useSearchParams } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap";

function ProductList({ productos, onAgregar }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const busqueda = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "";

  const categorias = [
    ...new Set(productos.map((producto) => producto.categoria)),
  ];

  // Actualiza un filtro en la URL conservando los demás parámetros.
  function actualizarFiltro(nombre, valor) {
    const nuevosParams = new URLSearchParams(searchParams);

    if (valor) {
      nuevosParams.set(nombre, valor);
    } else {
      nuevosParams.delete(nombre);
    }

    setSearchParams(nuevosParams);
  }

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "" || producto.categoria === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <section>
      <h2>Nuestros productos</h2>
      <Form.Group className="mb-4" controlId="busqueda-productos">
        <Form.Label>Buscar productos</Form.Label>

        <Form.Control
          type="search"
          placeholder="Escribe el nombre de un producto"
          value={busqueda}
          onChange={(evento) => actualizarFiltro("q", evento.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-4" controlId="categoria-productos">
        <Form.Label>Categoría</Form.Label>

        <Form.Select
          value={categoria}
          onChange={(evento) =>
            actualizarFiltro("categoria", evento.target.value)
          }
        >
          <option value="">Todas las categorías</option>

          {categorias.map((nombreCategoria) => (
            <option key={nombreCategoria} value={nombreCategoria}>
              {nombreCategoria}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {productosFiltrados.length === 0 ? (
        <p>No encontramos productos con ese nombre.</p>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {productosFiltrados.map((producto) => (
            <Col key={producto.id}>
              <ProductCard
                id={producto.id}
                nombre={producto.nombre}
                descripcion={producto.descripcion}
                precio={producto.precio}
                imagen={producto.imagen}
                stock={producto.stock}
                onAgregar={() => onAgregar(producto)}
              />
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}

export default ProductList;
