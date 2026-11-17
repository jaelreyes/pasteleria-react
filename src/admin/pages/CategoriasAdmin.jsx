import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Form, InputGroup, Table } from "react-bootstrap";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../../services/categoriaService";
import { listarProductosAdmin } from "../../services/productoAdminService";
import { mensajeError } from "../../services/api";

// Crear, editar y eliminar categorías (solo Administrador).
export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nueva, setNueva] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  async function cargarDatos() {
    try {
      setCargando(true);
      const [listaCat, listaProd] = await Promise.all([
        listarCategorias(),
        listarProductosAdmin(),
      ]);
      setCategorias(listaCat);
      setProductos(listaProd);
    } catch (error) {
      setMensaje({
        tipo: "danger",
        texto: mensajeError(error, "No se pudieron cargar las categorías."),
      });
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function contarProductos(nombreCategoria) {
    return productos.filter((p) => p.categoria === nombreCategoria).length;
  }

  async function crear(evento) {
    evento.preventDefault();
    const limpio = nueva.trim();
    if (limpio.length < 3 || limpio.length > 50) {
      setMensaje({ tipo: "danger", texto: "El nombre debe tener entre 3 y 50 caracteres." });
      return;
    }

    try {
      const creada = await crearCategoria(limpio);
      setNueva("");
      setMensaje({ tipo: "success", texto: `Categoría "${creada.nombre}" creada.` });
      await cargarDatos();
    } catch (error) {
      setMensaje({
        tipo: "danger",
        texto: mensajeError(error, "No se pudo crear la categoría."),
      });
    }
  }

  function empezarEdicion(categoria) {
    setEditandoId(categoria.id);
    setNombreEditado(categoria.nombre);
    setMensaje({ tipo: "", texto: "" });
  }

  async function guardarEdicion(evento, categoria) {
    evento.preventDefault();
    const limpio = nombreEditado.trim();
    if (limpio.length < 3 || limpio.length > 50) {
      setMensaje({ tipo: "danger", texto: "El nombre debe tener entre 3 y 50 caracteres." });
      return;
    }

    try {
      const actualizada = await actualizarCategoria(
        categoria.id,
        limpio,
        categoria.descripcion || ""
      );
      setEditandoId(null);
      setMensaje({
        tipo: "success",
        texto: `Categoría actualizada a "${actualizada.nombre}".`,
      });
      await cargarDatos();
    } catch (error) {
      setMensaje({
        tipo: "danger",
        texto: mensajeError(error, "No se pudo actualizar la categoría."),
      });
    }
  }

  async function eliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;

    try {
      await eliminarCategoria(categoria.id);
      setMensaje({ tipo: "success", texto: `Categoría "${categoria.nombre}" eliminada.` });
      await cargarDatos();
    } catch (error) {
      setMensaje({
        tipo: "danger",
        texto: mensajeError(error, "No se pudo eliminar la categoría."),
      });
    }
  }

  return (
    <section>
      <h1 className="admin-productos-titulo">Categorías</h1>

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

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={crear}>
            <Form.Label htmlFor="categoria-nueva">Nueva categoría</Form.Label>
            <InputGroup>
              <Form.Control
                id="categoria-nueva"
                placeholder="Ej: Galletas"
                maxLength={50}
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

      {cargando ? (
        <p className="text-muted">Cargando categorías...</p>
      ) : (
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
              const cantidad = contarProductos(categoria.nombre);

              return (
                <tr key={categoria.id}>
                  <td>
                    {editandoId === categoria.id ? (
                      <Form
                        onSubmit={(e) => guardarEdicion(e, categoria)}
                        className="d-flex gap-2"
                      >
                        <Form.Control
                          size="sm"
                          aria-label={`Nuevo nombre para ${categoria.nombre}`}
                          maxLength={50}
                          value={nombreEditado}
                          onChange={(evento) => setNombreEditado(evento.target.value)}
                        />
                        <Button type="submit" size="sm" variant="primary">
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditandoId(null)}
                        >
                          Cancelar
                        </Button>
                      </Form>
                    ) : (
                      categoria.nombre
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
                        disabled={editandoId !== null}
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
      )}
    </section>
  );
}