# Smart Learn — UX/UI 1

Entrega del 9 de octubre de 2026, basada exclusivamente en smart-learn-ux-base.zip.

## Qué incorpora

Logo horizontal adaptado al tema, icono en navegación y favicon. Paleta azul profundo, turquesa y cian. Navegación común a los tres portales: barra lateral de 76 px contraída inicialmente, 260 px al expandir; barra superior de 60 px. En concentración se oculta la barra lateral y la superior baja a 48 px. Preferencias de visualización guardadas localmente por portal. Ventanas de navegación, guía y búsqueda con el elemento dialog nativo. Foco visible, enlace para saltar al contenido, estados activos, transiciones y movimiento reducido.

El buscador busca SECCIONES del portal, no documentos o contenido académico. Se abre con la lupa o Ctrl+K/Cmd+K. Los módulos conservan sus propios filtros. El panel de avisos muestra exclusivamente la configuración institucional existente; no representa notificaciones de tareas ni un contador de mensajes sin leer.

El selector de evaluaciones/calificaciones queda plegado. El recorrido estático de demostración del estudiante se conserva plegado: las materias reales quedan primero.

## Aplicar

Extrae el ZIP en C:\workspace\smart-learn-ux1, fuera de tu proyecto. Detén npm run dev. Usa PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-ux1\APLICAR_UX1.ps1 -Destination C:\workspace\smart-learn
if ($LASTEXITCODE -ne 0) { throw "Falló la actualización." }
cd C:\workspace\smart-learn
npm ci
if ($LASTEXITCODE -ne 0) { throw "Falló npm ci." }
foreach ($tarea in @("test", "lint", "typecheck", "build")) {
    npm run $tarea
    if ($LASTEXITCODE -ne 0) { throw "Falló: $tarea" }
}
npm run dev
```

El instalador valida todo el manifiesto antes de copiar y usa rutas literales, incluidas las carpetas con corchetes. Crea un respaldo de los archivos sustituidos. Conserva credenciales, .git, datos remotos y local-ai/iniciar-smart-learn.ps1. No requiere publicar reglas ni volver a cargar contenido: no modifica Firestore, índices, IAM ni configuración de Ollama.

## Comprobación manual con tus cuentas

1. Abre http://localhost:3000 e inicia sesión con estudiante, docente y administrador, por separado.
2. Comprueba que cada rol conserva todas sus herramientas y solo accede a su portal.
3. Expande/contrae el menú; recarga y comprueba que recuerda tu elección.
4. Activa concentración; navega por tu tarea y usa Volver para recuperar los controles.
5. Abre la lupa, busca Evaluaciones o Materiales y entra en el resultado. Comprueba también un texto sin resultados. Pulsa Escape para cerrar.
6. Abre la guía de uso y los avisos. Verifica que el aviso coincide con Configuración institucional.
7. Cambia entre temas y comprueba logo, texto, formularios y estados.
8. En docente, despliega Herramienta dentro de Evaluaciones y cambia al Libro de calificaciones.
9. En móvil, abre el menú, selecciona una sección y comprueba que se cierra. Revisa a 390 y 360 px y con zoom.
10. Usa Tab y Shift+Tab: revisa foco, apertura/cierre de ventanas y regreso al botón de origen. Prueba reducir movimiento desde el sistema operativo.
11. Abre una clase real, consulta materiales, genera una práctica con la IA y guarda una operación administrativa de prueba. Estas comprobaciones requieren tus credenciales y el gateway encendido.

## Subir después de comprobar

```powershell
$archivos = Get-Content -LiteralPath .\CAMBIOS_UX1.json -Raw | ConvertFrom-Json
foreach ($archivo in $archivos) {
    git add -- $archivo
    if ($LASTEXITCODE -ne 0) { throw "No se pudo agregar: $archivo" }
}
git diff --cached --stat
git commit -m "feat: refresh Smart Learn identity and compact portal navigation"
if ($LASTEXITCODE -ne 0) { throw "Revisa el commit." }
git pull --rebase origin master
if ($LASTEXITCODE -ne 0) { throw "Resuelve el rebase antes de continuar." }
git push origin master
if ($LASTEXITCODE -ne 0) { throw "Falló git push." }
```

Revisa el rollout del commit en App Hosting y repite los recorridos en producción. El build debe usar tus variables existentes. Si no ves el favicon nuevo, prueba una recarga sin caché. Para revertir, recupera los archivos del respaldo o revierte el commit; las preferencias visuales pueden restablecerse desde los mismos controles.

## Alcance y fases siguientes

Esta entrega realiza la auditoría de la base y la identidad visual, y establece la navegación compacta. No declara completada toda la fase de búsqueda/acompañamiento: quedan búsqueda académica, avisos de actividades y bienvenida contextual. La guía actual está disponible bajo demanda.

1. Auditoría: realizada sobre el ZIP y las 18 capturas, con los hallazgos de AUDITORIA_UX1.md.
2. Identidad y efectos: base integrada; ajuste posterior con prueba real de contraste y lectura.
3. Navegación compacta: integrada; funciones de búsqueda académica y notificaciones posteriores.
4. Estudiante y salón: siguiente entrega, contenido como centro y paneles auxiliares.
5. Playground exclusivo: sesiones, formatos, pistas y retroalimentación.
6. Docente exclusivo: flujos de publicación, formularios, seguimiento y ampliación de funciones.
7. Archivos y PDF con IA: Storage, extracción, edición y exportación; todavía no incluidos.
8. Presentaciones docentes: editor, IA y PDF/imágenes exportados de Canva; conexión directa sujeta a viabilidad de sus APIs.
9. Administrador: flujos guiados y fichas más comprensibles.
10. Validación completa: pruebas de roles, datos, móvil, archivos y documentos generados.
