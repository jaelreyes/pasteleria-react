# Entrega EV3 — Pastelería 1000 Sabores

Documentos preparados a partir de los anexos de la evaluación. Los ejemplos de Pokémon se usan solo como referencia de formato.

| Entregable | Archivo |
| --- | --- |
| ERS terminada para el alcance EV3 | [ERS_EV3.docx](ERS_EV3.docx) |
| APIs e integración | [DOCUMENTACION_APIS_E_INTEGRACION_EV3.docx](DOCUMENTACION_APIS_E_INTEGRACION_EV3.docx) |
| Inventario de APIs, según Anexo 3 | [DOCUMENTACION_APIS_EV3.xlsx](DOCUMENTACION_APIS_EV3.xlsx) |
| Manual con capturas numeradas, título, borde negro y nota | [MANUAL_USUARIO_EV3.docx](MANUAL_USUARIO_EV3.docx) |
| Capturas reales | [evidencias/](evidencias/) |
| Resultados HTTP sin credenciales | [resultados_http.json](evidencias/resultados_http.json) |

Las pruebas reales utilizaron únicamente React 5175, Spring Boot 8082 y MariaDB 3309/pasteleria_ev3_e2e_test. Se comprobaron CRUD de productos y categorías, catálogo, compra y boleta, login, recarga, renovación de JWT, 401/403, roles y Swagger. Las operaciones observadas solo en código y las pruebas no ejecutadas se distinguen en los documentos.

No se han publicado estos cambios. La entrega exige enlaces públicos de ambos repositorios, proyectos comprimidos y presentación de 15 minutos más 5 de preguntas. Los ZIP de código se preparan fuera de los repositorios; no incluyen dependencias, .git, archivos privados ni datos de la base.

## Versión corregida y verificada

Los cuatro documentos están en versión 1.1. Reflejan JWT_SECRET obligatorio, conexión por variables, claves demo privadas y validate por defecto. La verificación funcional posterior pasó los tres logins, /auth/me, recarga, renovación JWT, permisos, catálogo y Swagger sin modificar datos. [Resultados reales de esa verificación](evidencias/verificacion_configuracion_corregida.json). Las capturas y resultados_http.json anteriores se conservan sin cambios.

Los documentos incorporan los datos académicos oficiales del equipo: Jael Reyes; Aileen Oyaneder; Benjamin Riquelme Pozo; docente VICTOR HUGO GOMEZ ATABALES; sección 003D. Los ZIP y documentos independientes de ENTREGA_EV3_20261118 se regeneraron con el árbol de trabajo actual de integracion/ev3-main-equipo. El commit/push continúa pendiente de autorización.

## Datos académicos

- Integrantes: Jael Reyes; Aileen Oyaneder; Benjamin Riquelme Pozo.
- Docente: VICTOR HUGO GOMEZ ATABALES.
- Sección: 003D.
- Asignatura: Desarrollo Fullstack II.
- Evaluación: Evaluación Parcial 3 (EV3).

