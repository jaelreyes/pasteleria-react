import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function ProductCard({
  id,
  nombre,
  descripcion,
  precio,
  imagen,
  stock,
  onAgregar,
}) {
  return (
    <Card className="product-card h-100">
      <Card.Img variant="top" src={imagen} alt={nombre} />

      <Card.Body>
        <Card.Title as="h3">{nombre}</Card.Title>

        <Card.Text>{descripcion}</Card.Text>

        <Card.Text>Precio: ${precio.toLocaleString("es-CL")}</Card.Text>

        <Button variant="primary" onClick={onAgregar} disabled={stock === 0}>
          {stock === 0 ? "Agotado" : "Agregar al carrito"}
        </Button>

        <Button
          as={Link}
          to={`/productos/${id}`}
          variant="outline-secondary"
          className="ms-2"
        >
          Ver detalle
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
