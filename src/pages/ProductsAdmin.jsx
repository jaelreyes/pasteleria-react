import { useState, useRef } from "react";
import {
  obtenerProductos,
  guardarProducto,
  eliminarProducto,
  obtenerCategorias,
} from "../data/db";
import {
  Table,
  Button,
  Form,
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
} from "react-bootstrap";
import ProductDetailModal from "../admin/components/ProductDetailModal";

const formularioInicial = {
  id: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  imagen: "",
  precio: "",
  stock: "",
  stockCritico: 5,
  categoria: "",
  descuento: 0,
};

function obtenerLimiteCritico(producto) {
  const valor = producto.stockCritico;

  if (valor === "" || valor === null || valor === undefined) {
    return 5;
  }

  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : 5;
}

function tieneStockCritico(producto) {
  return Number(producto.stock) < obtenerLimiteCritico(producto);
}

const campos = [
  {
    name: "codigo",
    etiqueta: "Código",
    placeholder: "TC001",
    maxLength: 20,
    required: true,
    md: 4,
  },
  {
    name: "nombre",
    etiqueta: "Nombre",
    maxLength: 100,
    required: true,
    md: 8,
  },
  {
    name: "precio",
    etiqueta: "Precio",
    type: "number",
    min: 0,
    step: "any",
    required: true,
    md: 3,
  },
  {
    name: "stock",
    etiqueta: "Stock",
    type: "number",
    min: 0,
    step: 1,
    required: true,
    md: 3,
  },
  {
    name: "stockCritico",
    etiqueta: "Stock crítico",
    type: "number",
    min: 0,
    step: 1,
    required: true,
    md: 3,
  },
  {
    name: "descuento",
    etiqueta: "Descuento %",
    type: "number",
    min: 0,
    max: 100,
    step: 1,
    md: 3,
  },
  {
    name: "imagen",
    etiqueta: "Imagen",
    placeholder: "/images/productos/TC001.jpg",
    maxLength: 1000,
    required: true,
    md: 12,
  },
  {
    name: "descripcion",
    etiqueta: "Descripción",
    as: "textarea",
    rows: 3,
    maxLength: 1000,
    required: true,
    md: 12,
  },
];

