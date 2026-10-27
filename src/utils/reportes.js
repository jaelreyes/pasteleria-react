// PESTAÑA 6 · Cálculos de Reportes (funciones puras: mismos datos → mismo resultado).
// Cálculos del panel de Reportes. Son funciones puras: reciben datos
// y devuelven resultados, por eso se prueban sin dibujar nada.

// Mismo criterio que el listado de productos: si no hay límite, se usa 5.
export function limiteCritico(producto) {
  const valor = producto.stockCritico;

  if (valor === "" || valor === null || valor === undefined) return 5;

  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : 5;
}

// Resumen de ventas. Las órdenes canceladas no cuentan como venta.
export function resumenVentas(ordenes) {
  // 1) filter: deja fuera las órdenes canceladas.
  const validas = ordenes.filter((orden) => orden.estado !== "cancelado");

  // 2) reduce: suma el total de cada orden partiendo de 0.
  const totalVendido = validas.reduce(
    (suma, orden) => suma + (Number(orden.total) || 0),
    0
  );

  // 3) Cuenta unidades vendidas por producto: { "Brownie": 5, ... }.
  const unidades = {};

  validas.forEach((orden) => {
    (orden.productos || []).forEach((item) => {
      unidades[item.nombre] =
        (unidades[item.nombre] || 0) + (Number(item.cantidad) || 0);
    });
  });

  // 4) Pasa el objeto a lista, ordena de mayor a menor y deja los 5 primeros.
  const masVendidos = Object.entries(unidades)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return {
    cantidadOrdenes: validas.length,
    canceladas: ordenes.length - validas.length,
    totalVendido,
    // Ticket promedio = total / cantidad de órdenes (0 si no hay, para no dividir por 0).
    ticketPromedio: validas.length
      ? Math.round(totalVendido / validas.length)
      : 0,
    masVendidos,
  };
}

// Stock agrupado por categoría.
export function resumenStock(productos) {
  const filas = {};

  productos.forEach((producto) => {
    const nombre = producto.categoria || "Sin categoría";

    // Si la categoría aún no tiene fila, se crea en 0.
    const fila = filas[nombre] || {
      categoria: nombre,
      productos: 0,
      unidades: 0,
      valorInventario: 0,
      criticos: 0,
      agotados: 0,
    };

    const stock = Number(producto.stock) || 0;

    fila.productos += 1;
    fila.unidades += stock;
    fila.valorInventario += stock * (Number(producto.precio) || 0);

    // Stock 0 = agotado; stock igual o menor al límite = crítico.
    if (stock === 0) fila.agotados += 1;
    else if (stock <= limiteCritico(producto)) fila.criticos += 1;

    filas[nombre] = fila;
  });

  return Object.values(filas);
}