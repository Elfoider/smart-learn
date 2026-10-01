# Contenido ampliado de Smart Learn

Total: 36 clases (12 por materia), 18 guías, 15 actividades manuales y 6 encuentros de demostración. Nuevos temas: HTML, CSS, accesibilidad, APIs, listas y efectos de React, seguridad; normalización, restricciones, agregación, subconsultas, índices, ACID y Firestore; limpieza de datos, fuga de información, métricas, validación, prompts, recuperación de contenido y operación de IA local. Cada clase nueva incluye explicación, ejemplo y actividad. No se inicia el Sprint 7.

## Instalación
Extrae el ZIP en C:\workspace\smart-learn-contenido-ampliado. Ejecuta:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-contenido-ampliado\APLICAR_ACTUALIZACION.ps1 -Destination C:\workspace\smart-learn
cd C:\workspace\smart-learn
npm run test:practice
npm run test:ai
npm run lint
npm run build
```
El instalador respalda los archivos sustituidos y conserva credenciales y archivos fuera del manifiesto.

## Carga
```powershell
$docente = "FVPq1GvxLUfqauPNp4oz0c2ELp33"
$estudiantes = "8T65lJw0KHhFMsAx0s9zSqNHL4N2"
npm run demo:preview -- --project smart-savings-4be47 --teacher-uid $docente --student-uids $estudiantes
npm run demo:load -- --project smart-savings-4be47 --teacher-uid $docente --student-uids $estudiantes
```
Con la carga anterior completa se esperan 48 nuevos y 36 conservados (84 previstos sin --with-progress). No se sobrescriben documentos ni se modifica el progreso. Los talleres nuevos tienen ponderación 0; el docente puede ajustarla tras revisar su plan de evaluación. Los encuentros son enlaces de demostración al salón, no reuniones o videos reales.

## Publicación
El manifiesto reúne la actualización del aula anterior y el contenido nuevo.
```powershell
$archivos = Get-Content .\CAMBIOS.json -Raw | ConvertFrom-Json
foreach ($archivo in $archivos) { git add -- $archivo }
git diff --cached --stat
git commit -m "feat: improve classroom and expand academic demo content"
git pull --rebase origin master
git push origin master
```
Comprueba que Firebase App Hosting publique el commit y el rollout quede activo. No requiere nuevas reglas ni índices. Conserva apphosting.yaml con AI_PROVIDER=ollama y LOCAL_AI_URL apuntando al Funnel, y el token en Secret Manager.

Después comprueba 12 clases por materia, nuevas guías y talleres, generación de ejercicios de unidades nuevas e historial. Mantén Ollama, gateway y Funnel encendidos. Las guías cargadas en Firebase apuntan a producción y estarán disponibles tras publicar el código. Para probarlas antes, abre http://localhost:3000/demo-materials/web-unidad-3.html (también db/ia y unidades 3 a 6).

Validación del paquete: 14 pruebas aprobadas, lint sin errores ni advertencias y build exitoso. No se hicieron escrituras en Firebase desde el entorno de elaboración ni pruebas reales del modelo en esta ampliación.
