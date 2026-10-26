# Pastelería 1000 Sabores

Proyecto académico de Desarrollo Fullstack II, basado en el caso Pastelería
1000 Sabores. Migra el sitio original desarrollado en HTML, CSS y JavaScript
a una aplicación React con tienda y panel de administración.

## Tecnologías

- React y Vite.
- React Bootstrap y Bootstrap.
- React Router.
- localStorage para conservar catálogo, usuarios, sesión, carrito y órdenes.
- Jasmine, Karma y Testing Library para las pruebas automatizadas.
- Istanbul para los reportes de cobertura.

## Instalación y ejecución

Requiere Node.js, npm y Google Chrome para ejecutar las pruebas.
Utiliza una versión de Node.js compatible con Vite 8.

```bash
git clone https://github.com/jaelreyes/pasteleria-react.git
cd pasteleria-react
npm install
npm run dev
```

Abre la dirección indicada por Vite en la terminal.

## Funcionalidades

### Navegación y contenido

- Layout compartido con encabezado y pie de página.
- Menú adaptable a pantallas pequeñas y enlaces que identifican la página activa.
- Acceso visible a Mis pedidos y menú de cuenta.
- Inicio con categorías, productos destacados, historia y video.
- Nosotros con historia, misión, visión, valores y equipo de la pastelería.
- Blog con listado y detalle de artículos.
- Contacto con validación de campos y envío simulado.
- Newsletter con validación de correo y confirmación simulada.
- Página para rutas inexistentes y título de pestaña con cantidad del carrito.

### Catálogo

- Los 16 productos del proyecto original, con sus imágenes.
- Búsqueda por nombre y filtro por categoría, conservados en la URL.
- Páginas de categorías y ofertas.
- Detalle de producto con precio, descripción, stock y cantidad de compra.
- Restricción de compra según disponibilidad de stock.
- Precios con oferta y beneficio de usuario: se aplica el mayor descuento.

### Registro y sesión

- Registro con validación de RUN, correo, contraseña, fecha de nacimiento,
  región y comuna.
- Inicio y cierre de sesión.
- Roles de Administrador, Vendedor y Cliente.
- Beneficios registrados según las condiciones del proyecto:
  - 50% de descuento para mayores de 50 años.
  - 10% de descuento con el código FELICES50.
  - Indicador de beneficio de torta gratis de cumpleaños para correos Duoc UC.

### Carrito, compra y pedidos

- Carrito con productos agrupados, control de cantidades y persistencia al recargar.
- Eliminación de productos, vaciado y panel lateral con Offcanvas.
- Resumen con subtotal, ahorro y total.
- Checkout con datos de despacho, región y comuna, departamento, indicaciones
  de entrega y medios de pago simulados. Si hay sesión, se completan los datos.
- Opción para simular un pago rechazado: muestra la vista de error con el
  resumen de la compra, no guarda la orden y conserva el carrito.
- Comprobación del catálogo, cantidades, precios y stock antes de confirmar.
- Descuento del inventario al registrar la compra y conservación del carrito
  cuando no se puede completar.
- Órdenes nuevas en estado pendiente.
- Confirmación de compra con identificador y detalle de la orden.
- Copia del número de orden y descarga de un comprobante de texto.
- Mis pedidos muestra las compras asociadas al correo de la sesión.
- Consulta como invitado mediante ID de orden y correo de compra.
- Seguimiento: pendiente, en preparación, enviado, entregado o cancelado.
- Actualización del estado consultado mediante el botón Actualizar pedidos.
- Restitución de stock al cancelar órdenes marcadas con inventario descontado,
  evitando devolverlo dos veces.

### Administración

- Panel de inicio con resumen de catálogo, inventario y usuarios según el rol.
- Listado, creación, edición, detalle y eliminación de productos.
- Búsqueda, filtros y ordenamiento del catálogo administrativo.
- Alertas de productos agotados y con stock crítico.
- Stock crítico cuando el stock es menor o igual al límite configurado.
- Listado, creación, consulta, edición y eliminación de usuarios, con restricciones
  para las cuentas demo.
- Gestión de estados de las órdenes y boleta de cada orden (`/admin/ordenes/:id`).
- Categorías: crear, renombrar y eliminar (solo si no tienen productos).
- Reportes: total vendido, ticket promedio, productos más vendidos y stock por categoría.
- Historial de compras de cada usuario.
- Perfil con información de la cuenta y permisos según el rol.
- Navegación administrativa adaptable a pantallas pequeñas.

## Permisos por rol

| Función del panel | Administrador | Vendedor | Cliente o invitado |
| --- | --- | --- | --- |
| Consultar productos | Sí | Sí | Sin acceso al panel |
| Crear, editar y eliminar productos | Sí | No | No |
| Consultar órdenes, boletas y cambiar estados | Sí | Sí | No |
| Administrar categorías y ver reportes | Sí | No | No |
| Administrar usuarios e historial de compras | Sí | No | No |
| Consultar el perfil del panel | Sí | Sí | No |

Los clientes e invitados acceden a la tienda pública y consultan sus compras
desde Mis pedidos.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@duoc.cl | venta123 |
| Cliente | cliente@gmail.com | cliente1 |

Las cuentas demo se crean cuando la clave `usuarios` no existe en localStorage.
Si ya hay usuarios guardados, se conserva ese contenido.

## Pruebas y cobertura

```bash
npm test
```

Ejecuta las pruebas de Jasmine en ChromeHeadless. Para trabajar con ejecución
continua en Chrome:

```bash
npm run test:watch
```

El reporte HTML de cobertura se genera en `coverage/html/index.html`.

Última ejecución compartida:

- **156 pruebas aprobadas, sin fallos.**
- Sentencias: **81,39%**.
- Ramas: **72,59%**.
- Funciones: **83,89%**.
- Líneas: **82,51%**.

La configuración instrumenta los archivos cargados por las pruebas desde
`src/admin`, `src/components`, `src/pages`, `src/utils` y `src/data`.
`src/App.jsx` y `src/main.jsx` no se cargan en las pruebas unitarias.

## Compilación de producción

```bash
npm run build
npm run preview
```

La compilación genera la carpeta `dist`. La última compilación compartida terminó
correctamente. También se puede ejecutar la revisión estática por separado:

```bash
npm run lint
```

## Organización

```text
src/
  admin/        Panel: páginas, componentes y rutas administrativas
  components/   Componentes compartidos de la tienda
  pages/        Páginas públicas de la tienda
  data/         Persistencia (db.js), catálogo, artículos y regiones/comunas
  utils/        Validaciones, roles, precios, dirección y reportes
  styles/       Estilos de la aplicación
  tests/        Pruebas automatizadas
public/
  images/       Logos e imágenes de productos
```

## Alcance del proyecto

Esta es una demostración académica ejecutada en el navegador. Los pagos,
el envío del formulario de contacto y la suscripción al newsletter son simulados.
No existe conexión con un backend ni con una pasarela de pago real.

Los datos permanecen en el almacenamiento del navegador utilizado; no se
comparten entre dispositivos. Los controles de acceso del frontend y las cuentas
demo forman parte de la demostración, no de un sistema de autenticación de producción.