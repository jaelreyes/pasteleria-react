import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BoletaAdmin from "../admin/pages/BoletaAdmin";
import HistorialUsuario from "../admin/pages/HistorialUsuario";

const ordenes = [
  {
    id: "ORD-1",
    fecha: "2026-10-20T15:00:00.000Z",
    nombre: "Ana Soto",
    email: "ana@gmail.com",
    telefono: "+56 9 1234 5678",
    direccion: "Las Flores 123, Viña del Mar, Valparaíso",
    indicaciones: "Dejar con el conserje",
    estado: "completado",
    ahorro: 5000,
    total: 40000,
    productos: [{ id: 1, nombre: "Torta de Frutas", cantidad: 1, precioFinal: 40000 }],
  },
  {
    id: "ORD-2",
    fecha: "2026-10-21T15:00:00.000Z",
    nombre: "Ana Soto",
    email: "ana@gmail.com",
    estado: "cancelado",
    total: 9000,
    productos: [],
  },
  {
    id: "ORD-3",
    nombre: "Luis",
    email: "luis@gmail.com",
    total: 5000,
    productos: [],
  },
];

function dibujar(ruta) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/admin/ordenes/:id" element={<BoletaAdmin />} />
        <Route path="/admin/usuarios/:correo/historial" element={<HistorialUsuario />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Boleta e historial de compras", () => {
  beforeEach(() => {
    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      clave === "ordenes" ? JSON.stringify(ordenes) : null
    );
  });

  afterEach(cleanup);

  it("la boleta muestra cliente, productos y total de la orden", () => {
    dibujar("/admin/ordenes/ORD-1");

    expect(screen.getByText("ORD-1", { exact: false })).toBeTruthy();
    expect(screen.getByText("Las Flores 123, Viña del Mar, Valparaíso")).toBeTruthy();
    expect(screen.getByText("Indicaciones: Dejar con el conserje")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Torta de Frutas" })).toBeTruthy();
    expect(screen.getByText("Total: $40.000")).toBeTruthy();
    expect(screen.getByText("Entregado")).toBeTruthy();
  });

  it("la boleta avisa si la orden no existe", () => {
    dibujar("/admin/ordenes/NO-EXISTE");
    expect(screen.getByText(/No encontramos la orden NO-EXISTE/)).toBeTruthy();
  });

  it("el historial muestra solo las compras del usuario", () => {
    dibujar("/admin/usuarios/ana%40gmail.com/historial");

    expect(screen.getByRole("cell", { name: "ORD-1" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "ORD-2" })).toBeTruthy();
    expect(screen.queryByRole("cell", { name: "ORD-3" })).toBeNull();
  });

  it("el total comprado no suma las órdenes canceladas", () => {
    dibujar("/admin/usuarios/ana%40gmail.com/historial");
    expect(screen.getByText("Total comprado: $40.000")).toBeTruthy();
  });

  it("cada compra enlaza a su boleta", () => {
    dibujar("/admin/usuarios/ana%40gmail.com/historial");

    const enlaces = screen.getAllByRole("link", { name: "Ver boleta" });
    expect(enlaces[0].getAttribute("href")).toBe("/admin/ordenes/ORD-1");
  });

  it("avisa cuando el usuario no tiene compras", () => {
    dibujar("/admin/usuarios/nadie%40gmail.com/historial");
    expect(screen.getByText("Este usuario todavía no tiene compras.")).toBeTruthy();
  });
});