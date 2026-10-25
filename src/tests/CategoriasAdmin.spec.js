import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CategoriasAdmin from "../admin/pages/CategoriasAdmin";
import {
  obtenerCategorias,
  guardarCategoria,
  eliminarCategoria,
} from "../data/db";

const productos = [
  { id: 1, nombre: "Torta de Chocolate", categoria: "Tortas Cuadradas", precio: 45000, stock: 10 },
  { id: 2, nombre: "Brownie", categoria: "Productos Sin Gluten", precio: 4000, stock: 3 },
];

describe("Categorías del panel", () => {
  let almacenamiento;

  beforeEach(() => {
    // Mock de localStorage con dos categorías y dos productos.
    almacenamiento = {
      productos: JSON.stringify(productos),
      categorias: JSON.stringify(["Tortas Cuadradas", "Productos Sin Gluten", "Galletas"]),
    };

    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      clave in almacenamiento ? almacenamiento[clave] : null
    );
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => {
      almacenamiento[clave] = String(valor);
    });
  });

  afterEach(cleanup);

  it("crea una categoría nueva", () => {
    guardarCategoria("Bombones");
    expect(obtenerCategorias()).toContain("Bombones");
  });

  it("no permite nombres repetidos aunque cambien mayúsculas", () => {
    expect(() => guardarCategoria("galletas")).toThrowError(/Ya existe/);
  });

  it("al renombrar también actualiza los productos de esa categoría", () => {
    guardarCategoria("Tortas Rectangulares", "Tortas Cuadradas");

    const guardados = JSON.parse(almacenamiento.productos);
    expect(guardados[0].categoria).toBe("Tortas Rectangulares");
    expect(obtenerCategorias()).not.toContain("Tortas Cuadradas");
  });

  it("no elimina una categoría que tiene productos", () => {
    expect(() => eliminarCategoria("Tortas Cuadradas")).toThrowError(/1 producto/);
  });

  it("elimina una categoría sin productos", () => {
    eliminarCategoria("Galletas");
    expect(obtenerCategorias()).not.toContain("Galletas");
  });

  it("la vista lista las categorías con su cantidad de productos", () => {
    render(<CategoriasAdmin />);

    expect(screen.getByText("Galletas")).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(4); // encabezado + 3
  });

  it("deshabilita Eliminar cuando la categoría tiene productos", () => {
    render(<CategoriasAdmin />);

    const botones = screen.getAllByRole("button", { name: "Eliminar" });
    expect(botones[0].disabled).toBe(true); // Tortas Cuadradas
    expect(botones[2].disabled).toBe(false); // Galletas
  });

  it("agrega una categoría desde el formulario y muestra el aviso", () => {
    render(<CategoriasAdmin />);

    fireEvent.change(screen.getByLabelText("Nueva categoría"), {
      target: { value: "Bombones" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText("Bombones")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("creada");
  });

  it("muestra el error si el nombre es muy corto", () => {
    render(<CategoriasAdmin />);

    fireEvent.change(screen.getByLabelText("Nueva categoría"), {
      target: { value: "ab" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByRole("alert").textContent).toContain("entre 3 y 50");
  });
});