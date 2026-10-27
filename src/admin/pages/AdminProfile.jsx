import { Navigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
} from "react-bootstrap";
import { obtenerUsuarioActivo } from "../../data/db";

// Perfil del usuario del panel: datos de la cuenta y permisos según su rol.
export function AdminProfile() {
  const usuario = obtenerUsuarioActivo();

  // Sin sesión, o con un rol sin acceso, vuelve al login o a la tienda.
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const rol = String(usuario.rol || usuario.tipo || "")
    .trim()
    .toLowerCase();

  const esAdministrador =
    rol === "admin" || rol === "administrador";

  const esVendedor = rol === "vendedor";

  if (!esAdministrador && !esVendedor) {
    return <Navigate to="/" replace />;
  }

  const nombreRol = esAdministrador
    ? "Administrador"
    : "Vendedor";

  const nombreCompleto = [
    usuario.nombre,
    usuario.apellidos,
  ]
    .filter(Boolean)
    .join(" ");

  // Lista de permisos que se muestra según el rol.
  const permisos = [
    {
      modulo: "Productos",
      descripcion: esAdministrador
        ? "Crear, consultar, editar y eliminar productos."
        : "Consultar productos, revisar su detalle, filtrar y ordenar.",
    },
    {
      modulo: "Órdenes",
      descripcion:
        "Consultar pedidos, cambiar sus estados y exportar reportes.",
    },
    ...(esAdministrador
      ? [
          {
            modulo: "Usuarios",
            descripcion:
              "Crear, consultar y editar usuarios. Eliminar cuentas según las restricciones del panel.",
          },
        ]
      : []),
    {
      modulo: "Mi Perfil",
      descripcion:
        "Consultar los datos de la sesión y los permisos asignados.",
    },
  ];

  return (
    <Container className="my-4">
      <h1
        className="mb-3"
        style={{
          fontFamily: '"Pacifico", cursive',
          color: "#8b4513",
          fontSize: "clamp(1.6rem, 4vw, 2rem)",
        }}
      >
        Mi Perfil
      </h1>

      <p className="text-muted mb-4">
        Información de tu cuenta y permisos actuales en el sistema.
      </p>

      {/* Datos de la cuenta y tabla de permisos */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3 p-sm-4">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: "70px",
                height: "70px",
                flexShrink: 0,
                background: "#8b4513",
                fontSize: "1.8rem",
              }}
              aria-hidden="true"
            >
              {usuario.nombre?.charAt(0).toUpperCase() || "U"}
            </div>

            <div
              style={{
                minWidth: 0,
                flex: "1 1 180px",
                overflowWrap: "anywhere",
              }}
            >
              <h2 className="h4 mb-1" style={{ color: "#8b4513" }}>
                {nombreCompleto || "Usuario"}
              </h2>

              <p className="text-muted mb-2">
                {usuario.email || usuario.correo || "Sin correo registrado"}
              </p>

              <Badge
                bg={esAdministrador ? "danger" : "warning"}
                text={esAdministrador ? "light" : "dark"}
                className="px-3 py-2"
              >
                {nombreRol}
              </Badge>
            </div>
          </div>

          <hr className="my-4" />

          <h2 className="h5 mb-3" style={{ color: "#8b4513" }}>
            Datos de la sesión
          </h2>

          <Row className="g-3 mb-4">
            <Col xs={12} md={6}>
              <div className="p-3 bg-light rounded h-100">
                <span className="text-muted d-block mb-1">
                  RUN
                </span>
                <strong>{usuario.run || "Sin registrar"}</strong>
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className="p-3 bg-light rounded h-100">
                <span className="text-muted d-block mb-1">
                  Nivel de permisos
                </span>

                <strong>
                  {esAdministrador
                    ? "Administración del sistema"
                    : "Consulta de catálogo y gestión de órdenes"}
                </strong>
              </div>
            </Col>
          </Row>

          <h2 className="h5 mb-3" style={{ color: "#8b4513" }}>
            Módulos habilitados
          </h2>

          <Row className="g-3">
            {permisos.map((permiso) => (
              <Col xs={12} md={6} key={permiso.modulo}>
                <article
                  className="p-3 rounded h-100"
                  style={{
                    background: "#fff5e1",
                    border: "1px solid #ffc0cb",
                  }}
                >
                  <h3
                    className="h6 fw-bold mb-2"
                    style={{ color: "#8b4513" }}
                  >
                    {permiso.modulo}
                  </h3>

                  <p className="mb-0">{permiso.descripcion}</p>
                </article>
              </Col>
            ))}
          </Row>

          <p className="small text-muted mt-4 mb-0">
            Si un administrador cambia tus datos o tu rol, vuelve a
            iniciar sesión para actualizar esta información.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminProfile;