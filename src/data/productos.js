const PRODUCTOS_INICIALES = [
  { codigo: "TC001", categoria: "Tortas Cuadradas", nombre: "Torta Cuadrada de Chocolate", descripcion: "Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.", precio: 45000, stock: 25, stockCritico: 6, imagen: "img/productos/TC001.jpg" },
  { codigo: "TC002", categoria: "Tortas Cuadradas", nombre: "Torta Cuadrada de Frutas", descripcion: "Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones.", precio: 50000, stock: 4, stockCritico: 6, imagen: "img/productos/TC002.jpg" },
  { codigo: "TT001", categoria: "Tortas Circulares", nombre: "Torta Circular de Vainilla", descripcion: "Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce, perfecto para cualquier ocasión.", precio: 40000, stock: 0, stockCritico: 5, imagen: "img/productos/TT001.jpg" },
  { codigo: "TT002", categoria: "Tortas Circulares", nombre: "Torta Circular de Manjar", descripcion: "Torta tradicional chilena con manjar y nueces, un deleite para los amantes de los sabores dulces y clásicos.", precio: 42000, stock: 18, stockCritico: 5, imagen: "img/productos/TT002.jpg" },
  { codigo: "PI001", categoria: "Postres Individuales", nombre: "Mousse de Chocolate", descripcion: "Postre individual cremoso y suave, hecho con chocolate de alta calidad, ideal para los amantes del chocolate.", precio: 5000, stock: 40, stockCritico: 10, imagen: "img/productos/PI001.jpg" },
  { codigo: "PI002", categoria: "Postres Individuales", nombre: "Tiramisú Clásico", descripcion: "Un postre italiano individual con capas de café, mascarpone y cacao, perfecto para finalizar cualquier comida.", precio: 5500, stock: 35, stockCritico: 10, imagen: "img/productos/PI002.jpg" },
  { codigo: "PSA001", categoria: "Productos Sin Azúcar", nombre: "Torta Sin Azúcar de Naranja", descripcion: "Torta ligera y deliciosa, endulzada naturalmente, ideal para quienes buscan opciones más saludables.", precio: 48000, stock: 12, stockCritico: 5, imagen: "img/productos/PSA001.jpg" },
  { codigo: "PSA002", categoria: "Productos Sin Azúcar", nombre: "Cheesecake Sin Azúcar", descripcion: "Suave y cremoso, este cheesecake es una opción perfecta para disfrutar sin culpa.", precio: 47000, stock: 4, stockCritico: 8, imagen: "img/productos/PSA002.jpg" },
  { codigo: "PT001", categoria: "Pastelería Tradicional", nombre: "Empanada de Manzana", descripcion: "Pastelería tradicional rellena de manzanas especiadas, perfecta para un dulce desayuno o merienda.", precio: 3000, stock: 50, stockCritico: 10, imagen: "img/productos/PT001.jpg" },
  { codigo: "PT002", categoria: "Pastelería Tradicional", nombre: "Tarta de Santiago", descripcion: "Tradicional tarta española hecha con almendras, azúcar, y huevos, una delicia para los amantes de los postres clásicos.", precio: 6000, stock: 22, stockCritico: 6, imagen: "img/productos/PT002.jpg" },
  { codigo: "PG001", categoria: "Productos Sin Gluten", nombre: "Brownie Sin Gluten", descripcion: "Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten sin sacrificar el sabor.", precio: 4000, stock: 30, stockCritico: 8, imagen: "img/productos/PG001.jpg" },
  { codigo: "PG002", categoria: "Productos Sin Gluten", nombre: "Pan Sin Gluten", descripcion: "Suave y esponjoso, ideal para sándwiches o para acompañar cualquier comida.", precio: 3500, stock: 15, stockCritico: 6, imagen: "img/productos/PG002.jpg" },
  { codigo: "PV001", categoria: "Productos Vegana", nombre: "Torta Vegana de Chocolate", descripcion: "Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal, perfecta para veganos.", precio: 50000, stock: 10, stockCritico: 5, imagen: "img/productos/PV001.jpg" },
  { codigo: "PV002", categoria: "Productos Vegana", nombre: "Galletas Veganas de Avena", descripcion: "Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable y vegano.", precio: 4500, stock: 28, stockCritico: 8, imagen: "img/productos/PV002.jpg" },
  { codigo: "TE001", categoria: "Tortas Especiales", nombre: "Torta Especial de Cumpleaños", descripcion: "Diseñada especialmente para celebraciones, personalizable con decoraciones y mensajes únicos.", precio: 55000, stock: 6, stockCritico: 6, imagen: "img/productos/TE001.jpg" },
  { codigo: "TE002", categoria: "Tortas Especiales", nombre: "Torta Especial de Boda", descripcion: "Elegante y deliciosa, esta torta está diseñada para ser el centro de atención en cualquier boda.", precio: 60000, stock: 9, stockCritico: 5, imagen: "img/productos/TE002.jpg" }
];

const productos = PRODUCTOS_INICIALES.map((producto, indice) => ({
  ...producto,
  id: indice + 1,
  imagen: `/images/productos/${producto.codigo}.jpg`,
}))

export default productos