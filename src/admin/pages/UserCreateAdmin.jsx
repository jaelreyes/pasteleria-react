import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
} from "react-bootstrap";
import { obtenerUsuarios } from "../../data/db";
import regionesComunas from "../../data/regiones-comunas";
import {
  normalizarRun,
  validarRun,
  validarCorreo,
  validarPassword,
  validarTelefono,
  calcularEdad,
} from "../../utils/validaciones";

const datosIniciales = {
  run: "",
  nombre: "",
  apellidos: "",
  correo: "",
  fechaNacimiento: "",
  telefono: "",
  region: "",
  comuna: "",
  direccion: "",
  password: "",
  confirmPassword: "",
  codigoPromocional: "",
  rol: "cliente",
};

const ROLES = {
  admin: "Administrador",
  vendedor: "Vendedor",
  cliente: "Cliente",
};

const campos = [
  {
    nombre: "run",
    etiqueta: "RUN *",
    placeholder: "19.011.022-2",
    required: true,
  },
  {
    nombre: "nombre",
    etiqueta: "Nombre *",
    maxLength: 50,
    required: true,
  },
  {
    nombre: "apellidos",
    etiqueta: "Apellidos *",
    maxLength: 100,
    required: true,
  },
  {
    nombre: "correo",
    etiqueta: "Correo electrónico *",
    type: "email",
    maxLength: 100,
    required: true,
  },
  {
    nombre: "fechaNacimiento",
    etiqueta: "Fecha de nacimiento",
    type: "date",
  },
  {
    nombre: "telefono",
    etiqueta: "Teléfono",
    type: "tel",
    maxLength: 20,
  },
  {
    nombre: "direccion",
    etiqueta: "Dirección *",
    maxLength: 300,
    required: true,
  },
  {
    nombre: "codigoPromocional",
    etiqueta: "Código promocional",
    placeholder: "FELICES50",
  },
  {
    nombre: "password",
    etiqueta: "Contraseña *",
    type: "password",
    autoComplete: "new-password",
    maxLength: 10,
    required: true,
  },
  {
    nombre: "confirmPassword",
    etiqueta: "Confirmar contraseña *",
    type: "password",
    autoComplete: "new-password",
    maxLength: 10,
    required: true,
  },
];

