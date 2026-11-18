# Pastelería 1000 Sabores

Proyecto de Desarrollo Fullstack II de DUOC. Es una tienda de pastelería donde se pueden revisar productos, agregarlos al carrito y realizar compras con pago simulado.

El frontend se conecta con nuestra API Spring Boot para obtener el catálogo, iniciar sesión y gestionar las compras.

## Tecnologías

- React y Vite.
- React Router.
- Bootstrap y React Bootstrap.
- Axios para las peticiones a la API.

## Funcionalidades

- Catálogo con búsqueda, filtros y descuentos.
- Carrito, checkout e historial de compras.
- Inicio de sesión con JWT y renovación del token.
- Sesión y carrito guardados al recargar la página.
- Administración de productos, categorías y órdenes.

El acceso depende del rol:

| Rol | Acceso |
| --- | --- |
| ADMIN | Todas las funciones administrativas disponibles. |
| VENDEDOR | Consulta de productos y órdenes, sin modificar, exportar ni imprimir boletas. |
| CLIENTE | Tienda, compras e historial propio, sin acceso al panel administrativo. |

## Cómo ejecutar

Necesitas Node.js 20.19 o superior dentro de la versión 20, o Node.js 22.12 o superior, y npm.

Primero configura e inicia el [backend](https://github.com/krhisteel/pasteleria-backend).

Luego, desde la carpeta del frontend, ejecuta en PowerShell:

```powershell
npm ci
$env:VITE_API_URL = 'http://localhost:8080/api/v1'
npm run dev -- --host localhost --port 5173 --strictPort
```

Abre http://localhost:5173.

`VITE_API_URL` debe apuntar a la API que estás utilizando. El backend debe permitir el origen del frontend mediante `APP_CORS_ORIGINS`.

Si cambias el host o el puerto, ajusta ambas configuraciones. Para CORS, `localhost` y `127.0.0.1` son orígenes distintos.

Las variables `VITE_*` son visibles en el navegador. No deben contener contraseñas, claves JWT ni credenciales de la base de datos. Las cuentas de demostración se configuran en el backend.

## Compilar para producción

Define `VITE_API_URL` con la dirección del backend de destino y ejecuta:

```powershell
npm run build
```

La compilación queda en la carpeta `dist`.

## Equipo

- Jael Reyes.
- Aileen Oyaneder.
- Benjamin Riquelme Pozo.

Desarrollo Fullstack II · Sección 003D  
Docente: VICTOR HUGO GOMEZ ATABALES  
Evaluación Parcial 3 (EV3)

## Enlaces

- [Backend](https://github.com/krhisteel/pasteleria-backend).
- [Documentación y evidencias EV3](docs/README.md).
