import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
} from "react-bootstrap";
import {
  obtenerProductos,
  obtenerUsuarios,
  obtenerUsuarioActivo,
} from "../../data/db";

function limiteCritico(producto) {
  const valor = producto.stockCritico;

  if (valor === "" || valor === null || valor === undefined) {
    return 5;
  }

  const numero = Number(valor);

  return Number.isInteger(numero) && numero >= 0 ? numero : 5;
}

export default function AdminHome({ esAdministrador = false }) {
  const [productos, setProductos] = useState(() => obtenerProductos());

  const [usuarios, setUsuarios] = useState(() =>
    esAdministrador ? obtenerUsuarios() : []
  );

  const usuario = obtenerUsuarioActivo();

  function actualizarResumen() {
    setProductos(obtenerProductos());

    if (esAdministrador) {
      setUsuarios(obtenerUsuarios());
    }
  }

  const stockTotal = productos.reduce(
    (suma, producto) => suma + (Number(producto.stock) || 0),
    0
  );

  const productosCriticos = productos.filter(
    (producto) => Number(producto.stock) < limiteCritico(producto)
  );

  const indicadores = [
    {
      titulo: "Productos en catálogo",
      valor: productos.length,
      color: "#8b4513",
    },
    {
      titulo: "Unidades en stock",
      valor: stockTotal,
      color: "#198754",
    },
    {
      titulo: "Productos con stock crítico",
      valor: productosCriticos.length,
      color: "#dc3545",
    },
    ...(esAdministrador
      ? [
          {
            titulo: "Usuarios registrados",
            valor: usuarios.length,
            color: "#6c757d",
          },
        ]
      : []),
  ];

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold" style={{ color: "#8b4513" }}>
            Inicio del panel
          </h1>

          <p className="text-muted mb-0">
            Hola, {usuario?.nombre || "bienvenido/a"}. Aquí tienes el
            resumen de la pastelería.
          </p>
        </div>

        <Button variant="outline-secondary" onClick={actualizarResumen}>
          Actualizar resumen
        </Button>
      </div>

      <Row className="g-3 mb-4">
        {indicadores.map((indicador) => (
          <Col
            xs={12}
            sm={6}
            lg={esAdministrador ? 3 : 4}
            key={indicador.titulo}
          >
            <Card className="h-100 shadow-sm border-0 text-center p-3">
              <h2 className="h6 text-muted">{indicador.titulo}</h2>

              <p
                className="display-6 fw-bold mb-0"
                style={{ color: indicador.color }}
              >
                {indicador.valor}
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h2 className="h5 mb-3" style={{ color: "#8b4513" }}>
            Accesos rápidos
          </h2>

          <div className="d-flex flex-wrap gap-2">
            <Button
              as={Link}
              to="/admin/productos"
              variant="outline-secondary"
            >
              Consultar productos
            </Button>

            <Button
              as={Link}
              to="/admin/ordenes"
              variant="outline-secondary"
            >
              Gestionar órdenes
            </Button>

            {esAdministrador && (
              <>
                <Button
                  as={Link}
                  to="/admin/usuarios"
                  variant="outline-secondary"
                >
                  Gestionar usuarios
                </Button>

                <Button
                  as={Link}
                  to="/admin/usuarios/nuevo"
                  style={{ background: "#8b4513", border: "none" }}
                >
                  Crear usuario
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white p-3">
          <h2 className="h5 mb-1" style={{ color: "#8b4513" }}>
            Productos que requieren atención
          </h2>

          <p className="text-muted small mb-0">
            Productos cuyo stock está por debajo de su límite crítico.
          </p>
        </Card.Header>

        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Stock</th>
              <th>Límite crítico</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {productosCriticos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No hay productos por debajo de su límite crítico.
                </td>
              </tr>
            ) : (
              productosCriticos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.codigo || "Sin código"}</td>
                  <td>{producto.nombre}</td>
                  <td className="fw-bold text-danger">{producto.stock}</td>
                  <td>{limiteCritico(producto)}</td>
                  <td>
                    <Badge
                      bg={Number(producto.stock) === 0 ? "danger" : "warning"}
                      text={Number(producto.stock) === 0 ? "light" : "dark"}
                    >
                      {Number(producto.stock) === 0
                        ? "Agotado"
                        : "Stock crítico"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Card.Footer className="bg-white">
          <Link to="/admin/productos">Ir a Productos</Link>
        </Card.Footer>
      </Card>
    </Container>
  );
}