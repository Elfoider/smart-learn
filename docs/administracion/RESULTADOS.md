# Resultados de la ampliación administrativa

Base: entrega Smart Learn Sprint 7 RC1, derivada del ZIP original proporcionado el 7 de octubre de 2026. El panel inicial /admin se sustituyó por gestión real de perfiles, materias, secciones, matrículas, planificación/clases, materiales, encuentros, evaluaciones/rúbricas, notas, asistencia, reportes, configuración y auditoría.

## Arquitectura y controles

La interfaz conserva el diseño de Smart Learn y usa /api/admin con ID token Firebase. Las APIs comprueban rol admin y estado active; las mutaciones vuelven a comprobar el actor dentro de la transacción. adminControl/writes serializa cambios administrativos. No se permite retirar el acceso del propio actor. La creación o vinculación de cuentas usa Authentication, pero roles y suspensión pertenecen al perfil de smart-learn-db. No se deshabilitan cuentas compartidas con otras apps del proyecto.

Los campos aceptados por cada módulo tienen esquemas estrictos. El servidor deriva responsables, identidades de matrículas/calificaciones, escala, ponderación y cálculos; verifica referencias, fechas, rúbricas y capacidad. La reasignación docente actualiza los registros asociados con límite explícito de 400. Las escrituras administrativas producen auditoría de antes/después y motivo. El navegador no puede alterar perfiles ni la auditoría directamente.

Las cuentas abiertas escuchan cambios de perfil. La configuración general publica institución/período/aviso en los portales y aplica un límite compartido de IA. Proveedor, token y URL del gateway permanecen en la configuración del servidor. Los nuevos registros de IA no incluyen conversaciones.

## Validación automatizada

- Contenido y prácticas: 6/6.
- Gateway/proveedor: 8/8.
- Regresiones de API y lógica Sprint 7: 15/15.
- API/servicios administrativos, CSV e integración con matrícula docente: 15/15.
- Reglas Firestore en emulador: 16/16.
- Transacciones Admin SDK reales en base emulada nombrada smart-learn-db: 3/3, incluida concurrencia del cupo.
- Total: 63 aprobadas y 0 fallos. npm test agrupa 44; test:rules agrupa 19.

Las pruebas administrativas de API usan dobles controlados; las tres pruebas adicionales ejecutan el SDK y transacciones reales contra el emulador local. Ninguna escribe en producción ni consulta Ollama real. Java 21, Node 24.19 y Next 16.2.12.

## Interfaz y comprobaciones de compilación

Revisión de interfaz con Chromium headless y API/Auth controladas: resumen en escritorio, formulario de alta de usuario, creación de clase con validación de payload real, criterios de rúbrica, reportes y menú móvil a 390 px. Se comprobaron capturas y ausencia de desbordamiento horizontal en la lista móvil. La ruta temporal de esta revisión se retiró y no se distribuye. Este recorrido no equivale a iniciar sesión ni escribir en Firebase de producción.

Lint sin errores ni advertencias, TypeScript y compilación de producción correctos. Las verificaciones con cuentas reales siguen en la matriz de aceptación.

## Aceptación pendiente

Alta inicial y permisos IAM en el proyecto real, cuentas reales en los tres portales, acceso de usuario nuevo/recuperación de contraseña, pruebas académicas con docente/estudiante, calidad y disponibilidad de Ollama, validación del commit desplegado y revisión de los reportes con el tutor. La matriz no marca estos casos como aprobados.

## Límites del prototipo

Se conservan el banco fijo de examen de demostración, la entrega manual y los enlaces de materiales/reuniones. Esta ampliación no incorpora un sistema de archivos Storage, un editor de cuestionarios online, administración de Firebase/GitHub/IAM desde el panel ni reportes institucionales oficiales. Las páginas muestran hasta 50 registros, selectores hasta 1000 referencias y reportes hasta 5000 registros por colección. Estos límites se comunican y no se presenta un recorte como un total completo.

La auditoría registra operaciones realizadas mediante el panel y el alta inicial. Las ediciones directas en Firebase Console o con otras credenciales Admin SDK quedan fuera de esa auditoría de aplicación. Una cuenta Auth creada cuyo perfil falle por un error de Firestore permanece en Authentication y puede vincularse al reintentar; no se borra automáticamente una cuenta compartida.

Las observaciones de planificación siguen en el documento académico compartido: no son un almacenamiento privado. El examen de demo conserva soluciones en el código cliente y no es una evaluación oficial secreta.