export const ProductsAdmin = ({ puedeModificar = false }) => {
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [form, setForm] = useState({ ...formularioInicial });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);

  const [soloCriticos, setSoloCriticos] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [orden, setOrden] = useState({
    campo: "nombre",
    direccion: "asc",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const formularioRef = useRef(null);
  const nombreRef = useRef(null);

  const categorias = [
    ...new Set([
      ...obtenerCategorias(),
      ...productos.map((producto) => producto.categoria),
    ]),
  ].filter(Boolean);

  const categoriasFiltro = [
    ...new Set(productos.map((producto) => producto.categoria)),
  ].filter(Boolean);

  function limpiarFormulario() {
    setForm({ ...formularioInicial });
    setModoEdicion(false);
    setError("");
  }

  function handleChange(evento) {
    if (!puedeModificar) return;

    const { name, value } = evento.target;

    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));

    setError("");
    setMensaje("");
  }

  function handleEditar(producto) {
    if (!puedeModificar) return;

    setForm({
      ...formularioInicial,
      ...producto,
      codigo: producto.codigo || "",
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      imagen: producto.imagen || "",
      precio: producto.precio ?? "",
      stock: producto.stock ?? "",
      stockCritico: obtenerLimiteCritico(producto),
      categoria: producto.categoria || "",
      descuento: producto.descuento ?? 0,
    });

    setModoEdicion(true);
    setError("");
    setMensaje("");

    formularioRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    nombreRef.current?.focus({ preventScroll: true });
  }

  function handleEliminar(id) {
    if (!puedeModificar) return;

    setError("");
    setMensaje("");

    try {
      eliminarProducto(id);

      const actualizados = obtenerProductos();

      if (actualizados.some((producto) => producto.id === id)) {
        setError("No se pudo eliminar el producto.");
        return;
      }

      if (form.id === id) {
        limpiarFormulario();
      }

      setProductos(actualizados);
      setMensaje("Producto eliminado correctamente.");
    } catch {
      setError("Ocurrió un error al eliminar el producto.");
    }
  }

  function handleSubmit(evento) {
    evento.preventDefault();

    if (!puedeModificar) return;

    setError("");
    setMensaje("");

    const codigo = form.codigo.trim().toUpperCase();
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const imagen = form.imagen.trim();

    if (
      !codigo ||
      !nombre ||
      !descripcion ||
      !imagen ||
      !form.categoria ||
      String(form.precio).trim() === "" ||
      String(form.stock).trim() === "" ||
      String(form.stockCritico).trim() === ""
    ) {
      setError(
        "Completa código, nombre, precio, stock, stock crítico, categoría, imagen y descripción."
      );
      return;
    }

    if (!/^[A-Z0-9_-]{1,20}$/.test(codigo)) {
      setError(
        "El código debe tener hasta 20 letras, números, guiones o guiones bajos."
      );
      return;
    }

    const precio = Number(form.precio);
    const stock = Number(form.stock);
    const stockCritico = Number(form.stockCritico);
    const descuento = Number(form.descuento || 0);

    if (!Number.isFinite(precio) || precio < 0) {
      setError("El precio debe ser un número mayor o igual a cero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un número entero mayor o igual a cero.");
      return;
    }

    if (!Number.isInteger(stockCritico) || stockCritico < 0) {
      setError(
        "El stock crítico debe ser un número entero mayor o igual a cero."
      );
      return;
    }

    if (
      !Number.isInteger(descuento) ||
      descuento < 0 ||
      descuento > 100
    ) {
      setError("El descuento debe ser un número entero entre 0 y 100.");
      return;
    }

    const rutaLocal = imagen.startsWith("/") && !imagen.startsWith("//");
    let urlValida = false;

    try {
      const url = new URL(imagen);
      urlValida = ["http:", "https:"].includes(url.protocol);
    } catch {
      urlValida = false;
    }

    if (!rutaLocal && !urlValida) {
      setError(
        "La imagen debe ser una ruta como /images/productos/TC001.jpg o una URL http/https."
      );
      return;
    }

    try {
      const catalogoActual = obtenerProductos();

      const codigoRepetido = catalogoActual.some(
        (producto) =>
          producto.id !== form.id &&
          String(producto.codigo || "").trim().toUpperCase() === codigo
      );

      if (codigoRepetido) {
        setError("Ya existe un producto con este código.");
        return;
      }

      const productoGuardar = {
        ...form,
        codigo,
        nombre,
        descripcion,
        imagen,
        precio,
        stock,
        stockCritico,
        descuento,
      };

      guardarProducto(productoGuardar);

      const actualizados = obtenerProductos();

      const guardado = actualizados.find(
        (producto) => producto.id === productoGuardar.id
      );

      const camposGuardados = [
        "codigo",
        "nombre",
        "descripcion",
        "imagen",
        "precio",
        "stock",
        "stockCritico",
        "categoria",
        "descuento",
      ];

      const guardadoCorrectamente =
        guardado &&
        camposGuardados.every(
          (campo) => guardado[campo] === productoGuardar[campo]
        );

      if (!guardadoCorrectamente) {
        setError("No se pudo guardar el producto. Revisa el almacenamiento.");
        return;
      }

      const estabaEditando = modoEdicion;

      limpiarFormulario();
      setProductos(actualizados);

      setMensaje(
        estabaEditando
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );
    } catch {
      setError("Ocurrió un error al guardar el producto.");
    }
  }

  function limpiarFiltros() {
    setBusqueda("");
    setCategoriaFiltro("");
    setSoloCriticos(false);
  }

  function cambiarOrden(campo) {
    setOrden((actual) => ({
      campo,
      direccion:
        actual.campo === campo && actual.direccion === "asc"
          ? "desc"
          : "asc",
    }));
  }

  function indicadorOrden(campo) {
    if (orden.campo !== campo) return "↕";
    return orden.direccion === "asc" ? "↑" : "↓";
  }

  function atributoOrden(campo) {
    if (orden.campo !== campo) return "none";
    return orden.direccion === "asc" ? "ascending" : "descending";
  }

  const productosMostrados = productos
    .filter((producto) => {
      const texto = busqueda.trim().toLowerCase();

      const coincideBusqueda =
        String(producto.nombre || "").toLowerCase().includes(texto) ||
        String(producto.codigo || "").toLowerCase().includes(texto);

      const coincideCategoria =
        categoriaFiltro === "" ||
        producto.categoria === categoriaFiltro;

      const coincideStock =
        !soloCriticos || tieneStockCritico(producto);

      return coincideBusqueda && coincideCategoria && coincideStock;
    })
    .sort((a, b) => {
      const comparacion =
        orden.campo === "nombre"
          ? String(a.nombre || "").localeCompare(
              String(b.nombre || ""),
              "es",
              { sensitivity: "base", numeric: true }
            )
          : Number(a[orden.campo] || 0) -
            Number(b[orden.campo] || 0);

      return orden.direccion === "asc"
        ? comparacion
        : -comparacion;
    });

  const stockCriticoCount = productos.filter(tieneStockCritico).length;

  return (
    <Container className="my-4">
      <h2 className="fw-bold" style={{ color: "#8b4513" }}>
        Gestión de Productos
      </h2>

      <p className="text-muted">
        Control de inventario, precios y catálogo de la pastelería.
      </p>

      {!puedeModificar && (
        <Alert variant="info">
          Tu acceso es de consulta. Puedes ver el detalle, filtrar
          y ordenar los productos.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert variant="success" role="status">
          {mensaje}
        </Alert>
      )}

      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">Total Productos en Catálogo</h6>
            <h3 className="fw-bold mb-0">{productos.length}</h3>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">Productos con Stock Crítico</h6>
            <h3 className="fw-bold mb-0 text-danger">
              {stockCriticoCount}
            </h3>
          </Card>
        </Col>
      </Row>

      {puedeModificar && (
        <Card
          ref={formularioRef}
          className="shadow-sm border-0 mb-4 p-4"
          style={{ scrollMarginTop: "100px" }}
        >
          <h3 className="h5 mb-3" style={{ color: "#8b4513" }}>
            {modoEdicion
              ? "Editar Producto Existente"
              : "Registrar Nuevo Producto"}
          </h3>

          <Form noValidate onSubmit={handleSubmit}>
            <Row className="g-3">
              {campos.map((campo) => {
                const { name, etiqueta, md, ...propiedades } = campo;

                return (
                  <Col xs={12} md={md} key={name}>
                    <Form.Group controlId={`admin-producto-${name}`}>
                      <Form.Label>{etiqueta}</Form.Label>

                      <Form.Control
                        {...propiedades}
                        ref={name === "nombre" ? nombreRef : undefined}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                      />

                      {name === "imagen" && (
                        <Form.Text>
                          Usa una imagen existente en public o una URL.
                          Este campo no sube archivos.
                        </Form.Text>
                      )}

                      {name === "stockCritico" && (
                        <Form.Text>
                          Se marca como crítico cuando el stock está
                          por debajo de este número.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                );
              })}

              <Col xs={12}>
                <Form.Group controlId="admin-producto-categoria">
                  <Form.Label>Categoría</Form.Label>

                  <Form.Select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione Categoría</option>

                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3 text-end">
              {modoEdicion && (
                <Button
                  type="button"
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    limpiarFormulario();
                    setMensaje("");
                  }}
                >
                  Cancelar
                </Button>
              )}

              <Button
                type="submit"
                style={{ background: "#8b4513", border: "none" }}
              >
                {modoEdicion
                  ? "Actualizar Producto"
                  : "Guardar Producto"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <Card className="shadow-sm border-0 mb-4 p-3">
        <Row className="g-3">
          <Col xs={12} md={7}>
            <Form.Group controlId="admin-busqueda-productos">
              <Form.Label>Buscar productos</Form.Label>

              <Form.Control
                type="search"
                placeholder="Buscar por nombre o código"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={5}>
            <Form.Group controlId="admin-filtro-categoria">
              <Form.Label>Filtrar por categoría</Form.Label>

              <Form.Select
                value={categoriaFiltro}
                onChange={(evento) =>
                  setCategoriaFiltro(evento.target.value)
                }
              >
                <option value="">Todas las categorías</option>

                {categoriasFiltro.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
          <Button
            type="button"
            variant={soloCriticos ? "danger" : "outline-secondary"}
            onClick={() => setSoloCriticos((actual) => !actual)}
          >
            {soloCriticos
              ? "Ver Todos los Productos"
              : "Filtrar por Stock Crítico"}
          </Button>

          <Button
            type="button"
            variant="outline-secondary"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </Button>

          <span className="text-muted" role="status">
            Mostrando {productosMostrados.length} de {productos.length} productos
          </span>
        </div>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover striped className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Código</th>

                {[
                  { campo: "nombre", etiqueta: "Nombre" },
                  { campo: "precio", etiqueta: "Precio" },
                  { campo: "stock", etiqueta: "Stock" },
                ].map(({ campo, etiqueta }) => (
                  <th key={campo} aria-sort={atributoOrden(campo)}>
                    <button
                      type="button"
                      className="btn btn-link p-0 fw-bold text-decoration-none"
                      style={{ color: "#8b4513" }}
                      onClick={() => cambiarOrden(campo)}
                      aria-label={`Ordenar por ${etiqueta.toLowerCase()}`}
                    >
                      {etiqueta}{" "}
                      <span aria-hidden="true">
                        {indicadorOrden(campo)}
                      </span>
                    </button>
                  </th>
                ))}

                <th>Stock crítico</th>
                <th>Descuento</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosMostrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No hay productos para mostrar.
                  </td>
                </tr>
              ) : (
                productosMostrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.codigo || "Sin código"}</td>

                    <td className="fw-bold">{producto.nombre}</td>

                    <td className="text-success fw-bold">
                      ${Number(producto.precio).toLocaleString("es-CL")}
                    </td>

                    <td>
                      {producto.stock}

                      {tieneStockCritico(producto) && (
                        <Badge bg="danger" className="ms-1">
                          Crítico
                        </Badge>
                      )}
                    </td>

                    <td>{obtenerLimiteCritico(producto)}</td>

                    <td>{Number(producto.descuento) || 0}%</td>

                    <td>
                      <Badge bg="secondary">{producto.categoria}</Badge>
                    </td>

                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setProductoDetalle(producto)}
                        >
                          Ver detalle
                        </Button>

                        {puedeModificar && (
                          <>
                            <Button
                              type="button"
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleEditar(producto)}
                            >
                              Editar
                            </Button>

                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleEliminar(producto.id)}
                            >
                              Eliminar
                            </Button>
                          </>
                        )}
                      </div>

                      {!puedeModificar && (
                        <small className="text-muted d-block mt-1">
                          Solo consulta
                        </small>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <ProductDetailModal
        producto={productoDetalle}
        onCerrar={() => setProductoDetalle(null)}
      />
    </Container>
  );
};

export default ProductsAdmin;