export default function UserCreateAdmin() {
  const [datos, setDatos] = useState({ ...datosIniciales });
  const [error, setError] = useState("");
  const [creado, setCreado] = useState(false);
  const navigate = useNavigate();

  const regionSeleccionada = regionesComunas.find(
    (item) => item.region === datos.region
  );

  const comunas = regionSeleccionada
    ? [...new Set(regionSeleccionada.comunas)]
    : [];

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setDatos((actuales) => ({
      ...actuales,
      [name]: value,
      ...(name === "region" ? { comuna: "" } : {}),
    }));

    setError("");
  }

  function crearUsuario(evento) {
    evento.preventDefault();

    if (creado) return;

    setError("");

    const run = normalizarRun(datos.run);
    const nombre = datos.nombre.trim();
    const apellidos = datos.apellidos.trim();
    const correo = datos.correo.trim().toLowerCase();
    const direccion = datos.direccion.trim();
    const codigo = datos.codigoPromocional.trim().toUpperCase();

    if (!validarRun(run)) {
      setError("Ingresa un RUN válido con su dígito verificador.");
      return;
    }

    if (nombre.length < 2 || nombre.length > 50) {
      setError("El nombre debe tener entre 2 y 50 caracteres.");
      return;
    }

    if (!apellidos || apellidos.length > 100) {
      setError("Los apellidos son obligatorios, máximo 100 caracteres.");
      return;
    }

    if (!validarCorreo(correo)) {
      setError(
        "Usa un correo @duoc.cl, @profesor.duoc.cl, @duocuc.cl o @gmail.com."
      );
      return;
    }

    if (!validarTelefono(datos.telefono)) {
      setError("Ingresa un teléfono válido de 8 a 15 dígitos.");
      return;
    }

    let edad = null;

    if (datos.fechaNacimiento) {
      const fecha = new Date(`${datos.fechaNacimiento}T00:00:00`);
      edad = calcularEdad(datos.fechaNacimiento);

      if (
        Number.isNaN(fecha.getTime()) ||
        fecha > new Date() ||
        edad > 120
      ) {
        setError("Ingresa una fecha de nacimiento válida.");
        return;
      }
    }

    if (!regionSeleccionada || !comunas.includes(datos.comuna)) {
      setError("Selecciona una región y una comuna válidas.");
      return;
    }

    if (!direccion || direccion.length > 300) {
      setError("La dirección es obligatoria, máximo 300 caracteres.");
      return;
    }

    if (!validarPassword(datos.password)) {
      setError("La contraseña debe tener entre 4 y 10 caracteres.");
      return;
    }

    if (datos.password !== datos.confirmPassword) {
      setError("Las contraseñas deben coincidir.");
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(ROLES, datos.rol)) {
      setError("Selecciona un rol válido.");
      return;
    }

    if (codigo && codigo !== "FELICES50") {
      setError("El código vigente es FELICES50.");
      return;
    }

    try {
      const usuarios = obtenerUsuarios();

      const correoRepetido = usuarios.some(
        (usuario) =>
          String(usuario.email || usuario.correo || "")
            .trim()
            .toLowerCase() === correo
      );

      const runRepetido = usuarios.some(
        (usuario) =>
          normalizarRun(String(usuario.run || "")) === run
      );

      if (correoRepetido) {
        setError("Ya existe una cuenta con este correo.");
        return;
      }

      if (runRepetido) {
        setError("Ya existe una cuenta con este RUN.");
        return;
      }

      const descuentoEdad =
        edad !== null && edad >= 50 && edad <= 120 ? 50 : 0;

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
          "Torta gratis en tu cumpleaños por ser de la comunidad Duoc."
        );
      }

      const usuario = {
        run,
        nombre,
        apellidos,
        correo,
        email: correo,
        fechaNacimiento: datos.fechaNacimiento || null,
        telefono: datos.telefono.trim() || null,
        region: datos.region,
        comuna: datos.comuna,
        direccion,
        password: datos.password,
        codigoPromocional: codigo,
        descuentoEdad,
        descuentoCodigo,
        tortaGratisDuoc,
        beneficios,
        rol: datos.rol,
        tipo: ROLES[datos.rol],
        fechaRegistro: new Date().toISOString(),
      };

      localStorage.setItem(
        "usuarios",
        JSON.stringify([...usuarios, usuario])
      );

      setCreado(true);
      setDatos({ ...datosIniciales });
    } catch {
      setError("No se pudo guardar el usuario en este navegador.");
    }
  }

  return (
    <Container className="my-4" style={{ maxWidth: "900px" }}>
      <h2 className="fw-bold" style={{ color: "#8b4513" }}>
        Crear usuario
      </h2>

      <p className="text-muted">
        Registra una cuenta y asigna su rol en el sistema.
      </p>

      {creado ? (
        <Alert variant="success" role="status">
          <Alert.Heading>Usuario creado correctamente</Alert.Heading>
          <p>La cuenta ya está disponible para iniciar sesión.</p>

          <Button as={Link} to="/admin/usuarios" variant="success">
            Volver a Usuarios
          </Button>
        </Alert>
      ) : (
        <Card className="shadow-sm border-0 p-4">
          {error && (
            <Alert variant="danger" role="alert">
              {error}
            </Alert>
          )}

          <Form noValidate onSubmit={crearUsuario}>
            <p className="small text-muted">
              Los campos marcados con * son obligatorios.
            </p>

            <Row className="g-3">
              {campos.map((campo) => {
                const { nombre, etiqueta, ...propiedades } = campo;

                return (
                  <Col xs={12} md={6} key={nombre}>
                    <Form.Group controlId={`nuevo-usuario-${nombre}`}>
                      <Form.Label>{etiqueta}</Form.Label>

                      <Form.Control
                        {...propiedades}
                        name={nombre}
                        value={datos[nombre]}
                        onChange={actualizarCampo}
                      />
                    </Form.Group>
                  </Col>
                );
              })}

              <Col xs={12} md={6}>
                <Form.Group controlId="nuevo-usuario-region">
                  <Form.Label>Región *</Form.Label>

                  <Form.Select
                    name="region"
                    value={datos.region}
                    onChange={actualizarCampo}
                    required
                  >
                    <option value="">Selecciona una región</option>

                    {regionesComunas.map((item) => (
                      <option key={item.region} value={item.region}>
                        {item.region}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="nuevo-usuario-comuna">
                  <Form.Label>Comuna *</Form.Label>

                  <Form.Select
                    name="comuna"
                    value={datos.comuna}
                    onChange={actualizarCampo}
                    disabled={!datos.region}
                    required
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
                <Form.Group controlId="nuevo-usuario-rol">
                  <Form.Label>Rol *</Form.Label>

                  <Form.Select
                    name="rol"
                    value={datos.rol}
                    onChange={actualizarCampo}
                    required
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

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/admin/usuarios")}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                style={{ background: "#8b4513", border: "none" }}
              >
                Crear usuario
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </Container>
  );
}