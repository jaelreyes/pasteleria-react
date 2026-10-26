import { useState } from "react";
import {
  obtenerUsuarios,
  obtenerUsuarioActivo,
  eliminarUsuario,
} from "../../data/db";
import regionesComunas from "../../data/regiones-comunas";
import {
  normalizarRun,
  validarRun,
  validarCorreo,
  validarTelefono,
  calcularEdad,
} from "../../utils/validaciones";
import {
  Table,
  Button,
  Form,
  Container,
  Row,
  Col,
  Card,
  Badge,
  Modal,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const ROLES = {
  admin: "Administrador",
  vendedor: "Vendedor",
  cliente: "Cliente",
};

const CORREOS_DEMO = ["admin@duoc.cl", "vendedor@duoc.cl", "cliente@gmail.com"];

function correoUsuario(usuario) {
  return String(usuario?.email || usuario?.correo || "")
    .trim()
    .toLowerCase();
}

function rolUsuario(usuario) {
  const rol = String(usuario?.rol || usuario?.tipo || "cliente")
    .trim()
    .toLowerCase();

  return rol === "administrador" ? "admin" : rol;
}

function esCuentaDemo(usuario) {
  return CORREOS_DEMO.includes(correoUsuario(usuario));
}

export function UsersAdmin() {
  const [usuarios, setUsuarios] = useState(() => obtenerUsuarios());
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [criterioOrden, setCriterioOrden] = useState({
    campo: "nombre",
    direccion: "asc",
  });

  const [detalle, setDetalle] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [mensaje, setMensaje] = useState("");

  const regionSeleccionada = regionesComunas.find(
    (item) => item.region === form.region,
  );

  const comunas = regionSeleccionada
    ? [...new Set(regionSeleccionada.comunas)]
    : [];

  function abrirEditar(usuario) {
    setUsuarioEditando(usuario);
    setErrorModal("");

    setForm({
      run: usuario.run || "",
      nombre: usuario.nombre || "",
      apellidos: usuario.apellidos || "",
      correo: correoUsuario(usuario),
      fechaNacimiento: usuario.fechaNacimiento || "",
      telefono: usuario.telefono || "",
      region: usuario.region || "",
      comuna: usuario.comuna || "",
      direccion: usuario.direccion || "",
      rol: rolUsuario(usuario),
    });
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setForm((actual) => ({
      ...actual,
      [name]: value,
      ...(name === "region" ? { comuna: "" } : {}),
    }));

    setErrorModal("");
  }

  function guardarCambios(evento) {
    evento.preventDefault();

    if (!usuarioEditando) return;

    setErrorModal("");

    const nombre = form.nombre.trim();
    const apellidos = form.apellidos.trim();
    const correo = form.correo.trim().toLowerCase();
    const run = form.run.trim() ? normalizarRun(form.run) : "";

    if (nombre.length < 2 || nombre.length > 50) {
      setErrorModal("El nombre debe tener entre 2 y 50 caracteres.");
      return;
    }

    if (apellidos.length > 100) {
      setErrorModal("Los apellidos deben tener como máximo 100 caracteres.");
      return;
    }

    if (!validarCorreo(correo)) {
      setErrorModal("Ingresa un correo válido de los dominios permitidos.");
      return;
    }

    if (run && !validarRun(run)) {
      setErrorModal("Ingresa un RUN válido con su dígito verificador.");
      return;
    }

    if (!validarTelefono(form.telefono)) {
      setErrorModal("Ingresa un teléfono válido de 8 a 15 dígitos.");
      return;
    }

    if (form.direccion.trim().length > 300) {
      setErrorModal("La dirección debe tener como máximo 300 caracteres.");
      return;
    }

    if (form.fechaNacimiento) {
      const fecha = new Date(`${form.fechaNacimiento}T00:00:00`);
      const edad = calcularEdad(form.fechaNacimiento);

      if (Number.isNaN(fecha.getTime()) || fecha > new Date() || edad > 120) {
        setErrorModal("Ingresa una fecha de nacimiento válida.");
        return;
      }
    }

    if (form.region && !regionSeleccionada) {
      setErrorModal("Selecciona una región válida.");
      return;
    }

    if (
      (form.region && !comunas.includes(form.comuna)) ||
      (!form.region && form.comuna)
    ) {
      setErrorModal("Selecciona una comuna de la región elegida.");
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(ROLES, form.rol)) {
      setErrorModal("Selecciona un rol válido.");
      return;
    }

    const correoOriginal = correoUsuario(usuarioEditando);

    // Las cuentas demo se inicializan con credenciales y roles fijos.
    if (
      esCuentaDemo(usuarioEditando) &&
      (correo !== correoOriginal || form.rol !== rolUsuario(usuarioEditando))
    ) {
      setErrorModal("El correo y el rol de las cuentas demo son fijos.");
      return;
    }

    // Evita crear otra cuenta con uno de los correos reservados.
    if (correo !== correoOriginal && CORREOS_DEMO.includes(correo)) {
      setErrorModal("Ese correo está reservado para una cuenta demo.");
      return;
    }

    try {
      const actuales = obtenerUsuarios();
      const indice = actuales.findIndex(
        (usuario) => correoUsuario(usuario) === correoOriginal,
      );

      if (indice === -1) {
        setErrorModal("El usuario ya no existe. Cierra y actualiza la página.");
        return;
      }

      const correoRepetido = actuales.some(
        (usuario, posicion) =>
          posicion !== indice && correoUsuario(usuario) === correo,
      );

      const runRepetido =
        run &&
        actuales.some(
          (usuario, posicion) =>
            posicion !== indice &&
            normalizarRun(String(usuario.run || "")) === run,
        );

      if (correoRepetido) {
        setErrorModal("Ya existe una cuenta con ese correo.");
        return;
      }

      if (runRepetido) {
        setErrorModal("Ya existe una cuenta con ese RUN.");
        return;
      }

      const edad = form.fechaNacimiento
        ? calcularEdad(form.fechaNacimiento)
        : null;

      const descuentoEdad = edad !== null && edad >= 50 && edad <= 120 ? 50 : 0;

      const codigo = String(actuales[indice].codigoPromocional || "")
        .trim()
        .toUpperCase();

      const descuentoCodigo = codigo === "FELICES50" ? 10 : 0;

      const tortaGratisDuoc = [
        "duoc.cl",
        "profesor.duoc.cl",
        "duocuc.cl",
      ].includes(correo.split("@")[1]);

      const beneficios = [];

      if (descuentoEdad) {
        beneficios.push("50% de descuento de por vida por edad.");
      }

      if (descuentoCodigo) {
        beneficios.push("10% de descuento de por vida por FELICES50.");
      }

      if (tortaGratisDuoc) {
        beneficios.push(
          "Torta gratis en tu cumpleaños por ser de la comunidad Duoc.",
        );
      }

      const actualizado = {
        ...actuales[indice],
        run,
        nombre,
        apellidos,
        correo,
        email: correo,
        fechaNacimiento: form.fechaNacimiento || null,
        telefono: form.telefono.trim() || null,
        region: form.region,
        comuna: form.comuna,
        direccion: form.direccion.trim(),
        rol: form.rol,
        tipo: ROLES[form.rol],
        descuentoEdad,
        descuentoCodigo,
        tortaGratisDuoc,
        beneficios,
      };

      const lista = actuales.map((usuario, posicion) =>
        posicion === indice ? actualizado : usuario,
      );

      localStorage.setItem("usuarios", JSON.stringify(lista));
      setUsuarios(lista);
      setUsuarioEditando(null);
      setError("");
      setMensaje(
        "Usuario actualizado correctamente. Si tenía una sesión abierta, debe volver a iniciar sesión para actualizar sus datos y beneficios.",
      );
    } catch {
      setErrorModal("No se pudieron guardar los cambios en este navegador.");
    }
  }

  function handleEliminar(usuario) {
    setError("");
    setMensaje("");

    if (esCuentaDemo(usuario)) {
      setError("Las cuentas demo se conservan para las pruebas del proyecto.");
      return;
    }

    const activo = obtenerUsuarioActivo();

    if (activo && correoUsuario(activo) === correoUsuario(usuario)) {
      setError("No puedes eliminar la cuenta con la que estás trabajando.");
      return;
    }

    try {
      const correo = usuario.email || usuario.correo;

      eliminarUsuario(correo);

      const actuales = obtenerUsuarios();

      if (
        actuales.some((item) => correoUsuario(item) === correoUsuario(usuario))
      ) {
        setError("No se pudo eliminar el usuario.");
        return;
      }

      setUsuarios(actuales);
      setMensaje("Usuario eliminado correctamente.");
    } catch {
      setError("Ocurrió un error al eliminar el usuario.");
    }
  }

  function ordenarPor(campo) {
    setCriterioOrden((actual) => ({
      campo,
      direccion:
        actual.campo === campo && actual.direccion === "asc" ? "desc" : "asc",
    }));
  }

  function valorOrden(usuario) {
    if (criterioOrden.campo === "correo") {
      return correoUsuario(usuario);
    }

    if (criterioOrden.campo === "rol") {
      return ROLES[rolUsuario(usuario)] || rolUsuario(usuario);
    }

    return `${usuario.nombre || ""} ${usuario.apellidos || ""}`;
  }

  const usuariosMostrados = usuarios
    .filter((usuario) => {
      const texto = [
        usuario.nombre,
        usuario.apellidos,
        usuario.run,
        correoUsuario(usuario),
      ]
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(busqueda.trim().toLowerCase()) &&
        (!filtroRol || rolUsuario(usuario) === filtroRol)
      );
    })
    .sort((a, b) => {
      const resultado = valorOrden(a).localeCompare(valorOrden(b), "es", {
        sensitivity: "base",
        numeric: true,
      });

      return criterioOrden.direccion === "asc" ? resultado : -resultado;
    });

  const indicadores = [
    { titulo: "Total Usuarios", cantidad: usuarios.length },
    {
      titulo: "Administradores",
      cantidad: usuarios.filter((u) => rolUsuario(u) === "admin").length,
    },
    {
      titulo: "Vendedores",
      cantidad: usuarios.filter((u) => rolUsuario(u) === "vendedor").length,
    },
    {
      titulo: "Clientes",
      cantidad: usuarios.filter((u) => rolUsuario(u) === "cliente").length,
    },
  ];

  function campo(nombre, etiqueta, opciones = {}) {
    return (
      <Form.Group controlId={`usuario-${nombre}`}>
        <Form.Label>{etiqueta}</Form.Label>
        <Form.Control
          {...opciones}
          name={nombre}
          value={form[nombre] || ""}
          onChange={actualizarCampo}
        />
      </Form.Group>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="fw-bold" style={{ color: "#8b4513" }}>
        Gestión de Usuarios
      </h2>

      <p className="text-muted">Consulta y edición de cuentas registradas.</p>

      <Button
        as={Link}
        to="/admin/usuarios/nuevo"
        className="mb-4"
        style={{ background: "#8b4513", border: "none" }}
      >
        Crear usuario
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Row className="g-3 mb-4">
        {indicadores.map((indicador) => (
          <Col xs={12} sm={6} lg={3} key={indicador.titulo}>
            <Card className="shadow-sm border-0 p-3 text-center">
              <h6 className="text-muted">{indicador.titulo}</h6>
              <h3 className="fw-bold mb-0">{indicador.cantidad}</h3>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="shadow-sm border-0 p-3 mb-4">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group controlId="usuarios-busqueda">
              <Form.Label>Buscar usuarios</Form.Label>
              <Form.Control
                type="search"
                placeholder="Nombre, apellidos, correo o RUN"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="usuarios-filtro-rol">
              <Form.Label>Filtrar por rol</Form.Label>
              <Form.Select
                value={filtroRol}
                onChange={(evento) => setFiltroRol(evento.target.value)}
              >
                <option value="">Todos los roles</option>
                {Object.entries(ROLES).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm border-0">
        <Table responsive hover striped className="mb-0 align-middle">
          <thead>
            <tr>
              {[
                { campo: "nombre", titulo: "Nombre" },
                { campo: "correo", titulo: "Correo Electrónico" },
                { campo: "rol", titulo: "Rol" },
              ].map(({ campo: nombreCampo, titulo }) => (
                <th
                  key={nombreCampo}
                  aria-sort={
                    criterioOrden.campo !== nombreCampo
                      ? "none"
                      : criterioOrden.direccion === "asc"
                        ? "ascending"
                        : "descending"
                  }
                >
                  <Button
                    variant="link"
                    className="p-0 fw-bold text-decoration-none"
                    style={{ color: "#8b4513" }}
                    onClick={() => ordenarPor(nombreCampo)}
                  >
                    {titulo}{" "}
                    {criterioOrden.campo === nombreCampo
                      ? criterioOrden.direccion === "asc"
                        ? "↑"
                        : "↓"
                      : "↕"}
                  </Button>
                </th>
              ))}

              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosMostrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No se encontraron usuarios con esos filtros.
                </td>
              </tr>
            ) : (
              usuariosMostrados.map((usuario) => (
                <tr key={correoUsuario(usuario)}>
                  <td className="fw-bold">
                    {usuario.nombre} {usuario.apellidos}
                  </td>

                  <td>{correoUsuario(usuario)}</td>

                  <td>
                    <Badge
                      bg={
                        rolUsuario(usuario) === "admin"
                          ? "danger"
                          : rolUsuario(usuario) === "vendedor"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {ROLES[rolUsuario(usuario)] || rolUsuario(usuario)}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setDetalle(usuario)}
                      >
                        Ver detalle
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => abrirEditar(usuario)}
                      >
                        Editar datos
                      </Button>
                      
                      <Button
                        as={Link}
                        to={`/admin/usuarios/${encodeURIComponent(
                          correoUsuario(usuario)
                        )}/historial`}
                        variant="outline-success"
                        size="sm"
                      >
                        Historial
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={esCuentaDemo(usuario)}
                        onClick={() => handleEliminar(usuario)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Card.Footer className="bg-white text-muted small">
          Mostrando {usuariosMostrados.length} de {usuarios.length} usuarios.
        </Card.Footer>
      </Card>

      <Modal
        show={Boolean(detalle)}
        onHide={() => setDetalle(null)}
        centered
        size="lg"
        aria-labelledby="usuario-detalle-titulo"
      >
        <Modal.Header closeButton>
          <Modal.Title id="usuario-detalle-titulo">
            Detalle del usuario
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {detalle && (
            <>
              <dl className="row">
                {[
                  [
                    "Nombre",
                    `${detalle.nombre || ""} ${detalle.apellidos || ""}`,
                  ],
                  ["RUN", detalle.run],
                  ["Correo", correoUsuario(detalle)],
                  ["Rol", ROLES[rolUsuario(detalle)] || rolUsuario(detalle)],
                  ["Fecha de nacimiento", detalle.fechaNacimiento],
                  ["Teléfono", detalle.telefono],
                  ["Región", detalle.region],
                  ["Comuna", detalle.comuna],
                  ["Dirección", detalle.direccion],
                ].map(([etiqueta, valor]) => (
                  <div className="row mb-2" key={etiqueta}>
                    <dt className="col-sm-4">{etiqueta}</dt>
                    <dd
                      className="col-sm-8 mb-0"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {valor || "Sin registrar"}
                    </dd>
                  </div>
                ))}
              </dl>

              <h3 className="h6">Beneficios</h3>

              {detalle.beneficios?.length ? (
                <ul>
                  {detalle.beneficios.map((beneficio) => (
                    <li key={beneficio}>{beneficio}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Sin beneficios registrados.</p>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetalle(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={Boolean(usuarioEditando)}
        onHide={() => setUsuarioEditando(null)}
        centered
        size="lg"
        aria-labelledby="usuario-editar-titulo"
      >
        <Modal.Header closeButton>
          <Modal.Title id="usuario-editar-titulo">
            Editar datos del usuario
          </Modal.Title>
        </Modal.Header>

        <Form noValidate onSubmit={guardarCambios}>
          <Modal.Body>
            {errorModal && (
              <Alert variant="danger" role="alert">
                {errorModal}
              </Alert>
            )}

            {esCuentaDemo(usuarioEditando) && (
              <Alert variant="info">
                Esta es una cuenta demo. Su correo y rol se mantienen fijos;
                puedes editar los demás datos.
              </Alert>
            )}

            <Row className="g-3">
              <Col md={6}>
                {campo("nombre", "Nombre *", {
                  maxLength: 50,
                  required: true,
                })}
              </Col>

              <Col md={6}>
                {campo("apellidos", "Apellidos", { maxLength: 100 })}
              </Col>

              <Col md={6}>
                {campo("run", "RUN", { placeholder: "19.011.022-2" })}
              </Col>

              <Col md={6}>
                {campo("correo", "Correo electrónico *", {
                  type: "email",
                  maxLength: 100,
                  required: true,
                  disabled: esCuentaDemo(usuarioEditando),
                })}
              </Col>

              <Col md={6}>
                {campo("fechaNacimiento", "Fecha de nacimiento", {
                  type: "date",
                })}
              </Col>

              <Col md={6}>
                {campo("telefono", "Teléfono", {
                  type: "tel",
                  maxLength: 20,
                })}
              </Col>

              <Col md={6}>
                <Form.Group controlId="usuario-region">
                  <Form.Label>Región</Form.Label>
                  <Form.Select
                    name="region"
                    value={form.region || ""}
                    onChange={actualizarCampo}
                  >
                    <option value="">Sin región</option>
                    {regionesComunas.map((item) => (
                      <option key={item.region} value={item.region}>
                        {item.region}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="usuario-comuna">
                  <Form.Label>Comuna</Form.Label>
                  <Form.Select
                    name="comuna"
                    value={form.comuna || ""}
                    onChange={actualizarCampo}
                    disabled={!form.region}
                  >
                    <option value="">Selecciona una comuna</option>
                    {comunas.map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                {campo("direccion", "Dirección", { maxLength: 300 })}
              </Col>

              <Col xs={12}>
                <Form.Group controlId="usuario-rol">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="rol"
                    value={form.rol || "cliente"}
                    onChange={actualizarCampo}
                    disabled={esCuentaDemo(usuarioEditando)}
                  >
                    {Object.entries(ROLES).map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>
                        {etiqueta}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setUsuarioEditando(null)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              style={{ background: "#8b4513", border: "none" }}
            >
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default UsersAdmin;
