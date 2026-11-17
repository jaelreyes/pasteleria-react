import { useState, useEffect, useRef } from "react";
import { Alert, Badge, Button, Card, Form, InputGroup, Table } from "react-bootstrap";
import { obtenerCategoriasAPI, crearCategoria, actualizarCategoria, eliminarCategoriaAPI } from "../../services/categoriaService";
import { listarProductosAdmin, errorCatalogo } from "../../services/productoService";

// Crear, editar y eliminar categorías (solo Administrador).
export default function CategoriasAdmin({ onCatalogoActualizado }) {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorLectura, setErrorLectura] = useState(false);
  const operacion = useRef(false);
  const carga = useRef(0);
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState(null); // nombre que se está editando
  const [nombreEditado, setNombreEditado] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  async function recargar() {
    const version = ++carga.current;
    setCargando(true);
    try {
      const [grupos, lista] = await Promise.all([obtenerCategoriasAPI(), listarProductosAdmin()]);
      if (version !== carga.current) return;
      setCategorias(grupos);
      setProductos(lista);
      setErrorLectura(false);
      return true;
    } catch (e) {
      if (version === carga.current) {
        setErrorLectura(true);
        setMensaje({ tipo: "danger", texto: errorCatalogo(e) });
      }
      return false;
    } finally { if (version === carga.current) setCargando(false); }
  }
  useEffect(() => {
    // Sincroniza la vista con la API al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recargar();
    return () => { carga.current += 1; };
  }, []);

  async function reintentarLectura() {
    setMensaje({ tipo: "", texto: "" });
    await recargar();
    try { await onCatalogoActualizado?.(); }
    catch {
      setErrorLectura(true);
      setMensaje({ tipo: "warning", texto: "No se pudo refrescar el catálogo público. Reintenta la lectura." });
    }
  }

  async function intentar(accion, texto) {
    if (operacion.current || cargando) return;
    operacion.current = true;
    setGuardando(true);
    setMensaje({ tipo: "", texto: "" });
    try {
      await accion();
      setNueva("");
      setEditando(null);
      setMensaje({ tipo: "success", texto });
      const leido = await recargar();
      if (!leido) setMensaje({ tipo: "warning", texto: "Cambio guardado. No se pudo refrescar el listado; reintenta la lectura." });
      try { await onCatalogoActualizado?.(); }
      catch {
        setErrorLectura(true);
        setMensaje({ tipo: "warning", texto: "Cambio guardado. No se pudo refrescar el catalogo publico." });
      }
    } catch (e) { setMensaje({ tipo: "danger", texto: errorCatalogo(e) }); }
    finally { operacion.current = false; setGuardando(false); }
  }

  function validarNombre(nombre) {
    if (nombre.trim().length < 3 || nombre.trim().length > 100) {
      setMensaje({ tipo: "danger", texto: "El nombre debe tener entre 3 y 100 caracteres." });
      return false;
    }
    return true;
  }
  function crear(evento) {
    evento.preventDefault();
    if (validarNombre(nueva)) intentar(() => crearCategoria({ nombre: nueva.trim() }), "Categoria creada correctamente.");
  }
  function empezarEdicion(categoria) {
    setEditando(categoria.id);
    setNombreEditado(categoria.nombre);
    setMensaje({ tipo: "", texto: "" });
  }
  function guardarEdicion(evento) {
    evento.preventDefault();
    const categoria = categorias.find(c => c.id === editando);
    if (categoria && validarNombre(nombreEditado)) intentar(
      () => actualizarCategoria(editando, { ...categoria, nombre: nombreEditado.trim() }), "Categoria actualizada correctamente.");
  }
  function eliminar(categoria) {
    if (!window.confirm(`Eliminar la categoria "${categoria.nombre}"?`)) return;
    intentar(() => eliminarCategoriaAPI(categoria.id), "Categoria eliminada correctamente.");
  }

  return (
    <section>
      <h1 className="admin-productos-titulo">Categorías</h1>

      {cargando && <p role="status">Cargando categorias...</p>}
      {errorLectura && <Button onClick={reintentarLectura} disabled={cargando || guardando}>Reintentar lectura</Button>}
      <fieldset disabled={cargando || guardando}>
      {/* Mensaje de éxito o error */}
      {mensaje.texto && (
        <Alert
          variant={mensaje.tipo}
          role={mensaje.tipo === "danger" ? "alert" : "status"}
          dismissible
          onClose={() => setMensaje({ tipo: "", texto: "" })}
        >
          {mensaje.texto}
        </Alert>
      )}

      {/* Formulario para crear una categoría */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={crear}>
            <Form.Label htmlFor="categoria-nueva">Nueva categoría</Form.Label>
            <InputGroup>
              <Form.Control
                id="categoria-nueva"
                placeholder="Ej: Galletas"
                maxLength={100}
                value={nueva}
                onChange={(evento) => setNueva(evento.target.value)}
              />
              <Button type="submit" variant="success">
                Agregar
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Listado con cantidad de productos y acciones */}
      <Table responsive hover className="bg-white align-middle shadow-sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th className="text-center">Productos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => {
            const { id, nombre } = categoria;
            const cantidad = productos.filter(p => String(p.categoriaId) === String(id)).length;

            return (
              <tr key={id}>
                <td>
                  {editando === id ? (
                    <Form onSubmit={guardarEdicion} className="d-flex gap-2">
                      <Form.Control
                        size="sm"
                        aria-label={`Nuevo nombre para ${nombre}`}
                        maxLength={100}
                        value={nombreEditado}
                        onChange={(evento) => setNombreEditado(evento.target.value)}
                      />
                      <Button type="submit" size="sm" variant="primary">
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditando(null)}
                      >
                        Cancelar
                      </Button>
                    </Form>
                  ) : (
                    nombre
                  )}
                </td>
                <td className="text-center">
                  <Badge bg={cantidad > 0 ? "primary" : "secondary"}>{cantidad}</Badge>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => empezarEdicion(categoria)}
                      disabled={editando !== null}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => eliminar(categoria)}
                      disabled={cantidad > 0}
                      title={cantidad > 0 ? "Tiene productos asociados" : undefined}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      </fieldset>
    </section>
  );
}
