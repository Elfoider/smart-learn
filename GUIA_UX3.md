# UX/UI 3 — Inicio, materias y evaluaciones

Esta entrega se integra en `Develop`. Las siguientes actualizaciones se obtienen por Git: no vuelvas a ejecutar los instaladores UX1/UX2, porque corresponden a versiones anteriores.

## Cada sección tiene un propósito

- **Inicio:** retomar una clase pendiente ya publicada, consultar próximos encuentros y evaluaciones disponibles, y acceder hasta a tres aulas. Usa el avance guardado por el estudiante. Si no hay una clase para retomar, ofrece explorar materias.
- **Mis materias:** catálogo completo con búsqueda por nombre/código/descripción sin depender de acentos; filtros Todas, En curso, Por comenzar y Completadas; orden por nombre/código; vista de tarjetas o lista. El porcentaje se calcula con las clases publicadas y los IDs completados, descartando registros de clases eliminadas o ajenas.
- **Evaluaciones:** tarjetas compactas, contadores accionables, filtros por materia y estado, búsqueda y detalle modal. Se muestran apertura, cierre, ponderación e instrucciones; la rúbrica y el resultado publicado se consultan en secciones separadas. Las instrucciones se pueden revisar paso a paso con una lista temporal. Las materias sin evaluaciones no ocupan paneles vacíos separados.

El estado «Disponible» requiere publicación abierta y que el periodo permita el acceso. Una fecha futura se muestra como próxima y un plazo vencido como finalizado. «Con resultado» requiere una nota publicada para ese estudiante; el estado general «Calificada» de una actividad no inventa una nota personal.

El modo de entrega sigue las indicaciones del docente. La lista de preparación no envía respuestas, no registra entregas y no cambia calificaciones. Las evaluaciones de demostración dejaron de añadirse al catálogo principal; los archivos del módulo de demostración permanecen en el proyecto.

## Actualizar en Windows

Detén el servidor con Ctrl+C, confirma que estás en `Develop` y ejecuta:

```powershell
cd C:\workspace\smart-learn
git status --short
git switch Develop
git pull --ff-only origin Develop
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Si Git detecta cambios locales, consérvalos antes de cambiar de rama; no uses reset ni eliminación de archivos para saltar el aviso. Esta entrega no añade dependencias ni modifica variables, secretos, reglas de Firestore o configuración de App Hosting.

## Pruebas de aceptación con las cuentas reales

1. **Inicio:** confirma que se muestra la clase pendiente de una materia donde hayas estudiado. Marca una clase como completada, vuelve al inicio y comprueba que puede proponer la siguiente. Una materia sin clases publicadas no debe ofrecer progreso inventado.
2. **Agenda:** publica un encuentro futuro desde el portal docente y comprueba que se muestra en Inicio. Un encuentro pasado no debe aparecer entre los próximos.
3. **Materias:** prueba búsqueda, filtros, orden y cambio de vista. Compara el avance con las clases visibles de cada aula.
4. **Evaluaciones:** publica una actividad abierta y otra futura. Deben aparecer en sus filtros correspondientes; las antiguas deben mostrar Finalizada.
5. Abre **Ver actividad**, consulta el resumen, recorre las instrucciones, marca una como revisada y consulta **Cómo me evaluarán**. Cerrar y volver a abrir reinicia la lista temporal.
6. Publica una calificación desde el portal docente. El estudiante debe verla al abrir **Ver resultado**. Una nota aún no publicada no debe aparecer.
7. Filtra una materia sin actividades: muestra una orientación breve y permite restablecer filtros.
8. Prueba móvil, claro/oscuro, teclado y cierre del detalle con Escape. Las ventanas modales usan el control de foco nativo del navegador.
9. Revisa otra cuenta: las materias, actividades y notas deben corresponder a sus inscripciones y usuario. Cerrar sesión desmonta y limpia las suscripciones de la sesión.

## Validación técnica

- 50 pruebas aprobadas: 44 existentes y 6 nuevas de fechas/estados, avance, reanudación, instrucciones y seguridad de enlaces.
- Lint sin advertencias, TypeScript y build de producción correctos.
- Navegador a 1440×1000 y 390×844: inicio distinto del catálogo; reanudación; agenda; filtros y búsqueda; tarjetas/lista; estados de actividades; instrucciones paso a paso; rúbrica; resultado; filtros sin coincidencias; carga vacía/error/recuperación; temas; modales y ausencia de desbordamiento.
- La verificación de navegador emplea las suscripciones y componentes reales con un transporte de datos simulado, sin acceder a tu Firebase. Las pruebas de reglas existentes no se vuelven a ejecutar en esta entrega, ya que no se modifican reglas ni permisos. El build utiliza valores Firebase ficticios; en tu PC se conservan tus variables reales.

El cambio queda en `Develop`; la integración a `master` se hará tras la revisión y aprobación de esta versión.
