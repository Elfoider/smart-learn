# Resultados técnicos — Sprint 7 RC1

Fecha: 7 de octubre de 2026. Fuente: smart-learn-sprint7-base.zip proporcionado por el usuario. Node 24.19, Next 16.2.12; reglas ejecutadas con Java 21 y Firestore Emulator 1.22.0. Sin acceso a cuentas reales y sin escrituras en producción.

## Correcciones

- Intentos de examen: las reglas esperaban `in-progress` pero el servidor guardaba `active`. Ahora se permite guardar únicamente los campos de respuesta/navegación de intentos activos dentro del plazo.
- Tiempo de examen: calculado a partir del inicio y duración guardados por el servidor. Recargar o ralentizar el reloj no aumenta el plazo. Al expirar, se entregan las respuestas que ya se habían guardado; no se fuerza una última escritura fuera de tiempo.
- Resultados y número de intentos siguen en servidor; entregar de nuevo el mismo intento devuelve el resultado previo.
- Evaluaciones docentes visibles al estudiante, con instrucciones y rúbrica por matrícula/sección, separadas del banco fijo de demostración. La entrega manual mantiene el flujo con el docente; no se añade un sistema ficticio de carga de respuestas.
- Las prácticas generadas ya no permiten modificar sus contadores directamente desde el cliente. Se conservan los resultados existentes.
- Las escrituras docentes verifican materia, sección y referencias de matrícula/evaluación. Un perfil suspendido no accede a notas, asistencia o matrícula.
- JSON malformado e identificadores que contienen rutas producen 400; ocupado 429, timeout 504 y fallos de IA mensajes recuperables sin detalles internos.
- Cupo diario consistente y finito, contexto docente acotado para Ollama y badge de proveedor en el tutor de la materia.
- Se evita restaurar un perfil por una respuesta asíncrona que llega después de cambiar/cerrar sesión.
- Reinicio del aula al cambiar de materia, deduplicación de contenidos compartidos y calendario, mensaje cuando no hay próximos encuentros y aislamiento de asistencia por materias activas.
- Se excluye PALDOPROGRAMA del lint, como respaldo ya excluido del proyecto.

## Verificado

- 6/6 pruebas de contenido y prácticas.
- 8/8 pruebas de proveedor/gateway con generación controlada.
- 15/15 pruebas de handlers API/lógica con dobles de servicios: acceso, JSON, sección, solución no expuesta, idempotencia, cuota, recuperación, rol, examen y exclusión de observaciones del prompt.
- 13/13 pruebas de reglas en Firestore Emulator real: lecturas, permisos, intento activo y vencido, contadores protegidos, relaciones docentes y suspensión.
- Total: 42 pruebas aprobadas, 0 fallos.
- Lint: 0 errores, 0 advertencias.
- TypeScript y build de producción: exitosos.
- Smoke HTTP local: login, evaluaciones, playground, salón real y guía nueva responden 200; POST sin sesión a IA/matrículas responde 401.

Las pruebas de reglas cargan el archivo en un proyecto demo del emulador. Los SDK de producción de la app continúan seleccionando smart-learn-db. No confundir esta prueba con un despliegue de reglas a producción.

## Pendiente de aceptación

Recorridos autenticados con las cuentas del usuario, calidad de respuestas del Ollama real, revisión visual móvil/escritorio, publicación de reglas y rollout real, y revisión con docente/estudiante. Estos resultados no se inventan ni se marcan aprobados en la matriz.

## Alcance confirmado y límites

- La administración mantiene una pantalla inicial con protección por rol; no incluye gestión institucional completa. Esta candidata no presenta ese módulo como terminado.
- Las evaluaciones docentes se publican y consultan con rúbricas; las entregas manuales se coordinan con el docente. Las actividades online no tienen un editor/cuestionario dinámico conectado a este banco.
- El examen gráfico usa un banco fijo de demostración cuya solución existe en el código distribuido al cliente. Sirve para demostrar persistencia y temporizador, no para una evaluación oficial con respuestas secretas. Sus resultados no se incorporan automáticamente a las calificaciones docentes.
- Los encuentros de demo son enlaces al aula, no reuniones o grabaciones reales. El docente puede publicar enlaces reales.
- Las observaciones de planificación están en el mismo documento que la clase; aunque no se muestran en el aula ni se envían al tutor, no constituyen un almacén privado de notas docentes. Se aclara evitar datos personales.
- El modelo puede equivocarse: la rúbrica de revisión humana y las pruebas de preguntas forman parte de la aceptación.
- No se altera el contenido académico de demostración ni se añaden calificaciones nuevas por aplicar este paquete.

## Recuperación

El instalador guarda los archivos sustituidos en smart-learn-backup-sprint7-FECHA. Para recuperar código usa esa copia o una reversión del commit en Git. La recuperación de reglas se hace publicando el archivo anterior en smart-learn-db, sin borrar la base. No elimines documentos de usuarios para revertir una actualización de código.
