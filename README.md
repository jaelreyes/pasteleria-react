# Pastelería 1000 Sabores — EV3

Tienda React integrada con Spring Boot y una base relacional para Desarrollo Fullstack II. Conserva el diseño, carrito, compras, órdenes y funciones existentes.

## Datos académicos

- Integrantes: Jael Reyes; Aileen Oyaneder; Benjamin Riquelme Pozo.
- Docente: VICTOR HUGO GOMEZ ATABALES.
- Sección: 003D.
- Asignatura: Desarrollo Fullstack II.
- Evaluación: Evaluación Parcial 3 (EV3).

## Requisitos y configuración

Node compatible con Vite 8 (`^20.19.0 || >=22.12.0`), npm y un backend configurado. La conexión MariaDB, sus usuarios y `JWT_SECRET` se configuran únicamente en el backend: consultar su README en https://github.com/krhisteel/pasteleria-backend.

El frontend no utiliza contraseñas demo locales para autenticar. El login llama a `POST /api/v1/auth/login` y el backend verifica BCrypt en MariaDB. Los perfiles locales heredados conservan sus nombres y roles, pero no incorporan contraseñas. No se eliminan datos ya guardados en el navegador.

## Ejecución

Ejemplo PowerShell con los puertos habituales. Cambiar la URL y el puerto si la instalación utiliza otros; no depende del entorno desechable de pruebas.

```powershell
npm ci
$env:VITE_API_URL = 'http://localhost:8080/api/v1'
npm run dev -- --host localhost --port 5173 --strictPort
```

Abrir `http://localhost:5173`. El backend debe permitir exactamente ese origen mediante `APP_CORS_ORIGINS=http://localhost:5173`. Si cambia el host o el puerto, actualizar ambos valores; `localhost` y `127.0.0.1` no son el mismo origen. Definir `VITE_API_URL` antes de iniciar Vite y reiniciarlo si cambia.

Solo se expone la URL pública de la API en `VITE_API_URL`. Nunca introducir contraseñas de base de datos, claves JWT ni contraseñas demo en variables `VITE_*`: Vite las incorpora al código del navegador. No guardar valores privados en este repositorio.

Para compilar producción:

```powershell
$env:VITE_API_URL = 'https://HOST_DEL_BACKEND/api/v1'
npm run build
```

La URL debe corresponder al backend real de esa instalación; la compilación no crea ni inicia servidores. Los archivos locales `.env` están ignorados por Git.

## Datos y seguridad

- Catálogo, categorías, usuarios autenticados, compras y órdenes usan la API.
- Axios agrega JWT y renueva una vez ante un 401 si el refresh sigue siendo válido.
- La sesión y el carrito se conservan en el navegador; localStorage no es la fuente autoritativa del catálogo.
- El carrito verifica identidad y cantidades sin borrar artículos por fallos de lectura.
- El backend calcula el precio de compra y guarda boleta y detalles; el pago es simulado.

| Rol | Acceso |
| --- | --- |
| ADMIN | Funciones administrativas disponibles |
| VENDEDOR | Solo listado y detalle de productos y órdenes; sin modificar, comprar, exportar o imprimir |
| CLIENTE | Tienda, compra e historial propio; sin panel administrativo |

Las cuentas demo las crea el backend con `DEMO_ADMIN_PASSWORD`, `DEMO_VENDEDOR_PASSWORD` y `DEMO_CLIENTE_PASSWORD` cuando faltan. Las claves se configuran privadamente en el proceso del backend, no en React. Las cuentas existentes conservan su contraseña y rol; no es necesario borrar localStorage ni reinicializar la base.

## Swagger y verificaciones

Con el backend del ejemplo: `http://localhost:8080/swagger-ui.html`; OpenAPI: `http://localhost:8080/v3/api-docs`. Ajustar el host/puerto según su instalación.

Las pruebas de login y permisos simulan la API; las pruebas de sesión y perfiles locales utilizan almacenamiento simulado. En la verificación anterior se aprobaron 108 pruebas seleccionadas de catálogo, carrito y permisos; no representa toda la suite heredada. ESLint conserva cinco errores preexistentes de efectos de React. No ejecutar pruebas que no simulen HTTP contra una instalación con datos que deban conservarse.

## Entrega

- [Documentos EV3 y evidencias](docs/README.md).
- Frontend: https://github.com/jaelreyes/pasteleria-react
- Backend: https://github.com/krhisteel/pasteleria-backend
- Rama de trabajo: `integracion/ev3-main-equipo`.

Las pruebas integradas documentadas utilizaron 5175/8082/3309; son evidencias de esa ejecución, no puertos obligatorios. Los documentos y ZIP de entrega están actualizados con esta configuración corregida y verificada; las portadas incluyen los datos académicos oficiales del equipo. No se ha realizado commit ni push.
