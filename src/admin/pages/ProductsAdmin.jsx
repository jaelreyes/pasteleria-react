import { useEffect, useRef, useState } from "react";
import {
  listarProductosAdmin,
  crearProductoAdmin,
  actualizarProductoAdmin,
  eliminarProductoAdmin,
} from "../../services/productoAdminService";
import { listarCategorias } from "../../services/categoriaService";
import { mensajeError } from "../../services/api";
import {
  Table,
  Button,
  Form,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import ProductDetailModal from "../components/ProductDetailModal";

const formularioInicial = {
  id: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  imagen: "",
  precio: "",
  stock: "",
  stockCritico: 5,
  categoriaId: "",
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
  return Number(producto.stock) <= obtenerLimiteCritico(producto);
}

function requiereAtencion(producto) {
  return Number(producto.stock) === 0 || tieneStockCritico(producto);
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
    min: 1,
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
    maxLength: 500,
    required: true,
    md: 12,
  },
  {
    name: "descripcion",
    etiqueta: "Descripción",
    as: "textarea",
    rows: 4,
    maxLength: 1000,
    required: true,
    md: 12,
  },
];

export const ProductsAdmin = ({
  puedeModificar = false,
  modo = "listado",
}) => {
  const [productos, setProductos] = useState([]);
  const [categoriasLista, setCategoriasLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ ...formularioInicial });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [creando, setCreando] = useState(false);
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

  const mostrarFormulario =
    puedeModificar && (modoEdicion || creando || modo === "nuevo");

  async function cargarDatos() {
    try {
      setCargando(true);
      const [prods, cats] = await Promise.all([
        listarProductosAdmin(),
        listarCategorias(),
      ]);
      setProductos(prods);
      setCategoriasLista(cats);
    } catch (err) {
      setError(mensajeError(err, "No se pudieron cargar los productos."));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const categoriasFiltro = [
    ...new Set(productos.map((producto) => producto.categoria)),
  ].filter(Boolean);

  useEffect(() => {
    if (mostrarFormulario) {
      formularioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      nombreRef.current?.focus({ preventScroll: true });
    }
  }, [mostrarFormulario, modoEdicion, form.id]);

  function limpiarFormulario() {
    setForm({ ...formularioInicial });
    setModoEdicion(false);
    setCreando(false);
    setError("");
  }

  function nuevoProducto() {
    if (!puedeModificar) return;
    limpiarFormulario();
    setMensaje("");
    setCreando(true);
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

    const catEncontrada = categoriasLista.find(
      (c) =>
        String(c.id) === String(producto.categoriaId) ||
        c.nombre === producto.categoria
    );

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
      categoriaId: catEncontrada ? String(catEncontrada.id) : "",
      descuento: producto.descuento ?? 0,
    });

    setModoEdicion(true);
    setCreando(false);
    setError("");
    setMensaje("");
  }

  async function handleEliminar(id) {
    if (!puedeModificar) return;
    if (!window.confirm("¿Desactivar este producto del catálogo?")) return;

    setError("");
    setMensaje("");

    try {
      await eliminarProductoAdmin(id);
      if (form.id === id) {
        limpiarFormulario();
      }
      await cargarDatos();
      setMensaje("Producto eliminado correctamente.");
    } catch (err) {
      setError(mensajeError(err, "Ocurrió un error al eliminar el producto."));
    }
  }

  async function handleSubmit(evento) {
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
      !form.categoriaId ||
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

    if (!Number.isFinite(precio) || precio <= 0) {
      setError("El precio debe ser un número mayor que cero.");
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

    if (!Number.isInteger(descuento) || descuento < 0 || descuento > 100) {
      setError("El descuento debe ser un número entero entre 0 y 100.");
      return;
    }

    const rutaLocal = imagen.startsWith("/") && !imagen.startsWith("//");
    let urlValida;
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

    const codigoRepetido = productos.some(
      (producto) =>
        producto.id !== form.id &&
        String(producto.codigo || "").trim().toUpperCase() === codigo
    );

    if (codigoRepetido) {
      setError("Ya existe un producto con este código.");
      return;
    }

    try {
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

      const estabaEditando = modoEdicion;

      if (estabaEditando) {
        await actualizarProductoAdmin(form.id, productoGuardar);
      } else {
        await crearProductoAdmin(productoGuardar);
      }

      limpiarFormulario();
      await cargarDatos();

      setMensaje(
        estabaEditando
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );
    } catch (err) {
      setError(mensajeError(err, "Ocurrió un error al guardar el producto."));
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
        actual.campo === campo && actual.direccion === "asc" ? "desc" : "asc",
    }));
  }

  const productosAtencion = productos.filter(requiereAtencion);

  const productosMostrados = productos
    .filter((producto) => {
      const texto = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        String(producto.nombre || "").toLowerCase().includes(texto) ||
        String(producto.codigo || "").toLowerCase().includes(texto);

      return (
        coincideBusqueda &&
        (!categoriaFiltro || producto.categoria === categoriaFiltro) &&
        (!soloCriticos || requiereAtencion(producto))
      );
    })
    .sort((a, b) => {
      const resultado = ["precio", "stock"].includes(orden.campo)
        ? Number(a[orden.campo] || 0) - Number(b[orden.campo] || 0)
        : String(a[orden.campo] || "").localeCompare(
            String(b[orden.campo] || ""),
            "es",
            { sensitivity: "base", numeric: true }
          );

      return orden.direccion === "asc" ? resultado : -resultado;
    });

  function encabezado(campo, etiqueta) {
    const activo = orden.campo === campo;
    return (
      <th
        aria-sort={
          !activo
            ? "none"
            : orden.direccion === "asc"
              ? "ascending"
              : "descending"
        }
      >
        <button
          type="button"
          className="admin-tabla-orden"
          onClick={() => cambiarOrden(campo)}
          aria-label={`Ordenar por ${etiqueta.toLowerCase()}`}
        >
          {etiqueta}{" "}
          <span aria-hidden="true">
            {activo ? (orden.direccion === "asc" ? "↑" : "↓") : "↕"}
          </span>
        </button>
      </th>
    );
  }

  return (
    <Container className="admin-productos-page">
      <h2 className="admin-productos-titulo">
        {modoEdicion
          ? "Editar Producto"
          : mostrarFormulario
            ? "Nuevo Producto"
            : "Listado de Productos"}
      </h2>

      <p className="admin-productos-subtitulo">
        {mostrarFormulario
          ? "Completa los datos del producto."
          : "Administra el catálogo de la tienda: precio, stock y categorías."}
      </p>

      {!puedeModificar && (
        <Alert variant="info">
          Tu acceso es de consulta. Puedes ver el detalle, filtrar y ordenar
          los productos.
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

      {mostrarFormulario ? (
        <div ref={formularioRef} className="admin-producto-formulario">
          <h3 className="h5 mb-4">
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
                        </Form.Text>
                      )}
                      {name === "stockCritico" && (
                        <Form.Text>
                          Se marca como crítico cuando el stock es menor o igual
                          a este número.
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
                    name="categoriaId"
                    value={form.categoriaId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione Categoría</option>
                    {categoriasLista.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button type="submit" className="admin-producto-boton-principal">
                {modoEdicion ? "Actualizar Producto" : "Guardar Producto"}
              </Button>

              {modo === "listado" ? (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    limpiarFormulario();
                    setMensaje("");
                  }}
                >
                  Cancelar
                </Button>
              ) : (
                <p className="small text-muted align-self-center mb-0">
                  Puedes volver desde Listado de Productos en el menú.
                </p>
              )}
            </div>
          </Form>
        </div>
      ) : (
        <>
          {puedeModificar && (
            <Button
              type="button"
              className="admin-producto-boton-principal mb-4"
              onClick={nuevoProducto}
            >
              Nuevo Producto
            </Button>
          )}

          {productosAtencion.length > 0 && (
            <div className="admin-productos-aviso">
              <strong>Hay productos con stock crítico o agotado:</strong>
              <ul>
                {productosAtencion.map((producto) => (
                  <li key={producto.id}>
                    {producto.nombre}{" "}
                    {Number(producto.stock) === 0
                      ? "(agotado)."
                      : `(stock ${producto.stock} de un crítico de ${obtenerLimiteCritico(producto)}).`}{" "}
                    <button
                      type="button"
                      onClick={() => setProductoDetalle(producto)}
                    >
                      Ver detalle.
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Row className="g-3 mb-3">
            <Col xs={12} md={5}>
              <Form.Group controlId="admin-filtro-categoria">
                <Form.Label>Filtrar por categoría</Form.Label>
                <Form.Select
                  value={categoriaFiltro}
                  onChange={(evento) => setCategoriaFiltro(evento.target.value)}
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

            <Col xs={12} md={7}>
              <Form.Group controlId="admin-busqueda-productos">
                <Form.Label>Buscar productos</Form.Label>
                <Form.Control
                  type="search"
                  placeholder="Nombre o código..."
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
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

            <span className="text-muted small" role="status">
              Mostrando {productosMostrados.length} de {productos.length}{" "}
              productos
            </span>
          </div>

          {cargando ? (
            <p className="text-muted">Cargando productos...</p>
          ) : (
            <Table responsive className="admin-productos-tabla align-middle">
              <thead>
                <tr>
                  <th>Imagen</th>
                  {encabezado("codigo", "Código")}
                  {encabezado("nombre", "Nombre")}
                  <th>Categoría</th>
                  {encabezado("precio", "Precio")}
                  {encabezado("stock", "Stock")}
                  <th>Estado</th>
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
                  productosMostrados.map((producto) => {
                    const agotado = Number(producto.stock) === 0;
                    const critico = tieneStockCritico(producto);

                    return (
                      <tr
                        key={producto.id}
                        className={
                          agotado
                            ? "producto-fila-agotado"
                            : critico
                              ? "producto-fila-critico"
                              : ""
                        }
                      >
                        <td>
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="admin-producto-miniatura"
                            loading="lazy"
                          />
                        </td>

                        <td>{producto.codigo || "Sin código"}</td>
                        <td>{producto.nombre}</td>

                        <td>
                          <span className="admin-producto-categoria">
                            {producto.categoria}
                          </span>
                        </td>

                        <td>
                          ${Number(producto.precio).toLocaleString("es-CL")}
                        </td>

                        <td>{producto.stock}</td>

                        <td>
                          <span
                            className={`admin-producto-estado ${
                              agotado
                                ? "agotado"
                                : critico
                                  ? "critico"
                                  : "disponible"
                            }`}
                          >
                            {agotado
                              ? "Agotado"
                              : critico
                                ? "Crítico"
                                : "Disponible"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-producto-acciones">
                            <button
                              type="button"
                              className="accion-ver"
                              onClick={() => setProductoDetalle(producto)}
                            >
                              Ver detalle
                            </button>

                            {puedeModificar && (
                              <>
                                <button
                                  type="button"
                                  className="accion-editar"
                                  onClick={() => handleEditar(producto)}
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="accion-eliminar"
                                  onClick={() => handleEliminar(producto.id)}
                                >
                                  Eliminar
                                </button>
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
                    );
                  })
                )}
              </tbody>
            </Table>
          )}
        </>
      )}

      <ProductDetailModal
        producto={productoDetalle}
        onCerrar={() => setProductoDetalle(null)}
      />
    </Container>
  );
};

export default ProductsAdmin;