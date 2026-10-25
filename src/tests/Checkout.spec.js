import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import {
  MemoryRouter,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import Checkout from "../pages/Checkout";

const productoPrueba = {
  id: 1,
  codigo: "TC001",
  nombre: "Torta de Chocolate",
  imagen: "/images/productos/TC001.jpg",
  precio: 45000,
  descuento: 15,
  stock: 5,
};

const carritoPrueba = [
  {
    ...productoPrueba,
    cantidad: 2,
  },
];

function PagoExitoso() {
  const { idOrden } = useParams();

  return (
    <p>
      Compra confirmada:{" "}
      <span data-testid="id-orden">{idOrden}</span>
    </p>
  );
}

function dibujarCheckout({
  carrito = carritoPrueba,
  descuento = 50,
} = {}) {
  const onCompraConfirmada = jasmine.createSpy("onCompraConfirmada");

  render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route
          path="/checkout"
          element={
            <Checkout
              carrito={carrito}
              descuento={descuento}
              onCompraConfirmada={onCompraConfirmada}
            />
          }
        />

        <Route
          path="/carrito"
          element={<p>Página del carrito</p>}
        />

        <Route
          path="/pago/exito/:idOrden"
          element={<PagoExitoso />}
        />
      </Routes>
    </MemoryRouter>
  );

  return onCompraConfirmada;
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  });
}

function completarDespacho() {
  escribir(/^Nombre y apellidos/, "Ana Soto");
  escribir(/^Correo electrónico/, "ana@gmail.com");
  escribir(/^Teléfono/, "+56 9 1234 5678");
  escribir(/^Dirección de despacho/, "Calle Las Flores 123");
}

function confirmarCompra() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Confirmar compra simulada",
    })
  );
}

