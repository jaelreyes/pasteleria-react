// PESTAÑA 8 · Pruebas de categorías: funciones de db.js y la vista CategoriasAdmin.
// Pruebas del CRUD de categorías (db.js) y de su vista en el panel.
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

  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    // Mock de localStorage con dos categorías y dos productos.
    almacenamiento = {
      productos: JSON.stringify(productos),
      categorias: JSON.stringify(["Tortas Cuadradas", "Productos Sin Gluten", "Galletas"]),
    };

    // spyOn reemplaza getItem: lee del objeto almacenamiento en vez del navegador.
    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      clave in almacenamiento ? almacenamiento[clave] : null
    );
    // spyOn reemplaza setItem: guarda en el objeto almacenamiento.
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => {
      almacenamiento[clave] = String(valor);
    });
  });

  // Después de cada prueba borra lo dibujado (Jasmine quita los spyOn solo).
  afterEach(cleanup);

  // --- Pruebas de las funciones de db.js ---
  it("crea una categoría nueva", () => {
    guardarCategoria("Bombones");
    expect(obtenerCategorias()).toContain("Bombones");
  });

  it("no permite nombres repetidos aunque cambien mayúsculas", () => {
    // toThrowError comprueba que la función lanza el error esperado.
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

  // --- Pruebas de la vista (Testing Library) ---
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
    // Preparar: dibuja la vista con los datos del mock.
    render(<CategoriasAdmin />);

    // Actuar: simula que el usuario escribe y hace clic en Agregar.
    fireEvent.change(screen.getByLabelText("Nueva categoría"), {
      target: { value: "Bombones" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    // Verificar: aparece la categoría y el aviso de éxito.
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