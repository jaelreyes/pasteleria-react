# Pastelería 1000 Sabores

Proyecto académico de Desarrollo Fullstack II, basado en el caso
Pastelería 1000 Sabores.

Este avance migra el proyecto original, desarrollado en HTML,
CSS y JavaScript, a React.

## Tecnologías

- React y Vite.
- React Bootstrap y Bootstrap.
- React Router.
- localStorage para conservar el carrito, la sesión y el pedido.

## Funcionalidades implementadas

### Navegación y estructura

- Página de inicio.
- Layout compartido mediante Outlet.
- Menú con NavLink que identifica la página activa.
- Menú colapsable adaptable a pantallas pequeñas.
- Página 404 que muestra la ruta visitada mediante useLocation.
- Título de la pestaña actualizado mediante useEffect.
- Página Nosotros con historia, misión, visión y valores del proyecto original.
- Página Contacto con formulario controlado, validaciones y envío simulado.

### Catálogo

- Catálogo con los 16 productos del proyecto original.
- Búsqueda por nombre y filtro por categoría.
- Filtros guardados en la URL.
- Detalle de producto mediante una ruta con parámetro.
- Botones de compra deshabilitados para productos agotados.
- Catálogo responsivo con Row y Col de React Bootstrap.

### Blog

- Listado de artículos en `/blogs`.
- Detalle de cada artículo en `/blogs/:id`, leyendo el parámetro con useParams.
- Mensaje para artículos inexistentes.
- Datos de los artículos separados en `src/data/blogs.js`.

### Usuarios

- Registro con validación de RUN, correo, fecha de nacimiento, región y comuna.
- Inicio de sesión y cierre de sesión.
- Beneficios detectados al registrarse:
  - 50% de descuento para mayores de 50 años.
  - 10% de descuento con el código FELICES50.
  - Torta gratis de cumpleaños para correos Duoc UC.

### Carrito y compra

- Carrito con productos agrupados por cantidad.
- Control de cantidades según el stock disponible.
- Eliminación de productos y vaciado del carrito.
- Persistencia del carrito al recargar.
- Panel lateral del carrito con Offcanvas.
- Descuento del usuario aplicado en el carrito y en el resumen de compra:
  precio original, precio con descuento, ahorro y total.
- Si el usuario tiene más de un descuento, se aplica el mayor.
- Resumen de compra en `/checkout`, con redirección si el carrito está vacío.
- Confirmación de la compra, que guarda el pedido y vacía el carrito.
- Página Mis pedidos en `/pedido` con número de pedido, fecha de entrega
  estimada, etapas del envío, barra de avance, productos y total pagado.

## Organización

- `src/components`: componentes reutilizables y layout.
- `src/pages`: páginas del sitio (inicio, catálogo, blog, carrito, pedido, etc.).
- `src/data`: datos del catálogo, de los blogs y de regiones y comunas.
- `src/utils`: validaciones, cálculo de descuentos y manejo de pedidos.
- `src/styles`: estilos de cada sección.
- `public/images/productos`: imágenes de los productos.

## Instalación y ejecución

Clonar el repositorio, abrir una terminal dentro de la carpeta del
proyecto y ejecutar:

```bash
git clone https://github.com/jaelreyes/pasteleria-react.git
cd pasteleria-react
npm install
npm run dev
```

Abrir la dirección indicada por Vite.

## Versión de producción

```bash
npm run build
npm run preview
```

## Validaciones realizadas

- Compilación de producción y lint completados sin errores.
- Navegación, filtros y detalle probados en la vista previa.
- Persistencia y total del carrito comprobados.
- Descuentos comprobados sin sesión, con 50% por edad y con 10% por FELICES50.
- Compra completa comprobada: confirmación, pedido guardado y carrito vacío.
- Menú, catálogo y página de pedidos comprobados en pantalla pequeña.

## Pendientes de la migración

- Administración de productos y usuarios (panel de administración).
- Cuentas de prueba para los roles Administrador y Vendedor.