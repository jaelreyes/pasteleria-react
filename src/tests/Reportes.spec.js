// Pruebas de los cálculos de reportes (utils/reportes.js) y de su vista.
import { render, screen, cleanup } from "@testing-library/react";
import api from "../services/api";
import ReportesAdmin from "../admin/pages/ReportesAdmin";
import { resumenVentas, resumenStock } from "../utils/reportes";

const ordenes = [
  {
    id: "A",
    total: 30000,
    estado: "completado",
    productos: [{ nombre: "Brownie", cantidad: 3 }, { nombre: "Tiramisú", cantidad: 1 }],
  },
  {
    id: "B",
    total: 10000,
    estado: "pendiente",
    productos: [{ nombre: "Brownie", cantidad: 2 }],
  },
  {
    id: "C",
    total: 99000,
    estado: "cancelado",
    productos: [{ nombre: "Torta de Boda", cantidad: 9 }],
  },
];

const productos = [
  { id: 1, categoria: "Tortas", precio: 1000, stock: 10, stockCritico: 3 },
  { id: 2, categoria: "Tortas", precio: 2000, stock: 2, stockCritico: 3 },
  { id: 3, categoria: "Galletas", precio: 500, stock: 0 },
];

describe("Reportes", () => {
  beforeEach(() => {
    spyOn(api, "get").and.callFake((ruta) => {
      if (ruta === "/boletas") return Promise.resolve({ data: ordenes });
      if (ruta === "/productos") return Promise.resolve({ data: productos });
      throw new Error(`GET no previsto: ${ruta}`);
    });
    spyOn(XMLHttpRequest.prototype, "open").and.callFake(() => { throw new Error("Red real bloqueada"); });
    spyOn(window, "fetch").and.callFake(() => Promise.reject(new Error("Red real bloqueada")));
  });
  afterEach(cleanup);

  it("suma las ventas sin contar las órdenes canceladas", () => {
    const resumen = resumenVentas(ordenes);

    expect(resumen.totalVendido).toBe(40000);
    expect(resumen.cantidadOrdenes).toBe(2);
    expect(resumen.canceladas).toBe(1);
    expect(resumen.ticketPromedio).toBe(20000);
  });

  it("ordena los productos más vendidos de mayor a menor", () => {
    expect(resumenVentas(ordenes).masVendidos).toEqual([
      { nombre: "Brownie", cantidad: 5 },
      { nombre: "Tiramisú", cantidad: 1 },
    ]);
  });

  it("sin órdenes el ticket promedio es 0", () => {
    expect(resumenVentas([]).ticketPromedio).toBe(0);
  });

  it("agrupa el stock por categoría y cuenta críticos y agotados", () => {
    expect(resumenStock(productos)).toEqual([
      { categoria: "Tortas", productos: 2, unidades: 12, valorInventario: 14000, criticos: 1, agotados: 0 },
      { categoria: "Galletas", productos: 1, unidades: 0, valorInventario: 0, criticos: 0, agotados: 1 },
    ]);
  });

  it("la vista muestra los indicadores y las tablas con datos de la API", async () => {
    render(<ReportesAdmin />);

    expect(await screen.findByText("$40.000")).toBeTruthy();
    expect(screen.getByText("1 cancelada(s)")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Brownie" })).toBeTruthy();
    expect(screen.getByRole("rowheader", { name: "Galletas" })).toBeTruthy();
    expect(screen.getAllByRole("columnheader").slice(-6).map((celda) => celda.textContent)).toEqual([
      "Categoría", "Productos", "Unidades", "Valor inventario", "Críticos", "Agotados",
    ]);
    expect(screen.getByText("$14.000")).toBeTruthy();
    expect(document.querySelectorAll(".reporte-indicador").length).toBe(4);
    expect(document.querySelectorAll(".reporte-estado-critico").length).toBe(1);
    expect(document.querySelectorAll(".reporte-estado-agotado").length).toBe(1);
    expect(screen.getByRole("region", { name: "Stock por categoría, tabla desplazable" }).tabIndex).toBe(0);
    expect(api.get.calls.allArgs()).toEqual([["/boletas"], ["/productos"]]);
  });

  it("avisa cuando todavía no hay ventas", async () => {
    api.get.and.callFake((ruta) => Promise.resolve({ data: ruta === "/boletas" ? [] : productos }));

    render(<ReportesAdmin />);

    expect(await screen.findByText("Todavía no hay ventas registradas")).toBeTruthy();
    expect(screen.queryByText("Brownie")).toBeNull();
  });
});
