// Pruebas del inicio de sesión y la redirección según el rol.
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";

const usuarios = [
  {
    correo: "admin@duoc.cl",
    password: "admin123",
    nombre: "Ana",
    tipo: "Administrador",
  },
  {
    correo: "cliente@gmail.com",
    password: "cliente1",
    nombre: "Camila",
    tipo: "Cliente",
  },
];

function dibujarLogin(
  onIniciarSesion = jasmine.createSpy("onIniciarSesion")
) {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path="/login"
          element={<Login onIniciarSesion={onIniciarSesion} />}
        />

        <Route path="/" element={<p>Página de inicio</p>} />

        <Route
          path="/admin/ordenes"
          element={<p>Panel de administración</p>}
        />
      </Routes>
    </MemoryRouter>
  );

  return onIniciarSesion;
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  });
}

function enviarLogin() {
  fireEvent.click(
    screen.getByRole("button", { name: /iniciar sesión/i })
  );
}

describe("Login", () => {
  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      clave === "usuarios" ? JSON.stringify(usuarios) : null
    );

    // Evita que la inicialización de cuentas demo escriba datos reales.
    spyOn(Storage.prototype, "setItem").and.stub();
  });

  afterEach(cleanup);

  it("no muestra mensajes de error al abrir la página", () => {
    dibujarLogin();

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("actualiza el estado del campo correo al escribir", () => {
    dibujarLogin();

    escribir(/correo electrónico/i, "ana@duoc.cl");

    expect(screen.getByLabelText(/correo electrónico/i).value).toBe(
      "ana@duoc.cl"
    );
  });

  it("muestra un error si la contraseña es incorrecta", () => {
    const onIniciarSesion = dibujarLogin();

    escribir(/correo electrónico/i, "cliente@gmail.com");
    escribir(/contraseña/i, "otra123");

    enviarLogin();

    expect(screen.getByRole("alert").textContent).toContain(
      "Correo o contraseña incorrectos"
    );

    expect(onIniciarSesion).not.toHaveBeenCalled();
  });

  it("envía al Cliente a la tienda al iniciar sesión", () => {
    const onIniciarSesion = dibujarLogin();

    escribir(/correo electrónico/i, "cliente@gmail.com");
    escribir(/contraseña/i, "cliente1");

    enviarLogin();

    expect(onIniciarSesion).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: "Camila" })
    );

    expect(screen.getByText("Página de inicio")).toBeTruthy();
  });

  it("envía al Administrador al panel al iniciar sesión", () => {
    const onIniciarSesion = dibujarLogin();

    escribir(/correo electrónico/i, "admin@duoc.cl");
    escribir(/contraseña/i, "admin123");

    enviarLogin();

    expect(onIniciarSesion).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: "Ana" })
    );

    expect(screen.getByText("Panel de administración")).toBeTruthy();
  });
});