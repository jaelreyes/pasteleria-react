// Pruebas de productos en el panel: listar, crear, editar y permisos.
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import ProductsAdmin from "../admin/pages/ProductsAdmin";

const productoInicial = {
  id: 1,
  codigo: "TC001",
  nombre: "Torta de Chocolate",
  descripcion: "Bizcocho con ganache.",
  imagen: "/images/productos/TC001.jpg",
  precio: 45000,
  stock: 5,
  stockCritico: 2,
  categoria: "Tortas Cuadradas",
  descuento: 0,
};

function dibujarAdministrador() {
  render(
    <ProductsAdmin
      puedeModificar={true}
      modo="listado"
    />
  );
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  });
}

function editarProducto() {
  fireEvent.click(
    screen.getByRole("button", { name: "Editar", exact: true })
  );
}

function actualizarProducto() {
  fireEvent.click(
    screen.getByRole("button", { name: "Actualizar Producto" })
  );
}

describe("ProductsAdmin", () => {
  let almacenamiento;

  // Antes de cada prueba: prepara datos limpios y los mocks.
  beforeEach(() => {
    almacenamiento = {
      productos: JSON.stringify([productoInicial]),
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

    spyOn(Element.prototype, "scrollIntoView").and.stub();
  });

  afterEach(cleanup);

  it("carga el producto en el formulario y enfoca su nombre", () => {
    dibujarAdministrador();
    editarProducto();

    expect(
      screen.getByRole("heading", {
        name: "Editar Producto Existente",
      })
    ).toBeTruthy();

    const nombre = screen.getByLabelText("Nombre");

    expect(nombre.value).toBe("Torta de Chocolate");
    expect(screen.getByLabelText("Precio").value).toBe("45000");
    expect(screen.getByLabelText("Stock").value).toBe("5");
    expect(screen.getByLabelText("Categoría").value).toBe(
      "Tortas Cuadradas"
    );

    expect(document.activeElement).toBe(nombre);
  });

  it("guarda stock cero conservando código, imagen y descripción", () => {
    dibujarAdministrador();
    editarProducto();
    escribir("Stock", "0");

    actualizarProducto();

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      { ...productoInicial, stock: 0 },
    ]);

    expect(
      screen.getByText("Producto actualizado correctamente.")
    ).toBeTruthy();

    const fila = screen.getByRole("row", {
      name: /Torta de Chocolate/,
    });

    expect(within(fila).getByText("Agotado")).toBeTruthy();
  });

  it("rechaza un stock negativo sin modificar el catálogo", () => {
    dibujarAdministrador();
    editarProducto();
    escribir("Stock", "-1");

    actualizarProducto();

    expect(screen.getByRole("alert").textContent).toContain(
      "El stock debe ser un número entero mayor o igual a cero."
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      productoInicial,
    ]);
  });

  it("rechaza descuentos mayores al 100%", () => {
    dibujarAdministrador();
    editarProducto();
    escribir("Descuento %", "120");

    actualizarProducto();

    expect(screen.getByRole("alert").textContent).toContain(
      "El descuento debe ser un número entero entre 0 y 100."
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("cancelar descarta los cambios sin guardar", () => {
    dibujarAdministrador();
    editarProducto();
    escribir("Nombre", "Nombre que no se debe guardar");

    fireEvent.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    // El formulario se cierra y vuelve el listado.
    expect(screen.queryByLabelText("Nombre")).toBeNull();

    expect(
      screen.getByRole("heading", {
        name: "Listado de Productos",
      })
    ).toBeTruthy();

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      productoInicial,
    ]);

    expect(localStorage.setItem).not.toHaveBeenCalled();

    // Al editar otra vez, se recupera el nombre original.
    editarProducto();

    expect(screen.getByLabelText("Nombre").value).toBe(
      "Torta de Chocolate"
    );
  });

  it("informa cuando falla el guardado y mantiene el formulario", () => {
    localStorage.setItem.and.throwError("Almacenamiento bloqueado");
    spyOn(console, "error").and.stub();

    dibujarAdministrador();
    editarProducto();
    escribir("Stock", "6");

    actualizarProducto();

    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar el producto. Revisa el almacenamiento."
    );

    expect(screen.getByLabelText("Stock").value).toBe("6");

    expect(JSON.parse(almacenamiento.productos)).toEqual([
      productoInicial,
    ]);
  });

  it("permite al vendedor consultar sin controles de modificación", () => {
    render(
      <ProductsAdmin
        puedeModificar={false}
        modo="listado"
      />
    );

    expect(screen.getByText("Torta de Chocolate")).toBeTruthy();
    expect(screen.getByText("Solo consulta")).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "Ver detalle" })
    ).toBeTruthy();

    expect(
      screen.queryByRole("button", { name: "Editar", exact: true })
    ).toBeNull();

    expect(
      screen.queryByRole("button", { name: "Eliminar", exact: true })
    ).toBeNull();

    expect(
      screen.queryByRole("button", { name: "Guardar Producto" })
    ).toBeNull();

    expect(screen.queryByLabelText("Nombre")).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});