import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Button, Table } from "react-bootstrap";
import { listarBoletasAdmin } from "../../services/boletaAdminService";
import { mensajeError } from "../../services/api";
import { formatearPrecio } from "../../utils/precios";

export default function HistorialUsuario() {
  const { correo } = useParams();
  const buscado = String(correo || "").trim().toLowerCase();

  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listarBoletasAdmin()
      .then(setOrdenes)
      .catch((err) =>
        setError(mensajeError(err, "No se pudo cargar el historial."))
      )
      .finally(() => setCargando(false));
  }, []);

  const compras = ordenes.filter(
    (orden) =>
      String(orden.email || orden.correo || "").trim().toLowerCase() === buscado
  );

  const totalGastado = compras
    .filter((orden) => orden.estado !== "cancelado")
    .reduce((suma, orden) => suma + (Number(orden.total) || 0), 0);

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="admin-productos-titulo mb-0">Historial de compras</h1>
        <Button variant="outline-secondary" as={Link} to="/admin/usuarios">
          Volver a usuarios
        </Button>
      </div>

      <p className="text-muted">{correo}</p>

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <p className="text-muted">Cargando historial...</p>
      ) : compras.length === 0 ? (
        <Alert variant="info">Este usuario todavía no tiene compras.</Alert>
      ) : (
        <>
          <Table responsive hover className="bg-white align-middle shadow-sm">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Fecha</th>
                <th className="text-end">Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {compras.map((orden) => (
                <tr key={orden.id}>
                  <td>#{orden.id}</td>
                  <td>
                    {orden.fecha
                      ? new Date(orden.fecha).toLocaleDateString("es-CL")
                      : "-"}
                  </td>
                  <td className="text-end">{formatearPrecio(orden.total)}</td>
                  <td>{orden.estado || "pendiente"}</td>
                  <td>
                    <Link to={`/admin/ordenes/${encodeURIComponent(orden.id)}`}>
                      Ver boleta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <p className="fs-5 text-end">
            <strong>Total comprado: {formatearPrecio(totalGastado)}</strong>
          </p>
        </>
      )}
    </section>
  );
}