# Smart Learn · paquete integrado hasta Sprint 6

Aplicación Next.js 16, Firebase Authentication y Firestore **smart-learn-db**. Requiere Node.js 24 y npm 10.9.9 o posterior.

## Inicio rápido

1. Copia `.env.example` a `.env.local` y completa la configuración web de Firebase y las variables del servidor. No publiques `.env.local`.
2. Ejecuta `npm ci`, `npm run lint`, `npm run build` y `npm run dev`.
3. Configura y publica las reglas de `firestore.rules` en la base nombrada `smart-learn-db` según `GUIA_IMPLEMENTACION.md`.

## Funcionalidad

- Docente: materias, secciones, estudiantes, planificación, evaluaciones, notas; materiales por enlace, clases en línea, asistencia, reportes CSV y borradores IA.
- Estudiante: materias inscritas, aula con planificaciones, materiales y clases publicados, tutor IA basado en planificaciones, ejercicios generados y evaluados para materias inscritas, calificaciones publicadas, asistencia y agenda de clases.
- Las aulas de demostración, los ejercicios del playground y el examen gráfico heredados siguen disponibles como **ejemplos**. El tutor del playground resuelve su contexto desde el catálogo del servidor. El tutor del aula real exige inscripción activa y contenidos publicados.
- La carga binaria a Storage y la sustitución de todos los ejemplos por actividades creadas por el docente no están incluidas en este prototipo. El módulo de materiales publica enlaces HTTP/HTTPS. El despliegue productivo y las pruebas con cuentas reales se realizan en tu proyecto Firebase.

## Pruebas de permisos

Instala Java 21+ y ejecuta `npx firebase emulators:exec --project demo-smart-learn --only firestore "npm run test:rules"`. Las pruebas inyectan las mismas reglas en el emulador local; la aplicación productiva apunta a la base nombrada.

Consulta `GUIA_IMPLEMENTACION.md` para el reemplazo del proyecto y el despliegue.
