import { Modal, Button, Row, Col, Badge } from "react-bootstrap";
import { calcularPrecioProducto, formatearPrecio } from "../../utils/precios";

function ProductDetailModal({ producto, onCerrar }) {
  if (!producto) return null;

  const { precioBase, precioFinal, descuento } = calcularPrecioProducto(
    producto,
    0,
  );

  const limiteGuardado = producto.stockCritico;

  const limiteNumero =
    limiteGuardado === "" ||
    limiteGuardado === null ||
    limiteGuardado === undefined
      ? 5
      : Number(limiteGuardado);

  const stockCritico =
    Number.isInteger(limiteNumero) && limiteNumero >= 0 ? limiteNumero : 5;

  const agotado = Number(producto.stock) === 0;
  const esCritico = Number(producto.stock) <= stockCritico;
  return (
    <Modal
      show
      onHide={onCerrar}
      size="lg"
      centered
      aria-labelledby="detalle-admin-titulo"
    >
      <Modal.Header closeButton>
        <Modal.Title id="detalle-admin-titulo">
          Detalle del producto
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-4">
          <Col xs={12} md={5}>
            {producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-100 rounded"
                style={{
                  aspectRatio: "1",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className="p-4 bg-light rounded text-center">
                Sin imagen registrada
              </div>
            )}
          </Col>

          <Col xs={12} md={7}>
            <Badge bg="secondary" className="mb-3">
              {producto.categoria || "Sin categoría"}
            </Badge>

            <h2 className="h4" style={{ color: "#8b4513" }}>
              {producto.nombre}
            </h2>

            <p className="text-muted">
              Código: <strong>{producto.codigo || "Sin código"}</strong>
            </p>

            <p style={{ whiteSpace: "pre-wrap" }}>
              {producto.descripcion || "Sin descripción registrada."}
            </p>

            <hr />

            <dl className="row mb-0">
              <dt className="col-7">Precio base</dt>
              <dd className="col-5 text-end">{formatearPrecio(precioBase)}</dd>

              <dt className="col-7">Descuento del producto</dt>
              <dd className="col-5 text-end">{descuento}%</dd>

              <dt className="col-7">Precio con oferta</dt>
              <dd className="col-5 text-end fw-bold text-success">
                {formatearPrecio(precioFinal)}
              </dd>

              <dt className="col-7">Stock disponible</dt>
              <dd className="col-5 text-end">{producto.stock} unidades</dd>

              <dt className="col-7">Límite de stock crítico</dt>
              <dd className="col-5 text-end">{stockCritico} unidades</dd>
            </dl>

            <div className="mt-3">
              {agotado ? (
                <Badge bg="danger">Agotado</Badge>
              ) : esCritico ? (
                <Badge bg="warning" text="dark">
                  Stock crítico
                </Badge>
              ) : (
                <Badge bg="success">Disponible</Badge>
              )}
            </div>

            <p className="small text-muted mt-3 mb-0">
              El precio mostrado incluye la oferta del producto. Los beneficios
              personales se aplican en la tienda.
            </p>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCerrar}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetailModal;
