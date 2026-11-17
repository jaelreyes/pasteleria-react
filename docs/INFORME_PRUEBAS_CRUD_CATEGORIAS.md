# Informe de pruebas de integración del CRUD de categorías

**Proyecto:** Pastelería 1000 Sabores  
**Asignatura:** Desarrollo Fullstack II

## 1. Objetivo

Validar de extremo a extremo el CRUD básico de categorías entre React, la API Spring Boot y MariaDB. Comprobar la creación, edición y eliminación física de una categoría temporal sin asociaciones, su persistencia y la conservación de los datos existentes.

El alcance ejecutado corresponde al ciclo exitoso con datos válidos. Las validaciones revisadas únicamente en el código se identifican por separado y no se presentan como pruebas manuales realizadas.

## 2. Entorno de pruebas

| Componente | Configuración verificada |
|---|---|
| Frontend React | `http://localhost:5174` |
| API Spring Boot | `http://localhost:8081/api/v1` |
| Java | Temurin JDK 17.0.21 |
| MariaDB aislada | Versión 10.4.32, conexión `127.0.0.1:3307` |
| Base de pruebas | `pasteleria_crud_test` |
| Datos al comenzar el ciclo de categorías | 8 categorías, 17 registros físicos de productos y 3 usuarios |

Los 17 productos incluían el producto temporal del ciclo anterior, conservado con `activo=false`. No se modificó ningún producto durante estas pruebas de categorías.

Se verificó que React utilizaba la API del puerto 8081, que CORS permitía el origen `http://localhost:5174` y que el proceso del backend mantenía conexiones de base de datos exclusivamente al puerto 3307.

## 3. Medidas de seguridad

- Se utilizó una copia independiente de `pasteleria_db`, en un contenedor y un volumen exclusivos, con conexión publicada únicamente en `127.0.0.1:3307`.
- El usuario de aplicación tenía permisos SELECT, INSERT, UPDATE y DELETE exclusivamente sobre `pasteleria_crud_test`. Se verificó la denegación de acceso a la base original.
- Las aplicaciones utilizaron configuración temporal, sin modificar archivos versionados. Spring Boot se ejecutó con `ddl-auto=validate`, inicialización SQL y migraciones deshabilitadas.
- Antes de cada escritura se verificaron el aislamiento, la identidad de la categoría y la ausencia de productos asociados, incluidos los inactivos. Antes de crear y editar también se comprobó la disponibilidad del nombre, ignorando mayúsculas y espacios extremos.
- Se registraron instantáneas privadas de las categorías originales, los productos y los usuarios. Las comparaciones posteriores abarcaron todos los campos.
- Las escrituras se realizaron desde React, con sesión ADMIN en un perfil aislado. Se limitaron a la categoría temporal ID 9, con un único envío por operación y confirmación antes de eliminar.
- No se modificó, restauró ni limpió `pasteleria_db`. No se detuvieron ni eliminaron contenedores, bases o volúmenes.

Este informe no contiene contraseñas, tokens JWT, claves ni credenciales.

## 4. Pruebas realizadas

Los endpoints de la tabla corresponden exclusivamente a `http://localhost:8081`.

| Operación | Endpoint | Código HTTP esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| Consultar categorías iniciales | `GET /api/v1/categorias` | `200 OK` | Se recibieron las 8 categorías originales. | Aprobada |
| Crear categoría temporal | `POST /api/v1/categorias` | `201 Created` | Se creó `QA - Categoria temporal`; MariaDB asignó el ID 9. El total aumentó a 9 categorías. | Aprobada |
| Editar categoría temporal | `PUT /api/v1/categorias/9` | `200 OK` | El nombre cambió a `QA - Categoria temporal editada`. Se conservaron el ID 9, la descripción vacía y cero asociaciones. | Aprobada |
| Eliminar categoría temporal | `DELETE /api/v1/categorias/9` | `204 No Content` | Se eliminó físicamente la categoría sin productos asociados. El total volvió a 8 categorías. | Aprobada |

Se verificó un único POST de categoría, un único PUT y un único DELETE. Las operaciones no se sustituyeron por llamadas directas de escritura a la API.

### Datos de prueba

| Campo | Valor comprobado |
|---|---|
| ID asignado | 9 |
| Nombre inicial | `QA - Categoria temporal` |
| Nombre editado | `QA - Categoria temporal editada` |
| Descripción | Cadena vacía, conservada al editar |
| Productos asociados | 0, contando activos e inactivos |

La categoría apareció en el listado administrativo después de crearla y después de editarla. No se asociaron productos a ella.

## 5. Validación de eliminación física

Después de pulsar Eliminar en la fila temporal y aceptar la confirmación, se comprobó que:

