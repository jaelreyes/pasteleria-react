const codigoProducto = producto => String(producto?.codigo || "").trim().toUpperCase();

// Vista verificada: jamás elimina artículos, reduce cantidades ni persiste cambios automáticamente.
export function sincronizarCarrito(items, catalogo) {
  let pendiente = false;
  const verificados = items.map(item => {
    const codigo = codigoProducto(item);
    const candidatos = codigo ? catalogo.filter(p => codigoProducto(p) === codigo) : [];
    if (candidatos.length !== 1) {
      pendiente = true;
      return item;
    }
    const producto = candidatos[0];
    if (!Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 99 ||
        item.cantidad > producto.stock || producto.activo === false) pendiente = true;
    return { ...producto, cantidad: item.cantidad };
  });
  if (new Set(verificados.map(p => String(p.id))).size !== verificados.length) pendiente = true;
  return {
    items: verificados,
    pendiente,
    aviso: pendiente
      ? "Conservamos tu carrito. Revisa los productos no disponibles, su identidad o sus cantidades antes de comprar."
      : "",
  };
}
