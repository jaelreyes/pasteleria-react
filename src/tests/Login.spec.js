import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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

// Dibuja el Login dentro de un router con las páginas de destino.
function dibujarLogin(onIniciarSesion = jasmine.createSpy("onIniciarSesion")) {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path="/login"
          element={<Login onIniciarSesion={onIniciarSesion} />}
        />
        <Route path="/" element={<p>Página de inicio</p>} />
        <Route path="/admin/ordenes" element={<p>Panel de administración</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return onIniciarSesion;
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  });
}

describe("Login", () => {
  beforeEach(() => {
    // Mock: localStorage devuelve usuarios de prueba en vez de los reales.
    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      clave === "usuarios" ? JSON.stringify(usuarios) : null,
    );
  });

  afterEach(cleanup);

  it("no muestra mensajes de error al abrir la página", () => {
    dibujarLogin();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("actualiza el estado del campo correo al escribir", () => {
    dibujarLogin();
    escribir("Correo electrónico", "ana@duoc.cl");
    expect(screen.getByLabelText("Correo electrónico").value).toBe(
      "ana@duoc.cl",
    );
  });

  it("muestra un error si la contraseña es incorrecta", () => {
    const onIniciarSesion = dibujarLogin();
    escribir("Correo electrónico", "cliente@gmail.com");
    escribir("Contraseña", "otra123");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "Correo o contraseña incorrectos",
    );
    expect(onIniciarSesion).not.toHaveBeenCalled();
  });

  it("envía al Cliente a la tienda al iniciar sesión", () => {
    const onIniciarSesion = dibujarLogin();
    escribir("Correo electrónico", "cliente@gmail.com");
    escribir("Contraseña", "cliente1");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(onIniciarSesion).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: "Camila" }),
    );
    expect(screen.getByText("Página de inicio")).toBeTruthy();
  });

  it("envía al Administrador al panel al iniciar sesión", () => {
    dibujarLogin();
    escribir("Correo electrónico", "admin@duoc.cl");
    escribir("Contraseña", "admin123");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByText("Panel de administración")).toBeTruthy();
  });
});
