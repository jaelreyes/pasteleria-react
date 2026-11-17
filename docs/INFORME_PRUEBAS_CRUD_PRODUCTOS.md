# Informe de pruebas de integración del CRUD de productos

**Proyecto:** Pastelería 1000 Sabores  
**Asignatura:** Desarrollo Fullstack II

## 1. Objetivo

Validar de extremo a extremo la integración entre React, la API Spring Boot y MariaDB mediante la consulta, creación, edición y desactivación lógica de un producto temporal. Comprobar la persistencia de los cambios y la conservación de los datos originales.

## 2. Entorno de pruebas

| Componente | Configuración verificada |
|---|---|
| Frontend React | `http://localhost:5174` |
| API Spring Boot | `http://localhost:8081/api/v1` |
| Java | Temurin JDK 17.0.21 |
| MariaDB aislada | Versión 10.4.32, conexión `127.0.0.1:3307` |
| Base de pruebas | `pasteleria_crud_test` |
| Datos iniciales copiados | 16 productos, 8 categorías y 3 usuarios |

Se verificó en un navegador con perfil aislado que React enviaba las solicitudes a la API del puerto 8081 y que CORS permitía el origen `http://localhost:5174`.

## 3. Medidas de seguridad

- Se utilizó una copia independiente de la base original `pasteleria_db`, alojada en un contenedor y un volumen nuevos y exclusivos. La conexión del contenedor se publicó únicamente en `127.0.0.1:3307`.
- El usuario de aplicación recibió permisos SELECT, INSERT, UPDATE y DELETE exclusivamente sobre `pasteleria_crud_test`. Se comprobó la denegación de acceso a `pasteleria_db` y de conexión al servidor original con esas credenciales.
- Spring Boot y React se ejecutaron con configuración temporal, sin modificar archivos versionados. Se utilizó `ddl-auto=validate`, con inicialización SQL y migraciones deshabilitadas.
- Antes del arranque se verificó la presencia de las tres cuentas demo en la copia. La comparación posterior confirmó que `DataInitializer` no agregó usuarios.
- Antes de cada escritura se comprobaron el aislamiento y la identidad del producto. El proceso del backend de 8081 mantenía conexiones de base de datos exclusivamente al puerto 3307.
- Se registraron instantáneas privadas y se compararon todos los campos de los registros originales. No se modificó ni restauró la base original.
- Las escrituras se limitaron al producto temporal autorizado. Las comprobaciones posteriores utilizaron únicamente lecturas. No se eliminaron físicamente registros ni se alteraron contenedores ajenos.

Este informe no contiene credenciales, tokens JWT, claves ni datos personales de usuarios.

## 4. Pruebas realizadas

Los endpoints de la tabla corresponden exclusivamente a `http://localhost:8081`.

| Operación | Endpoint | Código HTTP esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| Consultar productos iniciales | `GET /api/v1/productos` | `200 OK` | Se recibieron los 16 productos iniciales. | Aprobada |
| Consultar categorías | `GET /api/v1/categorias` | `200 OK` | Se recibieron las 8 categorías. | Aprobada |
| Crear producto temporal | `POST /api/v1/productos` | `201 Created` | Se creó `QA_PROD_20261117`; MariaDB asignó el ID 17. Se verificó un único registro con ese código. | Aprobada |
| Editar producto temporal | `PUT /api/v1/productos/17` | `200 OK` | Nombre actualizado a `QA - Producto temporal editado` y precio a 1500. Se conservaron ID, código y todos los demás campos. | Aprobada |
| Desactivar producto temporal | `DELETE /api/v1/productos/17` | `204 No Content` | El registro permaneció almacenado y únicamente cambió su estado a `activo=false`. | Aprobada |

### Datos utilizados para la creación

| Campo | Valor autorizado y comprobado |
|---|---|
| Código | `QA_PROD_20261117` |
| Nombre inicial | `QA - Producto temporal` |
| Descripción | `Producto exclusivo para validacion CRUD` |
| Precio inicial | 1250 |
| Stock | 5 |
| Stock crítico | 1 |
| Descuento | 10 % |
| Imagen | `/images/productos/TC001.jpg` |
| Categoría | Tortas Cuadradas, ID real 1 |
| Estado inicial | `activo=true` |

Se verificó un único POST de producto, un único PUT y un único DELETE, cada uno dirigido al endpoint autorizado. La creación y la edición se reflejaron en los listados administrativo y público antes de realizar la desactivación.

