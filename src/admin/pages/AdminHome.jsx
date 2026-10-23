import { useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerProductos,
  obtenerUsuarios,
} from "../../data/db";

function limiteCritico(producto) {
  const valor = producto.stockCritico;

  if (valor === "" || valor === null || valor === undefined) {
    return 5;
  }

  const numero = Number(valor);

  return Number.isInteger(numero) && numero >= 0 ? numero : 5;
}

export default function AdminHome({ esAdministrador = false }) {
  const [productos, setProductos] = useState(() => obtenerProductos());

  const [usuarios, setUsuarios] = useState(() =>
    esAdministrador ? obtenerUsuarios() : []
  );

  function actualizarResumen() {
    setProductos(obtenerProductos());

    if (esAdministrador) {
      setUsuarios(obtenerUsuarios());
    }
  }

  const stockTotal = productos.reduce(
    (suma, producto) => suma + (Number(producto.stock) || 0),
    0
  );

  const cantidadCriticos = productos.filter(
    (producto) => Number(producto.stock) < limiteCritico(producto)
  ).length;

  const indicadores = [
    {
      titulo: "Productos",
      valor: productos.length,
      descripcion: "Total en el catálogo",
    },
    {
      titulo: "Unidades en stock",
      valor: stockTotal,
      descripcion: "Suma de todo el inventario",
    },
    {
      titulo: "Stock crítico",
      valor: cantidadCriticos,
      descripcion: "Productos bajo su stock crítico",
      critico: true,
    },
    ...(esAdministrador
      ? [
          {
            titulo: "Usuarios",
            valor: usuarios.length,
            descripcion: "Registrados en el sistema",
          },
        ]
      : []),
  ];

  return (
    <section className="admin-inicio">
      <h1>Bienvenido al Panel</h1>

      <p className="admin-inicio-descripcion">
        {esAdministrador
          ? "Gestiona los productos y usuarios de Pastelería 1000 Sabores."
          : "Consulta el catálogo y gestiona las órdenes de Pastelería 1000 Sabores."}
      </p>

      <div className="admin-indicadores">
        {indicadores.map((indicador) => (
          <article className="admin-indicador" key={indicador.titulo}>
            <h2>{indicador.titulo}</h2>

            <p
              className={`admin-indicador-valor${
                indicador.critico ? " critico" : ""
              }`}
            >
              {indicador.valor}
            </p>

            <p className="admin-indicador-descripcion">
              {indicador.descripcion}
            </p>
          </article>
        ))}
      </div>

      <h2 className="admin-accesos-titulo">Accesos rápidos</h2>

      <div className="admin-accesos">
        <Link to="/admin/productos">Ver productos</Link>

        {esAdministrador && (
          <Link to="/admin/productos/nuevo">Nuevo producto</Link>
        )}

        <Link to="/admin/ordenes">Ver órdenes</Link>

        {esAdministrador && (
          <>
            <Link to="/admin/usuarios">Ver usuarios</Link>
            <Link to="/admin/usuarios/nuevo">Nuevo usuario</Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="admin-actualizar"
        onClick={actualizarResumen}
      >
        Actualizar resumen
      </button>
    </section>
  );
}