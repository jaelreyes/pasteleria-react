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

  beforeEach(() => {
    almacenamiento = {
      productos: JSON.stringify([producto]),
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

    const ordenes = JSON.parse(almacenamiento.ordenes);

    expect(ordenes.length).toBe(1);
    expect(ordenes[0].estado).toBe("pendiente");
    expect(screen.getByText(ordenes[0].id)).toBeTruthy();

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

    // Las dos unidades compradas se descontaron una sola vez.
    expect(
      JSON.parse(almacenamiento.productos)[0].stock
    ).toBe(3);
  });
});