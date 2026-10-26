import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { obtenerUsuarios } from "../data/db";
import "../styles/Auth.css";
import { validarCorreo } from "../utils/validaciones";

export default function Login({ onIniciarSesion }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errores, setErrores] = useState({});

  const formularioRef = useRef(null);
  const navigate = useNavigate();

  function handleSubmit(evento) {
    evento.preventDefault();
    setError("");

    const correoNormalizado = correo.trim().toLowerCase();
    const nuevosErrores = {};

    if (!validarCorreo(correoNormalizado)) {
      nuevosErrores.correo =
        "Ingresa un correo @duoc.cl, @profesor.duoc.cl, @duocuc.cl o @gmail.com.";
    }

    if (password.length < 4 || password.length > 10) {
      nuevosErrores.password =
        "La contraseña debe tener entre 4 y 10 caracteres.";
    }

    setErrores(nuevosErrores);

    const primerError = Object.keys(nuevosErrores)[0];

    if (primerError) {
      formularioRef.current?.elements.namedItem(primerError)?.focus();
      return;
    }

    try {
      const usuarios = obtenerUsuarios();

      const usuarioEncontrado = usuarios.find((usuario) => {
        const correoUsuario = String(usuario.email || usuario.correo || "")
          .trim()
          .toLowerCase();

        return (
          correoUsuario === correoNormalizado && usuario.password === password
        );
      });

      if (!usuarioEncontrado) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      onIniciarSesion(usuarioEncontrado);

      const rol = String(usuarioEncontrado.rol || usuarioEncontrado.tipo || "")
        .trim()
        .toLowerCase();

      const tienePanel = ["admin", "administrador", "vendedor"].includes(rol);

      navigate(tienePanel ? "/admin/ordenes" : "/", {
        replace: true,
      });
    } catch {
      setError("No se pudo iniciar sesión. Inténtalo nuevamente.");
    }
  }

  return (
    <div className="login-page">
      <section className="login-container" aria-labelledby="login-titulo">
        <div className="login-card">
          <div className="login-header">
            <img
              src="/images/logo-completo.png"
              className="login-logo"
              alt="Pastelería 1000 Sabores"
              width={150}
              height={164}
            />

            <h1 id="login-titulo">Iniciar Sesión</h1>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <Alert variant="danger" role="alert">
              {error}
            </Alert>
          )}

          <Form
            ref={formularioRef}
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <Form.Group controlId="login-correo">
              <Form.Label>Correo Electrónico *</Form.Label>

              <Form.Control
                type="email"
                name="correo"
                placeholder="tunombre@duoc.cl"
                autoComplete="username"
                maxLength={100}
                value={correo}
                onChange={(evento) => {
                  setCorreo(evento.target.value);
                  setError("");
                  setErrores((actuales) => ({
                    ...actuales,
                    correo: "",
                  }));
                }}
                isInvalid={Boolean(errores.correo)}
                aria-describedby="login-ayuda-correo login-error-correo"
                required
              />

              <small id="login-ayuda-correo" className="login-ayuda">
                Solo @duoc.cl, @profesor.duoc.cl, @duocuc.cl y @gmail.com (máx.
                100 caracteres).
              </small>

              <Form.Control.Feedback type="invalid" id="login-error-correo">
                {errores.correo}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="login-password">
              <Form.Label>Contraseña *</Form.Label>

              <Form.Control
                type="password"
                name="password"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                maxLength={10}
                value={password}
                onChange={(evento) => {
                  setPassword(evento.target.value);
                  setError("");
                  setErrores((actuales) => ({
                    ...actuales,
                    password: "",
                  }));
                }}
                isInvalid={Boolean(errores.password)}
                aria-describedby="login-ayuda-password login-error-password"
                required
              />

              <small id="login-ayuda-password" className="login-ayuda">
                Entre 4 y 10 caracteres.
              </small>

              <Form.Control.Feedback type="invalid" id="login-error-password">
                {errores.password}
              </Form.Control.Feedback>
            </Form.Group>

            <button type="submit" className="login-boton">
              Iniciar Sesión
            </button>
          </Form>

          <div className="login-footer">
            <p>
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </div>

          <aside className="login-demo">
            <h2>Cuentas de prueba</h2>

            <ul>
              <li>
                <strong>Administrador:</strong> admin@duoc.cl / admin123
              </li>
              <li>
                <strong>Vendedor:</strong> vendedor@duoc.cl / venta123
              </li>
              <li>
                <strong>Cliente:</strong> cliente@gmail.com / cliente1
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
