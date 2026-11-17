// Prueba del flujo completo: confirmar compra, vaciar carrito e ir a la página de éxito.
import { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Checkout from "../pages/Checkout";
import PagoExito from "../pages/PagoExito";
import api from "../services/api";

// Boleta que responde el backend en POST /boletas.
const boletaBackend = {
  id: 1234,
  fecha: "2026-11-17T10:00:00",
  estado: "pendiente",
  nombre: "Ana Soto",
  email: "ana@gmail.com",
  telefono: "+56 9 1234 5678",
  direccion: "Calle Las Flores 123, Viña del Mar, Valparaíso",
  pagoSimulado: true,
  descuentoUsuario: 0,
  subtotal: 90000,
  ahorro: 0,
  total: 90000,
  productos: [
    { id: 1, codigo: "TC001", nombre: "Torta de Chocolate", imagen: "/images/productos/TC001.jpg",
      cantidad: 2, precioBase: 45000, descuentoAplicado: 0, precioFinal: 45000, subtotal: 90000 },
  ],
};

const producto = {
  id: 1,
  codigo: "TC001",
  nombre: "Torta de Chocolate",
  imagen: "/images/productos/TC001.jpg",
  precio: 45000,
  descuento: 0,
  stock: 5,
};

// Simula el comportamiento de App: la compra vacía el carrito.
function FlujoCompra({ alConfirmar }) {
  const [carrito, setCarrito] = useState([
    { ...producto, cantidad: 2 },
  ]);

  function compraConfirmada() {
    alConfirmar();
    setCarrito([]);
  }

  return (
    <MemoryRouter initialEntries={["/checkout"]}>
      <p data-testid="productos-en-carrito">
        {carrito.length}
      </p>

      <Routes>
        <Route
          path="/checkout"
          element={
            <Checkout
              carrito={carrito}
              descuento={0}
              onCompraConfirmada={compraConfirmada}
            />
          }
        />

        <Route
          path="/pago/exito/:idOrden"
          element={<PagoExito />}
        />

        <Route
          path="/carrito"
          element={<h1>Página del carrito vacío</h1>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Flujo de confirmación de compra", () => {
  let almacenamiento;

  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    almacenamiento = {
      productos: JSON.stringify([producto]),
      ordenes: JSON.stringify([]),
      // El checkout exige sesión iniciada.
      usuarioActivo: JSON.stringify({ correo: "ana@gmail.com", rol: "cliente" }),
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

    // El backend confirma la compra y devuelve la boleta.
    spyOn(api, "post").and.returnValue(Promise.resolve({ data: boletaBackend }));
  });

  afterEach(cleanup);

  it("muestra la confirmación aunque la compra vacíe el carrito", async () => {
    const alConfirmar = jasmine.createSpy("alConfirmar");

    render(<FlujoCompra alConfirmar={alConfirmar} />);

    fireEvent.change(screen.getByLabelText(/^Nombre y apellidos/), {
      target: { value: "Ana Soto" },
    });

    fireEvent.change(screen.getByLabelText(/^Correo electrónico/), {
      target: { value: "ana@gmail.com" },
    });

    fireEvent.change(screen.getByLabelText(/^Teléfono/), {
      target: { value: "+56 9 1234 5678" },
    });

    fireEvent.change(screen.getByLabelText(/^Dirección de despacho/), {
      target: { value: "Calle Las Flores 123" },
    });

    fireEvent.change(screen.getByLabelText(/^Región/), {
      target: { value: "Valparaíso" },
    });

    fireEvent.change(screen.getByLabelText(/^Comuna/), {
      target: { value: "Viña del Mar" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmar compra simulada",
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: "¡Compra registrada!",
      })
    ).toBeTruthy();

    // El carrito se vació realmente.
    expect(
      screen.getByTestId("productos-en-carrito").textContent
    ).toBe("0");

    expect(alConfirmar).toHaveBeenCalledTimes(1);

    // La aplicación no terminó en la pantalla equivocada.
    expect(
      screen.queryByRole("heading", {
        name: "Página del carrito vacío",
      })
    ).toBeNull();

    // Se envió al backend solo el id y la cantidad (los precios los calcula el servidor).
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post.calls.mostRecent().args[0]).toBe("/boletas");
    expect(api.post.calls.mostRecent().args[1].items).toEqual([
      { productoId: 1, cantidad: 2 },
    ]);

    // Se muestra la boleta que devolvió el backend.
    expect(screen.getByText("1234")).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Copiar número de orden",
      })
    ).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Descargar comprobante",
      })
    ).toBeTruthy();
  });
});