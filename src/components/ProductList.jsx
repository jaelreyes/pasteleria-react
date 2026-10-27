import ProductCard from "./ProductCard";
import { useSearchParams } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap";
import "../styles/Productos.css";
import { calcularPrecioProducto } from "../utils/precios";

// Catálogo con búsqueda y filtro por categoría. Los filtros viven en la URL (?q=&categoria=).
function ProductList({ productos, onAgregar, descuentoUsuario = 0 }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const busqueda = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "";

  // Categorías sin repetir para el select.
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

  // Filtra por nombre o código y por categoría.
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.trim().toLowerCase();

    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(texto) ||
      String(producto.codigo || "")
        .toLowerCase()
        .includes(texto);

    const coincideCategoria =
      categoria === "" || producto.categoria === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <section className="catalogo-page">
      <h1>Nuestros Productos</h1>
      <p className="catalogo-subtitulo">Encuentra tu próximo sabor favorito.</p>

      <Form
        className="catalogo-filtros"
        onSubmit={(evento) => evento.preventDefault()}
      >
        <Row className="g-3">
          <Col xs={12} md={8}>
            <Form.Group controlId="busqueda-productos">
              <Form.Label>Buscar productos</Form.Label>

              <Form.Control
                type="search"
                placeholder="Buscar por nombre o código"
                value={busqueda}
                onChange={(evento) =>
                  actualizarFiltro("q", evento.target.value)
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group controlId="categoria-productos">
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
          </Col>
        </Row>
      </Form>

      {productosFiltrados.length === 0 ? (
        <p>No se encontraron productos con esos filtros.</p>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {productosFiltrados.map((producto) => {
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

export default ProductList;
