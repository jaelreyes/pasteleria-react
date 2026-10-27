// Utilidades de categorías para la tienda (vista Categorías).
// Convierte "Tortas Cuadradas" en "tortas-cuadradas" para usarlo en la URL.
export function crearSlug(texto) {
  return texto
    // 1) todo en minúsculas
    .toLowerCase()
    // 2) separa las tildes de las letras (á → a + ´)
    .normalize('NFD')
    // 3) borra las tildes
    .replace(/[\u0300-\u036f]/g, '')
    // 4) espacios y símbolos pasan a ser guiones
    .replace(/[^a-z0-9]+/g, '-')
    // 5) quita guiones al inicio o al final
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