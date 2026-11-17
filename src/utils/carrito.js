// Un código único identifica el producto aunque sus IDs hayan cambiado.
// Los ítems no verificables se conservan y bloquean la compra.
export function sincronizarCarrito(items, catalogo) {
  let pendiente = false;
  const verificados = items.map(item => {
    const codigo = String(item?.codigo || "").trim().toUpperCase();
    const candidatos = codigo ? catalogo.filter(p => String(p.codigo || "").trim().toUpperCase() === codigo) : [];
    if (candidatos.length !== 1 || !Number.isSafeInteger(item?.cantidad) || item.cantidad < 1) {
      pendiente = true;
      return item;
    }
    const producto = candidatos[0];
    if (item.cantidad > producto.stock) pendiente = true;
    return { ...producto, cantidad: item.cantidad };
  });
  const ids = verificados.map(p => String(p?.id));
  if (new Set(ids).size !== ids.length) pendiente = true;
  return {
    items: verificados,
    pendiente,
    aviso: pendiente ? "Conservamos tu carrito. Hay productos cuya identidad o disponibilidad debe revisarse; puedes retirarlos o ajustar sus cantidades." : "",
  };
}
