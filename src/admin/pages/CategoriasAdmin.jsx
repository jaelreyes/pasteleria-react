import { useState } from "react";
import { Alert, Badge, Button, Card, Form, InputGroup, Table } from "react-bootstrap";
import {
  obtenerCategorias,
  contarProductosPorCategoria,
  guardarCategoria,
  eliminarCategoria,
} from "../../data/db";

// Crear, editar y eliminar categorías (solo Administrador).
export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState(() => obtenerCategorias());
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState(null); // nombre que se está editando
  const [nombreEditado, setNombreEditado] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // Relee las categorías y muestra un mensaje de éxito.
  function recargar(texto) {
    setCategorias(obtenerCategorias());
    setMensaje({ tipo: "success", texto });
  }

  // Ejecuta una acción de db.js y muestra su error si falla.
  function intentar(accion) {
    try {
      accion();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }

  // Agrega una categoría con el nombre escrito.
  function crear(evento) {
    evento.preventDefault();
    intentar(() => {
      const nombre = guardarCategoria(nueva);
      setNueva("");
      recargar(`Categoría "${nombre}" creada.`);
    });
  }

  // Pasa la fila a modo edición.
  function empezarEdicion(nombre) {
    setEditando(nombre);
    setNombreEditado(nombre);
    setMensaje({ tipo: "", texto: "" });
  }

  // Guarda el nuevo nombre (también actualiza sus productos).
  function guardarEdicion(evento) {
    evento.preventDefault();
    intentar(() => {
      const nombre = guardarCategoria(nombreEditado, editando);
      setEditando(null);
      recargar(`Categoría actualizada a "${nombre}".`);
    });
  }

  // Pide confirmación y elimina la categoría si no tiene productos.
  function eliminar(nombre) {
    if (!window.confirm(`¿Eliminar la categoría "${nombre}"?`)) return;

    intentar(() => {
      eliminarCategoria(nombre);
      recargar(`Categoría "${nombre}" eliminada.`);
    });
  }

  return (
    <section>
      <h1 className="admin-productos-titulo">Categorías</h1>

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
          {categorias.map((nombre) => {
            const cantidad = contarProductosPorCategoria(nombre);

            return (
              <tr key={nombre}>
                <td>
                  {editando === nombre ? (
                    <Form onSubmit={guardarEdicion} className="d-flex gap-2">
                      <Form.Control
                        size="sm"
                        aria-label={`Nuevo nombre para ${nombre}`}
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
                      onClick={() => empezarEdicion(nombre)}
                      disabled={editando !== null}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => eliminar(nombre)}
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
    </section>
  );
}