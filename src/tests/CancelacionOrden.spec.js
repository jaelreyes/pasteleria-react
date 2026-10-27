// Pruebas de cancelar órdenes y devolver el stock al inventario.
import {
  confirmarCompra,
  actualizarEstadoOrden,
} from "../data/db";

const productoInicial = {
  id: 1,
  codigo: "TC001",
  nombre: "Torta de Chocolate",
  precio: 45000,
  descuento: 0,
  stock: 10,
};

function crearCompra() {
  return confirmarCompra(
    {
      id: "ORD-PRUEBA",
      nombre: "Ana Soto",
      email: "ana@gmail.com",
      telefono: "+56 9 1234 5678",
      direccion: "Calle Las Flores 123",
      metodoPago: "webpay",
      fecha: "2026-10-25T12:00:00.000Z",
    },
    [{ ...productoInicial, cantidad: 2 }],
    0
  );
}

describe("Cancelación de órdenes e inventario", () => {
  let almacenamiento;

  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    almacenamiento = {
      productos: JSON.stringify([productoInicial]),
      ordenes: JSON.stringify([]),
    };

    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave)
        ? almacenamiento[clave]
        : null
    );

    spyOn(Storage.prototype, "setItem").and.callFake(
      (clave, valor) => {
        almacenamiento[clave] = String(valor);
      }
    );

    spyOn(Storage.prototype, "removeItem").and.callFake((clave) => {
      delete almacenamiento[clave];
    });
  });

  it("devuelve al cancelar las unidades descontadas en la compra", () => {
    const compra = crearCompra();

    expect(compra.stockDescontado).toBe(true);
    expect(compra.stockRestituido).toBe(false);

    expect(
      JSON.parse(almacenamiento.productos)[0].stock
    ).toBe(8);

    const cancelada = actualizarEstadoOrden(
      compra.id,
      "cancelado"
    );

    expect(cancelada.estado).toBe("cancelado");
    expect(cancelada.stockRestituido).toBe(true);

    expect(
      JSON.parse(almacenamiento.productos)[0].stock
    ).toBe(10);

    expect(
      JSON.parse(almacenamiento.ordenes)[0].estado
    ).toBe("cancelado");
  });

  it("cancelar dos veces no devuelve stock por segunda vez", () => {
    const compra = crearCompra();

    actualizarEstadoOrden(compra.id, "cancelado");

    const productosAntes = almacenamiento.productos;
    const ordenesAntes = almacenamiento.ordenes;

    localStorage.setItem.calls.reset();

    actualizarEstadoOrden(compra.id, "cancelado");

    expect(almacenamiento.productos).toBe(productosAntes);
    expect(almacenamiento.ordenes).toBe(ordenesAntes);

    expect(
      JSON.parse(almacenamiento.productos)[0].stock
    ).toBe(10);

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("impide reactivar una orden cancelada", () => {
    const compra = crearCompra();

    actualizarEstadoOrden(compra.id, "cancelado");

    const productosAntes = almacenamiento.productos;
    const ordenesAntes = almacenamiento.ordenes;

    localStorage.setItem.calls.reset();

    expect(() =>
      actualizarEstadoOrden(compra.id, "procesando")
    ).toThrowError(/no se puede reactivar/);

    expect(almacenamiento.productos).toBe(productosAntes);
    expect(almacenamiento.ordenes).toBe(ordenesAntes);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("cancelar una orden antigua no suma stock sin registro de descuento", () => {
    almacenamiento.ordenes = JSON.stringify([
      {
        id: "ORD-ANTIGUA",
        estado: "pendiente",
        productos: [{ id: 1, cantidad: 2 }],
      },
    ]);

    const productosAntes = almacenamiento.productos;

    const cancelada = actualizarEstadoOrden(
      "ORD-ANTIGUA",
      "cancelado"
    );

    expect(cancelada.estado).toBe("cancelado");
    expect(cancelada.stockRestituido).not.toBe(true);
    expect(almacenamiento.productos).toBe(productosAntes);

    expect(
      JSON.parse(almacenamiento.ordenes)[0].estado
    ).toBe("cancelado");

    const escribioProductos = localStorage.setItem.calls
      .allArgs()
      .some(([clave]) => clave === "productos");

    expect(escribioProductos).toBe(false);
  });

  it("restaura el inventario si falla el guardado de la cancelación", () => {
    const compra = crearCompra();

    const productosAntes = almacenamiento.productos;
    const ordenesAntes = almacenamiento.ordenes;

    localStorage.setItem.and.callFake((clave, valor) => {
      if (clave === "ordenes") {
        throw new Error("No se pudo guardar la orden");
      }

      almacenamiento[clave] = String(valor);
    });

    expect(() =>
      actualizarEstadoOrden(compra.id, "cancelado")
    ).toThrowError("No se pudo guardar el cambio de estado.");

    // La devolución se revierte porque la cancelación no se guardó.
    expect(almacenamiento.productos).toBe(productosAntes);
    expect(almacenamiento.ordenes).toBe(ordenesAntes);

    expect(
      JSON.parse(almacenamiento.productos)[0].stock
    ).toBe(8);

    expect(
      JSON.parse(almacenamiento.ordenes)[0].estado
    ).toBe("pendiente");
  });

  it("no cancela ni modifica stock si el producto ya no existe", () => {
    const compra = crearCompra();

    almacenamiento.productos = JSON.stringify([]);

    const ordenesAntes = almacenamiento.ordenes;

    localStorage.setItem.calls.reset();

    expect(() =>
      actualizarEstadoOrden(compra.id, "cancelado")
    ).toThrowError(/ya no existe en el catálogo/);

    expect(JSON.parse(almacenamiento.productos)).toEqual([]);
    expect(almacenamiento.ordenes).toBe(ordenesAntes);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("pasar a preparación conserva el stock descontado", () => {
    const compra = crearCompra();

    const productosAntes = almacenamiento.productos;

    localStorage.setItem.calls.reset();

    const actualizada = actualizarEstadoOrden(
      compra.id,
      "procesando"
    );

    expect(actualizada.estado).toBe("procesando");
    expect(actualizada.stockRestituido).toBe(false);
    expect(almacenamiento.productos).toBe(productosAntes);

    expect(
      JSON.parse(almacenamiento.ordenes)[0].estado
    ).toBe("procesando");

    const escribioProductos = localStorage.setItem.calls
      .allArgs()
      .some(([clave]) => clave === "productos");

    expect(escribioProductos).toBe(false);
  });
});