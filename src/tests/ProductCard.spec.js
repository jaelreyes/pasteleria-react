import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const producto = {
  id: 1,
  nombre: "Torta de Chocolate",
  categoria: "Tortas Cuadradas",
  descripcion: "Bizcocho con cobertura de chocolate.",
  precio: 45000,
  imagen: "/images/productos/TC001.jpg",
  stock: 5,
};

function dibujarTarjeta(cambios = {}) {
  const onAgregar = jasmine.createSpy("onAgregar");

  render(
    <MemoryRouter>
      <ProductCard {...producto} {...cambios} onAgregar={onAgregar} />
    </MemoryRouter>,
  );

  return onAgregar;
}

describe("ProductCard", () => {
  afterEach(cleanup);

  it("muestra los datos recibidos por props", () => {
    dibujarTarjeta();

    expect(screen.getByRole("heading", { name: producto.nombre })).toBeTruthy();

    expect(screen.getByText(producto.categoria)).toBeTruthy();
    expect(screen.getByText(producto.descripcion)).toBeTruthy();

    expect(
      screen.getByRole("img", { name: producto.nombre }).getAttribute("src"),
    ).toBe(producto.imagen);
  });

  it("construye el enlace al detalle con el id", () => {
    dibujarTarjeta();

    const detalle = screen.getByRole("button", {
      name: "Ver Detalle",
    });

    expect(detalle.getAttribute("href")).toBe("/productos/1");
  });

  it("llama a onAgregar una vez al pulsar el botón", () => {
    const onAgregar = dibujarTarjeta();

    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));

    expect(onAgregar).toHaveBeenCalledTimes(1);
  });

  it("desactiva la compra cuando no hay stock", () => {
    const onAgregar = dibujarTarjeta({ stock: 0 });
    const boton = screen.getByRole("button", { name: "Agotado" });

    expect(boton.disabled).toBe(true);

    fireEvent.click(boton);

    expect(onAgregar).not.toHaveBeenCalled();
  });

  it("muestra el descuento y el precio anterior tachado", () => {
    dibujarTarjeta({
      precio: 22500,
      precioAnterior: 45000,
      descuento: 50,
    });

    expect(screen.getByText("-50%")).toBeTruthy();
    expect(screen.getByText("$45.000").tagName).toBe("DEL");
    expect(screen.getByText(/^\$22\.500/)).toBeTruthy();
  });

  it("no muestra una etiqueta de descuento sin rebaja", () => {
    dibujarTarjeta();

    expect(screen.queryByText(/-\d+%/)).toBeNull();
    expect(document.querySelector("del")).toBeNull();
  });
});