describe("Checkout", () => {
  let almacenamiento;

  beforeEach(() => {
    almacenamiento = {
      productos: JSON.stringify([productoPrueba]),
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

  it("redirige al carrito si no tiene productos", () => {
    const onCompraConfirmada = dibujarCheckout({ carrito: [] });

    expect(screen.getByText("Página del carrito")).toBeTruthy();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("muestra el total real considerando cantidades y descuentos", () => {
    dibujarCheckout();

    expect(
      screen.getByText("Subtotal sin descuentos: $90.000")
    ).toBeTruthy();

    expect(
      screen.getByText("Ahorro total: $45.000")
    ).toBeTruthy();

    expect(
      screen.getByText("Total: $45.000")
    ).toBeTruthy();
  });

  it("recupera los datos de despacho presentes en la sesión", () => {
    almacenamiento.usuarioActivo = JSON.stringify({
      nombre: "Ana",
      apellidos: "Soto",
      correo: "ana@gmail.com",
      telefono: "+56 9 1234 5678",
      direccion: "Calle Las Flores 123",
    });

    dibujarCheckout();

    expect(
      screen.getByLabelText(/^Nombre y apellidos/).value
    ).toBe("Ana Soto");

    expect(
      screen.getByLabelText(/^Correo electrónico/).value
    ).toBe("ana@gmail.com");

    expect(
      screen.getByLabelText(/^Teléfono/).value
    ).toBe("+56 9 1234 5678");

    expect(
      screen.getByLabelText(/^Dirección de despacho/).value
    ).toBe("Calle Las Flores 123");
  });

  it("no guarda una orden si faltan datos obligatorios", () => {
    const onCompraConfirmada = dibujarCheckout();

    confirmarCompra();

    expect(
      screen.getByText(
        "Completa todos los campos obligatorios de despacho."
      )
    ).toBeTruthy();

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("rechaza un correo inválido", () => {
    dibujarCheckout();
    completarDespacho();
    escribir(/^Correo electrónico/, "correo-invalido");

    confirmarCompra();

    expect(
      screen.getByText("Ingresa un correo electrónico válido.")
    ).toBeTruthy();

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("rechaza un teléfono inválido", () => {
    dibujarCheckout();
    completarDespacho();
    escribir(/^Teléfono/, "123");

    confirmarCompra();

    expect(
      screen.getByText("Ingresa un teléfono válido de 8 a 15 dígitos.")
    ).toBeTruthy();

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("guarda la orden y navega al resultado con su identificador", () => {
    const onCompraConfirmada = dibujarCheckout();

    completarDespacho();
    confirmarCompra();

    const ordenes = JSON.parse(almacenamiento.ordenes);

    expect(ordenes.length).toBe(1);

    const orden = ordenes[0];

    expect(orden).toEqual(
      jasmine.objectContaining({
        nombre: "Ana Soto",
        email: "ana@gmail.com",
        telefono: "+56 9 1234 5678",
        direccion: "Calle Las Flores 123",
        subtotal: 90000,
        ahorro: 45000,
        total: 45000,
        estado: "pendiente",
        pagoSimulado: true,
        metodoPago: "webpay",
      })
    );

    expect(orden.productos).toEqual([
      jasmine.objectContaining({
        id: 1,
        cantidad: 2,
        precioBase: 45000,
        precioFinal: 22500,
        descuentoAplicado: 50,
      }),
    ]);

    expect(onCompraConfirmada).toHaveBeenCalledTimes(1);

    expect(
      screen.getByTestId("id-orden").textContent
    ).toBe(orden.id);
  });

  it("descuenta las unidades compradas del catálogo", () => {
    dibujarCheckout();
    completarDespacho();
    confirmarCompra();

    const productos = JSON.parse(almacenamiento.productos);

    expect(productos).toEqual([
      { ...productoPrueba, stock: 3 },
    ]);
  });

  it("permite comprar exactamente todas las unidades disponibles", () => {
    dibujarCheckout({
      carrito: [{ ...productoPrueba, cantidad: 5 }],
    });

    completarDespacho();
    confirmarCompra();

    const productos = JSON.parse(almacenamiento.productos);

    expect(productos[0].stock).toBe(0);
    expect(screen.getByTestId("id-orden")).toBeTruthy();
  });

  it("no modifica el stock de productos que no se compraron", () => {
    const otroProducto = {
      ...productoPrueba,
      id: 2,
      codigo: "TC002",
      nombre: "Torta de Frutas",
      stock: 12,
    };

    almacenamiento.productos = JSON.stringify([
      productoPrueba,
      otroProducto,
    ]);

    dibujarCheckout();
    completarDespacho();
    confirmarCompra();

    const productos = JSON.parse(almacenamiento.productos);

    expect(productos.find((producto) => producto.id === 1).stock).toBe(3);

    expect(
      productos.find((producto) => producto.id === 2)
    ).toEqual(otroProducto);
  });

  it("conserva las órdenes anteriores al confirmar una nueva", () => {
    const ordenAnterior = {
      id: "ORD-ANTERIOR",
      nombre: "Cliente anterior",
      total: 10000,
    };

    almacenamiento.ordenes = JSON.stringify([ordenAnterior]);

    dibujarCheckout();
    completarDespacho();
    confirmarCompra();

    const ordenes = JSON.parse(almacenamiento.ordenes);

    expect(ordenes.length).toBe(2);
    expect(ordenes[0]).toEqual(ordenAnterior);
    expect(ordenes[1].total).toBe(45000);
  });

  it("rechaza la compra si el stock actual es insuficiente", () => {
    const onCompraConfirmada = dibujarCheckout();

    completarDespacho();

    // El stock cambia después de abrir Checkout.
    almacenamiento.productos = JSON.stringify([
      { ...productoPrueba, stock: 1 },
    ]);

    confirmarCompra();

    expect(screen.getByRole("alert").textContent).toContain(
      'Solo quedan 1 unidades de "Torta de Chocolate"'
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
    expect(screen.queryByTestId("id-orden")).toBeNull();

    expect(JSON.parse(almacenamiento.ordenes)).toEqual([]);
    expect(JSON.parse(almacenamiento.productos)[0].stock).toBe(1);
  });

  it("rechaza un producto eliminado del catálogo", () => {
    almacenamiento.productos = JSON.stringify([]);

    const onCompraConfirmada = dibujarCheckout();

    completarDespacho();
    confirmarCompra();

    expect(screen.getByRole("alert").textContent).toContain(
      "ya no está disponible"
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
    expect(JSON.parse(almacenamiento.ordenes)).toEqual([]);
  });

  it("rechaza la compra si cambió el precio del producto", () => {
    const onCompraConfirmada = dibujarCheckout();

    completarDespacho();

    almacenamiento.productos = JSON.stringify([
      { ...productoPrueba, precio: 50000 },
    ]);

    confirmarCompra();

    expect(screen.getByRole("alert").textContent).toContain(
      'Cambió el precio de "Torta de Chocolate"'
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
    expect(JSON.parse(almacenamiento.ordenes)).toEqual([]);
  });

  it("rechaza la compra si cambia la oferta y afecta el precio final", () => {
    const onCompraConfirmada = dibujarCheckout({ descuento: 0 });

    completarDespacho();

    almacenamiento.productos = JSON.stringify([
      { ...productoPrueba, descuento: 25 },
    ]);

    confirmarCompra();

    expect(screen.getByRole("alert").textContent).toContain(
      'Cambió el precio de "Torta de Chocolate"'
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("no confirma ni navega cuando falla el guardado del stock", () => {
    localStorage.setItem.and.throwError("Almacenamiento bloqueado");

    const productosAnteriores = almacenamiento.productos;
    const ordenesAnteriores = almacenamiento.ordenes;

    const onCompraConfirmada = dibujarCheckout();

    completarDespacho();
    confirmarCompra();

    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar la compra. El carrito se conserva."
    );

    expect(almacenamiento.productos).toBe(productosAnteriores);
    expect(almacenamiento.ordenes).toBe(ordenesAnteriores);
    expect(onCompraConfirmada).not.toHaveBeenCalled();
    expect(screen.queryByTestId("id-orden")).toBeNull();

    expect(
      screen.getByRole("button", {
        name: "Confirmar compra simulada",
      }).disabled
    ).toBe(false);
  });

  it("restaura el stock si falla el guardado de la orden", () => {
    const productosAnteriores = almacenamiento.productos;
    const ordenesAnteriores = almacenamiento.ordenes;

    localStorage.setItem.and.callFake((clave, valor) => {
      if (clave === "ordenes") {
        throw new Error("No se pudo guardar la orden");
      }

      almacenamiento[clave] = String(valor);
    });

    const onCompraConfirmada = dibujarCheckout();

    completarDespacho();
    confirmarCompra();

    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar la compra. El carrito se conserva."
    );

    expect(almacenamiento.productos).toBe(productosAnteriores);
    expect(almacenamiento.ordenes).toBe(ordenesAnteriores);
    expect(onCompraConfirmada).not.toHaveBeenCalled();
    expect(screen.queryByTestId("id-orden")).toBeNull();

    expect(
      screen.getByRole("button", {
        name: "Confirmar compra simulada",
      }).disabled
    ).toBe(false);
  });
});