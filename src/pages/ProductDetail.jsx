import { Link, useParams, useNavigate } from 'react-router-dom'
import productos from "../data/productos";

function ProductDetail({ onAgregar }) {
  const { id } = useParams();
  const navegar = useNavigate()
  const producto = productos.find((producto) => producto.id === Number(id));

  if (!producto) {
    return (
      <section>
        <h2>Producto no encontrado</h2>
        <Link to="/productos">Volver al catálogo</Link>
      </section>
    );
  }

  function agregarYVerCarrito() {
  onAgregar(producto)
  navegar('/carrito')
}

  return (
    <section>
      <h2>{producto.nombre}</h2>

      <img
        className="product-detail-image"
        src={producto.imagen}
        alt={producto.nombre}
      />

      <p>{producto.descripcion}</p>
      <p>Precio: ${producto.precio.toLocaleString("es-CL")}</p>

      <p>Stock disponible: {producto.stock} unidades</p>

      <button
        onClick={agregarYVerCarrito}
        disabled={producto.stock === 0}
      >
        {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
      </button>

      <p>
        <Link to="/productos">Volver al catálogo</Link>
      </p>
    </section>
  );
}

export default ProductDetail;