## 5. Validación de eliminación lógica

Después del DELETE se comprobó que:

- El registro ID 17 seguía existiendo en MariaDB con el código `QA_PROD_20261117` y `activo=false`.
- Nombre, precio y demás campos permanecían iguales a los valores registrados después de la edición.
- El listado administrativo conservaba el producto, mostraba **INACTIVO** y tenía deshabilitado su botón Eliminar.
- El catálogo público de React y `GET /api/v1/productos` excluían el producto.
- La búsqueda pública por el nombre editado devolvía `200 OK` con una lista vacía.
- La consulta pública por categoría excluía el producto desactivado.
- `GET /api/v1/productos/17` devolvía `404 Not Found`.

No se ejecutó una eliminación física ni se repitió el DELETE.

## 6. Integridad de datos

| Comprobación final | Resultado |
|---|---|
| Registros físicos en `pasteleria_crud_test.producto` | 17: los 16 originales copiados y el temporal inactivo |
| Productos del catálogo público de pruebas | 16 |
| Otros 16 productos de la copia | Todos sus campos permanecieron idénticos a la instantánea inicial |
| Categorías de la copia | 8, sin modificaciones en sus campos |
| Usuarios de la copia | Sin modificaciones |
| Base original `pasteleria_db` | Productos, categorías y usuarios idénticos a la instantánea inicial |

El producto temporal permanece únicamente como registro adicional inactivo en la base de pruebas. No se ejecutaron procedimientos de limpieza.

## 7. Resultados de calidad

Las operaciones de creación, edición y desactivación se realizaron desde los formularios y controles de la interfaz administrativa React, con sesión ADMIN en un perfil de navegador aislado. No se sustituyeron por llamadas directas de escritura a la API.

Se inspeccionaron las solicitudes de red para verificar método, destino y respuesta HTTP. La persistencia y la integridad se comprobaron mediante consultas de lectura a MariaDB y comparación de todos los campos. También se verificó la actualización de los listados públicos y administrativos.

Como verificaciones complementarias disponibles, la suite React registró **225 pruebas aprobadas**, ESLint y build correctos. El backend registró **30 pruebas aprobadas con Temurin JDK 17**, sin fallos, errores ni omisiones, y resultado Maven **BUILD SUCCESS**. Estas pruebas automatizadas utilizaron mocks o contextos aislados.

## 8. Observaciones

- Durante el arranque, Hibernate mostró una advertencia de dialecto MySQL legado al conectar con MariaDB. No bloqueó el inicio, las lecturas ni las operaciones CRUD verificadas. No se modificó la configuración para corregirla durante estas pruebas.
- La primera comprobación automatizada de la fila desactivada tuvo un falso negativo: esperaba el texto «Inactivo», mientras el estilo de la interfaz lo presentaba como «INACTIVO». Una inspección posterior exclusivamente de lectura confirmó el registro administrativo, `activo=false` y el botón Eliminar deshabilitado. No se repitió DELETE ni fue necesario modificar el código del proyecto.
- El build de React emitió una advertencia de tamaño de bundle superior a 500 kB, sin impedir su generación.

## 9. Conclusión

El CRUD de productos quedó validado de extremo a extremo entre React, Spring Boot y MariaDB en el entorno aislado. Se comprobaron la creación, la edición limitada a los campos autorizados y la desactivación lógica del producto temporal, así como su persistencia, visibilidad y exclusión de los endpoints públicos al quedar inactivo.

La comparación de datos confirmó la conservación de los 16 productos originales copiados, las 8 categorías, los usuarios y la base original `pasteleria_db`.

## 10. Próximos pasos

El ciclo CRUD básico de categorías ya fue validado desde React con sesión ADMIN en el entorno aislado: POST devolvió `201 Created`, PUT devolvió `200 OK` y DELETE devolvió `204 No Content`. La categoría temporal ID 9 fue eliminada físicamente y las 8 categorías originales permanecieron intactas. Los resultados se documentan en [INFORME_PRUEBAS_CRUD_CATEGORIAS.md](INFORME_PRUEBAS_CRUD_CATEGORIAS.md).

Sigue **pendiente** la prueba HTTP real de `409 Conflict` al intentar eliminar una categoría con productos asociados, incluidos los inactivos. Esta comprobación requerirá autorización específica y deberá realizarse exclusivamente en el entorno aislado.
