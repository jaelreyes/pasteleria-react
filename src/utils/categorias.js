// Utilidades de categorías para la tienda (vista Categorías).
// Convierte "Tortas Cuadradas" en "tortas-cuadradas" para usarlo en la URL.
export function crearSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Arma la lista de categorías a partir de los productos.
// Cada categoría usa la imagen de su primer producto.
export function obtenerCategorias(productos) {
  const categorias = []

  productos.forEach(producto => {
    const existente = categorias.find(
      categoria => categoria.nombre === producto.categoria
    )

    if (existente) {
      existente.cantidad += 1
    } else {
      categorias.push({
        nombre: producto.categoria,
        slug: crearSlug(producto.categoria),
        imagen: producto.imagen,
        cantidad: 1,
      })
    }
  })

  return categorias
}