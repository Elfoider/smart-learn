# Sprint 7 — Smart Learn, candidata RC1

Código actualizado y pruebas técnicas completas. El cierre de aceptación requiere repetir los recorridos con tus usuarios, Ollama y Firebase App Hosting. No se hicieron escrituras en tu Firebase ni se publicó código desde este entorno.

## 1. Aplicar

Detén `npm run dev`. Extrae el ZIP en `C:\workspace\smart-learn-sprint7-rc1` y ejecuta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-sprint7-rc1\APLICAR_SPRINT7.ps1 -Destination C:\workspace\smart-learn
cd C:\workspace\smart-learn
npm ci
if ($LASTEXITCODE -ne 0) { throw "Falló npm ci. Detener aquí." }
npm test
if ($LASTEXITCODE -ne 0) { throw "Fallaron las pruebas. Detener aquí." }
npm run lint
if ($LASTEXITCODE -ne 0) { throw "Falló lint. Detener aquí." }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw "Falló TypeScript. Detener aquí." }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falló build. Detener aquí." }
```

Necesitas Node 24. El instalador crea respaldo y copia solo el manifiesto del Sprint 7. Conserva `.git`, `.env.local`, `local-ai/.env` y `local-ai/iniciar-smart-learn.ps1`, incluso aunque este último esté sin confirmar en Git. No hay nuevos paquetes ni variables requeridas. Mantén la configuración actual de Ollama y Firebase.

`npm test` ejecuta 29 pruebas: 6 de contenido/prácticas, 8 de proveedor/gateway y 15 de integración/lógica. Las pruebas API usan dobles controlados de Auth, Firestore y generación; no consultan tu IA real ni tu base de producción. Los avisos de módulos de Node y mocking experimental no equivalen a pruebas fallidas. El uso de namedExports conserva compatibilidad con Node 24.12 aunque versiones posteriores avisen su deprecación.

## 2. Validar reglas en el emulador

Necesitas Java 21 o superior para este emulador. Comprueba:

```powershell
java -version
npx firebase emulators:exec --project demo-smart-learn --only firestore "npm run test:rules"
if ($LASTEXITCODE -ne 0) { throw "Fallaron las reglas. No desplegar." }
```

Debe indicar 13 pruebas aprobadas. Los mensajes PERMISSION_DENIED de las operaciones que se espera rechazar son normales si el resumen termina con `fail 0`. Se ejecuta una base de emulador con el archivo de reglas; no se usa producción. Cliente y servidor de la aplicación mantienen la base nombrada `smart-learn-db`.

## 3. Publicar las reglas corregidas

Este Sprint sí modifica las reglas: estado de intentos `active`, plazo de escritura, campos protegidos, contadores reales solo desde servidor, relaciones curso/sección/matrícula/evaluación y bloqueo de perfiles suspendidos. Publica solo la base de Smart Learn:

```powershell
npx firebase deploy --only firestore:smart-learn-db --project smart-savings-4be47
if ($LASTEXITCODE -ne 0) { throw "Falló el despliegue de reglas. Detener aquí." }
```

No se cambian índices ni se migran documentos. Las notas y el progreso existentes permanecen. Para corregir calificaciones, la matrícula debe estar activa y la evaluación y sección deben corresponder a la materia.

## 4. Probar en local

Enciende tu acceso directo de IA local y comprueba el gateway. Después inicia la app:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/health
npm run dev
```

En http://localhost:3000 realiza los casos de `docs/sprint7/MATRIZ_PRUEBAS.csv`, marcados PENDIENTE. Casos prioritarios:

1. Con docente: crea una evaluación de entrega manual para una materia/sección, añade rúbrica y publícala.
2. Con estudiante matriculado: abre Evaluaciones; verifica título, instrucciones, fechas, ponderación y criterios. Una clase de otra sección no debe aparecer.
3. Vuelve al docente y registra/publica una calificación y asistencia. Comprueba la nota y asistencia desde el estudiante. No uses muestras de demostración como evidencia de una calificación real.
4. En el banco de examen de demostración: inicia, responde, recarga, comprueba respuestas y tiempo y entrega. La nota de este banco permanece separada de las calificaciones docentes. Si ya agotaste intentos, utiliza otro estudiante activo de prueba; no elimines resultados reales.
5. Crea y responde dos prácticas nuevas, recarga y verifica contadores/historial. El servidor impide contabilizar dos veces el mismo ejercicio.
6. Consulta el tutor; después de responder debe mostrar IA local. Prueba otra materia y el asistente docente.
7. Cierra el gateway: una práctica/tutor real muestra un error recuperable. Reinícialo y reintenta. La demostración de Smart Tutor puede usar respaldo si AI_FALLBACK_ENABLED=true; no cambia de Ollama a Gemini.
8. Revisa móvil y escritorio, salida de sesión y enlaces de materiales/clases. Usa un perfil administrador real para revisar su protección por rol; su pantalla sigue siendo inicial.

Cada consulta de IA admitida consume un cupo diario, incluso si el proveedor falla o devuelve un ejercicio inválido. Tutor, práctica y copiloto comparten el cupo por usuario y fecha UTC.

## 5. Subir el código y desplegar

No uses `git add .`: tu script de arranque puede mantenerse local. Agrega solo el manifiesto:

```powershell
$archivos = Get-Content .\CAMBIOS_SPRINT7.json -Raw | ConvertFrom-Json
foreach ($archivo in $archivos) { git add -- $archivo }
git diff --cached --stat
git commit -m "fix: stabilize Smart Learn sprint 7 release candidate"
if ($LASTEXITCODE -ne 0) { throw "No se creó el commit. Revisa git status." }
git pull --rebase origin master
if ($LASTEXITCODE -ne 0) { throw "Resuelve el rebase antes de continuar." }
git push origin master
if ($LASTEXITCODE -ne 0) { throw "Falló git push." }
```

Comprueba en Firebase Console → App Hosting → smart-learn que el nuevo commit tenga rollout activo. La configuración de producción permanece: AI_PROVIDER=ollama, URL HTTPS del Funnel, LOCAL_AI_TOKEN en Secret Manager, modelo y timeout actuales. No copies la URL 127.0.0.1 a App Hosting. No publiques archivos de secretos.

Mantén PC, Ollama, gateway y Funnel encendidos. Recarga la aplicación publicada con Ctrl+F5 y repite los casos prioritarios con tus cuentas. Una prueba exitosa en localhost no demuestra que el Funnel esté disponible desde producción.

## 6. Cerrar Sprint 7

Completa la matriz con resultado observado, evidencia/captura, evaluador y fecha. Realiza una revisión con un docente y un estudiante; comprueba el despliegue activo y registra incidencias. Solo después de aprobar estos recorridos puede congelarse la versión y marcar el cierre del Sprint 7. Consulta `docs/sprint7/RESULTADOS_TECNICOS.md` para distinguir validaciones realizadas de pruebas pendientes.
