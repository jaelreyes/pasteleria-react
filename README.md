# Pastelería 1000 Sabores

Proyecto académico de Desarrollo Fullstack II, basado en el caso
Pastelería 1000 Sabores.

Este avance migra parte del proyecto original, desarrollado en HTML,
CSS y JavaScript, a React.

## Tecnologías

- React y Vite.
- React Bootstrap y Bootstrap.
- React Router.
- localStorage para conservar el carrito.

## Funcionalidades implementadas

- Página de inicio.
- Catálogo con los 16 productos del proyecto original.
- Búsqueda por nombre y filtro por categoría.
- Filtros guardados en la URL.
- Detalle de producto mediante una ruta con parámetro.
- Botones de compra deshabilitados para productos agotados.
- Carrito con productos agrupados por cantidad.
- Eliminación de productos y vaciado del carrito.
- Cálculo de subtotales y total.
- Persistencia del carrito al recargar.
- Página 404 y mensaje para productos inexistentes.
- Menú colapsable y catálogo adaptable a pantallas pequeñas.
- Layout compartido mediante Outlet.
- Menú con NavLink que identifica la página activa.
- Navegación al carrito desde el detalle mediante useNavigate.
- Página 404 que muestra la ruta visitada mediante useLocation.
- Resumen de compra en /checkout, con redirección si el carrito está vacío.
- Panel lateral del carrito con Offcanvas.
- Catálogo responsivo con Row y Col de React Bootstrap.
- Título de la pestaña actualizado mediante useEffect.
- Página Nosotros con historia, misión, visión y valores del proyecto original.
- Página Contacto con formulario controlado, validaciones y envío simulado.
- Secciones requeridas: Inicio, Nosotros, Contacto y Carrito.


## Organización

- `src/components`: componentes reutilizables y layout.
- `src/pages`: inicio, detalle de producto y página 404.
- `src/data`: datos del catálogo.
- `public/images/productos`: imágenes de los productos.

## Instalación y ejecución

Después de clonar o descargar el repositorio, abrir una terminal
dentro de la carpeta del proyecto y ejecutar:

```bash
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

- Compilación de producción completada sin errores.
- Navegación, filtros y detalle probados en la vista previa.
- Persistencia y total del carrito comprobados.
- Menú y catálogo comprobados en pantalla pequeña.

## Pendientes de la migración

- Registro e inicio de sesión.
- Perfiles y beneficios de usuarios.
- Administración de productos y usuarios.
- Control de cantidades del carrito según el stock disponible.

El proyecto continúa en desarrollo. Este avance corresponde a
la base de componentes, estado, efectos y navegación.