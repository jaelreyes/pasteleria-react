import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Checkout from "../pages/Checkout";
import PagoFallo from "../pages/PagoFallo";
import { armarDireccion } from "../utils/direccion";

const producto = {
  id: 1,
  codigo: "TC001",
  nombre: "Torta de Chocolate",
  imagen: "/images/productos/TC001.jpg",
  precio: 45000,
  stock: 5,
};

const carrito = [{ ...producto, cantidad: 2 }];

// Dibuja el Checkout con las páginas de destino reales del pago con error.
function dibujarCheckout(onCompraConfirmada = jasmine.createSpy("onCompraConfirmada")) {
  render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route
          path="/checkout"
          element={
            <Checkout carrito={carrito} onCompraConfirmada={onCompraConfirmada} />
          }
        />
        <Route path="/pago/error" element={<PagoFallo />} />
        <Route path="/pago/exito/:idOrden" element={<p>Pago exitoso</p>} />
      </Routes>
    </MemoryRouter>
  );
  return onCompraConfirmada;
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function completarDatos() {
  escribir(/^Nombre y apellidos/, "Pedro Soto");
  escribir(/^Correo electrónico/, "pedro@gmail.com");
  escribir(/^Teléfono/, "+56 9 1234 5678");
  escribir(/^Dirección de despacho/, "Los Crisantemos 45");
  escribir(/^Departamento/, "Depto 603");
  escribir(/^Región/, "Metropolitana de Santiago");
  escribir(/^Comuna/, "Cerrillos");
}

function pagar() {
  fireEvent.click(screen.getByRole("button", { name: "Confirmar compra simulada" }));
}

describe("Checkout: dirección y pago rechazado", () => {
  let almacenamiento;

  beforeEach(() => {
    // Mock de localStorage: un catálogo de prueba y sin órdenes.
    almacenamiento = {
      productos: JSON.stringify([producto]),
      ordenes: "[]",
    };

    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      clave in almacenamiento ? almacenamiento[clave] : null
    );
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => {
      almacenamiento[clave] = String(valor);
    });
  });

  afterEach(cleanup);

  it("arma la dirección completa omitiendo las partes vacías", () => {
    expect(
      armarDireccion({
        direccion: "Los Crisantemos 45",
        departamento: "",
        comuna: "Cerrillos",
        region: "Metropolitana de Santiago",
      })
    ).toBe("Los Crisantemos 45, Cerrillos, Metropolitana de Santiago");
  });

  it("habilita la comuna solo después de elegir la región", () => {
    dibujarCheckout();

    expect(screen.getByLabelText(/^Comuna/).disabled).toBe(true);

    escribir(/^Región/, "Valparaíso");

    expect(screen.getByLabelText(/^Comuna/).disabled).toBe(false);
    expect(screen.getByRole("option", { name: "Viña del Mar" })).toBeTruthy();
  });

  it("no permite pagar si falta la región", () => {
    const onCompraConfirmada = dibujarCheckout();

    escribir(/^Nombre y apellidos/, "Pedro Soto");
    escribir(/^Correo electrónico/, "pedro@gmail.com");
    escribir(/^Teléfono/, "+56 9 1234 5678");
    escribir(/^Dirección de despacho/, "Los Crisantemos 45");
    pagar();

    expect(screen.getByRole("alert").textContent).toContain("Selecciona la región");
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("autocompleta región y comuna con los datos de la sesión", () => {
    almacenamiento.usuarioActivo = JSON.stringify({
      nombre: "Ana",
      correo: "ana@gmail.com",
      region: "Valparaíso",
      comuna: "Viña del Mar",
    });

    dibujarCheckout();

    expect(screen.getByLabelText(/^Región/).value).toBe("Valparaíso");
    expect(screen.getByLabelText(/^Comuna/).value).toBe("Viña del Mar");
  });

  it("al simular un rechazo muestra la vista de error sin guardar la orden", () => {
    const onCompraConfirmada = dibujarCheckout();

    completarDatos();
    fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
    pagar();

    expect(
      screen.getByRole("heading", { name: /No se pudo realizar el pago/ })
    ).toBeTruthy();
    expect(
      screen.getByText("Los Crisantemos 45, Depto 603, Cerrillos, Metropolitana de Santiago")
    ).toBeTruthy();
    expect(screen.getByText("Total no cobrado: $90.000")).toBeTruthy();

    // No se guardó la orden ni se vació el carrito.
    expect(JSON.parse(almacenamiento.ordenes)).toEqual([]);
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("la vista de error ofrece volver a realizar el pago", () => {
    dibujarCheckout();
    completarDatos();
    fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
    pagar();

    const boton = screen.getByRole("button", { name: "Volver a realizar el pago" });
    expect(boton.getAttribute("href")).toBe("/checkout");
  });

  it("sin datos de compra muestra un mensaje genérico", () => {
    render(
      <MemoryRouter initialEntries={["/pago/error"]}>
        <PagoFallo />
      </MemoryRouter>
    );

    expect(screen.getByText(/No hay datos de una compra reciente/)).toBeTruthy();
  });
});