# Auditoría UX/UI 1

Fuentes revisadas: ZIP smart-learn-ux-base.zip, 18 capturas reales y seis variantes del logo. Fecha: 2026-10-09.

## Hallazgos y decisiones

- Estudiante y docente tenían buscadores superiores sin comportamiento: sustituidos por acceso a secciones, con alcance explícito. La búsqueda de contenido académico requiere una implementación posterior por permisos.
- La campana del estudiante no abría notificaciones y tenía un punto fijo: sustituida por panel de avisos institucionales basado en configuración real, disponible en los tres portales.
- La franja de configuración institucional repetía información sobre cada encabezado: movida al panel de avisos.
- Menús laterales de 256/288 px, perfiles repetidos y bloques promocionales permanentes reducían el área de trabajo: navegación compartida, contraída inicialmente y expandible; ayuda bajo demanda.
- Evaluaciones/calificaciones mostraba un selector ancho antes del contenido: sustituido por control desplegable.
- Inicio estudiantil mezclaba materias reales y un recorrido estático extenso: demostración conservada en un bloque plegado.
- El nuevo logo combina azul profundo y cian: assets originales integrados, sin alterar el dibujo; versiones para tema y favicon.
- Los formularios y consultas administrativas se conservan; no se modifican APIs, permisos, límites ni transacciones.

## Recorridos preservados

Estudiante: materias → clase → recursos/práctica → progreso.
Docente: asignaturas/secciones → planificación/materiales → publicación → evaluación/asistencia.
Administrador: usuarios → materia/sección → matrícula → seguimiento/auditoría.

## Validación

npm ci finalizado. npm test: 44 pruebas existentes aprobadas (6 práctica/contenido, 8 IA, 15 integración, 15 administrador). Lint sin errores ni advertencias. Typecheck aprobado. Build aprobado con valores de Firebase ficticios, sin credenciales reales ni conexión de escritura al proyecto.

No se publicaron reglas, cambios remotos ni despliegues. Reglas sin cambios: no se repitieron emuladores. La comprobación con datos y cuentas reales, Funnel y App Hosting se realiza en la guía antes de subir el commit. El instalador usa las mismas operaciones literales corregidas anteriormente; no se ejecutó en Windows en este entorno.

Pruebas de interacción con Chromium headless y componentes reales en una aplicación aislada: tres roles en escritorio (1440 px) y móvil (390 px), navegación expandida/contraída, búsqueda de secciones, guía, avisos vacíos, concentración, cambio de módulo administrador, apertura/cierre de formulario, tema claro, movimiento reducido, persistencia tras recarga y ausencia de errores JavaScript no controlados. Los datos y la sesión eran fixtures; no se verificó autenticación real ni conexión a producción.