- Spring Boot respondió `204 No Content` al único DELETE dirigido al ID 9.
- La consulta directa a MariaDB confirmó que el registro ID 9 ya no existía físicamente.
- La categoría desapareció del listado administrativo de React.
- `GET /api/v1/categorias` devolvió `200 OK`, con 8 categorías y sin el ID 9.
- `GET /api/v1/categorias/9` devolvió `404 Not Found`.

La eliminación de categorías sin asociaciones es física. Esto difiere de la desactivación lógica de productos documentada en el informe de productos. No se ejecutaron scripts adicionales de limpieza.

## 6. Integridad de datos

| Comprobación final | Resultado |
|---|---|
| Total de categorías en la copia | 8 |
| Categoría temporal ID 9 | Inexistente |
| Ocho categorías originales | Idénticas campo por campo a la instantánea inicial |
| Registros físicos de productos | 17, todos idénticos a la instantánea previa al ciclo de categorías |
| Usuarios de la copia | Sin modificaciones |
| Base original `pasteleria_db` | Productos, categorías y usuarios idénticos a la instantánea de referencia |

Las comprobaciones posteriores a cada escritura utilizaron únicamente consultas de lectura. El producto temporal ID 17 del ciclo anterior permaneció inactivo y no fue eliminado ni modificado.

## 7. Resultados ejecutados y alcance comprobado

Se ejecutaron realmente desde la interfaz React la creación con datos válidos, la edición exclusiva del nombre y la eliminación de una categoría vacía, utilizando sesión ADMIN. Se inspeccionaron los métodos, destinos y códigos HTTP, y se verificó la persistencia mediante lecturas directas a MariaDB.

También se comprobó la actualización del listado administrativo, la aceptación y conservación de una descripción vacía, la ausencia de asociaciones y la integridad de los registros ajenos a la prueba.

La disponibilidad de los nombres se verificó antes de escribir. Esa comprobación no equivale a haber enviado un nombre duplicado y obtenido un error HTTP real. Tampoco se intentó eliminar una categoría con productos asociados durante este ciclo.

## 8. Validaciones inspeccionadas en el código

| Regla revisada | Comportamiento identificado en el código | Alcance de la comprobación |
|---|---|---|
| Nombre obligatorio | React rechaza nombres vacíos o compuestos únicamente por espacios; Spring valida que el nombre no esté en blanco. | Inspección de código; no se ejecutó una solicitud inválida en este ciclo. |
| Longitud del nombre | React y el servicio Spring exigen entre 3 y 100 caracteres después de quitar espacios extremos. | Inspección de código; no se probaron manualmente todos los límites. |
| Nombre duplicado | Spring comprueba nombres sin distinguir mayúsculas y utiliza `ConflictoException`, traducida a `409 Conflict`. | Inspección de código; no se provocó un conflicto real de duplicados. |
| Descripción opcional | La entidad admite una descripción opcional de hasta 500 caracteres. El formulario crea con cadena vacía y conserva la descripción al editar. | Código inspeccionado y descripción vacía comprobada realmente; el límite de 500 no se probó manualmente. |
| Eliminación con asociaciones | `existsByCategoriaId()` comprueba cualquier producto asociado, activo o inactivo. Si existe alguno, el servicio rechaza la eliminación con `409 Conflict`. React deshabilita el botón cuando su conteo es mayor que cero. | Regla inspeccionada; el DELETE real contra una categoría asociada no se ejecutó. |
| Permisos de escritura | Spring Security reserva POST, PUT y DELETE de categorías a ADMIN. | Configuración inspeccionada; el ciclo exitoso se ejecutó como ADMIN. No se probaron manualmente todos los roles. |

Las pruebas automatizadas con mocks disponibles en el proyecto aportan comprobaciones complementarias, pero no sustituyen la validación HTTP real de estas reglas sobre el entorno aislado.

## 9. Conclusión

El CRUD básico de categorías quedó validado de extremo a extremo entre React, Spring Boot y MariaDB en el entorno aislado. Se creó la categoría temporal ID 9, se actualizó exclusivamente su nombre y se eliminó físicamente al confirmar que no tenía productos asociados.

El estado final conserva las 8 categorías originales, los 17 productos y los usuarios sin modificaciones. La base original `pasteleria_db` permaneció intacta. Las reglas inspeccionadas en el código se mantienen diferenciadas de los resultados ejecutados realmente.

## 10. Próximos pasos y pruebas pendientes

- Comprobar mediante una solicitud HTTP real el `409 Conflict` al intentar eliminar una categoría con productos asociados, cubriendo asociaciones activas e inactivas. Esta prueba requerirá una autorización específica y datos temporales exclusivamente en el entorno aislado.
- Ejecutar casos negativos de nombres vacíos, espacios, longitudes fuera de rango y nombres duplicados, verificando los códigos HTTP y la conservación de datos.
- Completar la validación manual de permisos con sesiones sin autorización de escritura.

Estas comprobaciones quedan pendientes y no forman parte del ciclo básico aprobado en este informe.
