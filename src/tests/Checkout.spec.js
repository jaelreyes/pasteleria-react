// Pruebas del checkout conectado al backend: sesión obligatoria, validaciones,
// envío de la compra (POST /boletas) y errores del servidor. La API se simula con spyOn.
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
  useLocation,
} from "react-router-dom";
import Checkout from "../pages/Checkout";
import api from "../services/api";

const productoPrueba = {
  id: 1,
  codigo: "TC001",
  nombre: "Torta de Chocolate",
  imagen: "/images/productos/TC001.jpg",
  precio: 45000,
  descuento: 15,
  stock: 5,
};

const carritoPrueba = [{ ...productoPrueba, cantidad: 2 }];

const usuarioPrueba = {
  nombre: "Ana",
  apellidos: "Soto",
  correo: "ana@gmail.com",
  telefono: "+56 9 1234 5678",
  direccion: "Calle Las Flores 123",
  rol: "cliente",
};

// Boleta que devuelve el backend al confirmar.
const boletaBackend = { id: 77, total: 45000, productos: [] };

// Página de destino: muestra el id de la URL y si recibió la boleta.
function PagoExitoso() {
  const { idOrden } = useParams();
  const { state } = useLocation();

  return (
    <p>
      Compra confirmada: <span data-testid="id-orden">{idOrden}</span>
      <span data-testid="total">{state?.orden?.total}</span>
    </p>
  );
}

function dibujarCheckout({ carrito = carritoPrueba, descuento = 50 } = {}) {
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
        <Route path="/carrito" element={<p>Página del carrito</p>} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/pago/exito/:idOrden" element={<PagoExitoso />} />
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
  escribir(/^Región/, "Valparaíso");
  escribir(/^Comuna/, "Viña del Mar");
}

function confirmarCompra() {
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmar compra simulada" })
  );
}

// Error HTTP como lo entrega axios.
function errorHttp(status, mensaje) {
  return Promise.reject({ response: { status, data: { mensaje } } });
}

describe("Checkout", () => {
  let almacenamiento;

  beforeEach(() => {
    almacenamiento = { usuarioActivo: JSON.stringify(usuarioPrueba) };

    spyOn(Storage.prototype, "getItem").and.callFake((clave) =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave)
        ? almacenamiento[clave]
        : null
    );
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => {
      almacenamiento[clave] = String(valor);
    });

    // Por defecto el backend confirma la compra.
    spyOn(api, "post").and.returnValue(Promise.resolve({ data: boletaBackend }));
  });

  afterEach(cleanup);

  it("redirige al carrito si no tiene productos", () => {
    const onCompraConfirmada = dibujarCheckout({ carrito: [] });

    expect(screen.getByText("Página del carrito")).toBeTruthy();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("exige iniciar sesión antes de pagar", () => {
    delete almacenamiento.usuarioActivo;

    dibujarCheckout();

    expect(screen.getByText("Página de login")).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("muestra el total considerando cantidades y descuentos", () => {
    dibujarCheckout();

    expect(screen.getByText("Subtotal sin descuentos: $90.000")).toBeTruthy();
    expect(screen.getByText("Ahorro total: $45.000")).toBeTruthy();
    expect(screen.getByText("Total: $45.000")).toBeTruthy();
  });

  it("recupera los datos de despacho de la sesión", () => {
    dibujarCheckout();

    expect(screen.getByLabelText(/^Nombre y apellidos/).value).toBe("Ana Soto");
    expect(screen.getByLabelText(/^Correo electrónico/).value).toBe("ana@gmail.com");
    expect(screen.getByLabelText(/^Teléfono/).value).toBe("+56 9 1234 5678");
    expect(screen.getByLabelText(/^Dirección de despacho/).value).toBe("Calle Las Flores 123");
  });

  it("no envía la compra si faltan datos obligatorios", () => {
    const onCompraConfirmada = dibujarCheckout();
    escribir(/^Nombre y apellidos/, "");

    confirmarCompra();

    expect(
      screen.getByText("Completa todos los campos obligatorios de despacho.")
    ).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
  });

  it("rechaza un correo inválido", () => {
    dibujarCheckout();
    completarDespacho();
    escribir(/^Correo electrónico/, "correo-invalido");

    confirmarCompra();

    expect(screen.getByText("Ingresa un correo electrónico válido.")).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("rechaza un teléfono inválido", () => {
    dibujarCheckout();
    completarDespacho();
    escribir(/^Teléfono/, "abc");

    confirmarCompra();

    expect(screen.getByText("Ingresa un teléfono válido de 8 a 15 dígitos.")).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("envía al backend solo id y cantidad, y navega a la boleta", async () => {
    const onCompraConfirmada = dibujarCheckout();
    completarDespacho();

    confirmarCompra();

    expect(await screen.findByTestId("id-orden")).toBeTruthy();
    expect(screen.getByTestId("id-orden").textContent).toBe("77");
    expect(screen.getByTestId("total").textContent).toBe("45000");

    const [ruta, datos] = api.post.calls.mostRecent().args;
    expect(ruta).toBe("/boletas");
    expect(datos.items).toEqual([{ productoId: 1, cantidad: 2 }]);
    expect(datos.nombre).toBe("Ana Soto");
    expect(datos.region).toBe("Valparaíso");
    // Los precios NO se envían: los calcula el servidor.
    expect(datos.total).toBeUndefined();
    expect(onCompraConfirmada).toHaveBeenCalledTimes(1);
  });

  it("muestra el error de stock del backend y no vacía el carrito", async () => {
    api.post.and.returnValue(
      errorHttp(409, 'Solo quedan 1 unidades de "Torta de Chocolate".')
    );
    const onCompraConfirmada = dibujarCheckout();
    completarDespacho();

    confirmarCompra();

    expect(
      await screen.findByText('Solo quedan 1 unidades de "Torta de Chocolate".')
    ).toBeTruthy();
    expect(onCompraConfirmada).not.toHaveBeenCalled();
    expect(screen.queryByTestId("id-orden")).toBeNull();
  });

  it("avisa si no se puede conectar con el servidor", async () => {
    api.post.and.returnValue(Promise.reject({}));
    dibujarCheckout();
    completarDespacho();

    confirmarCompra();

    expect(await screen.findByText("No se pudo conectar con el servidor.")).toBeTruthy();
  });

  it("permite reintentar después de un error", async () => {
    api.post.and.returnValues(
      errorHttp(409, "Sin stock."),
      Promise.resolve({ data: boletaBackend })
    );
    dibujarCheckout();
    completarDespacho();

    confirmarCompra();
    await screen.findByText("Sin stock.");

    confirmarCompra();
    expect(await screen.findByTestId("id-orden")).toBeTruthy();
    expect(api.post).toHaveBeenCalledTimes(2);
  });
});
