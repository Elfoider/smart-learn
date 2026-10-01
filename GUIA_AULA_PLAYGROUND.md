# Smart Learn — revisión del aula, prácticas y demostración

Paquete basado en smart-learn-actual.zip del 30/09/2026. Esta revisión mejora lo desarrollado en los Sprints 5 y 6; no inicia el Sprint 7. Mantiene Ollama, Firebase App Hosting y Firestore smart-learn-db.

## Qué cambia

- El playground presenta primero las prácticas reales. Los ejemplos fijos quedan dentro de un apartado plegable identificado como demostración.
- Selección de materia inscrita, clase publicada y dificultad básica/intermedia/avanzada. Se genera un ejercicio nuevo con cuatro alternativas y una pista. Las alternativas se barajan.
- Se envían al modelo la clase y una variación por solicitud. Se rechazan preguntas iguales a las últimas 20 de la materia (dentro de las 40 prácticas recientes del usuario), alternativas duplicadas y JSON incompleto. No se garantiza ausencia de similitudes semánticas: si el modelo repite una pregunta o produce una salida inválida, se muestra un error para volver a generar.
- Las soluciones quedan en el servidor hasta responder. La corrección y el incremento de intentos se realizan en una transacción. Una matrícula inactiva o una clase retirada impiden responder a una práctica pendiente.
- Historial de las últimas 10 prácticas completadas y recuperación de la práctica pendiente más reciente al volver a entrar.
- Aula de materias reales con unidades y capítulos en el lateral, secciones de objetivos, conceptos, ejemplos y actividades; progreso, notas personales y botón Practicar esta clase.
- Campo docente "Contenido de la clase para estudiantes" en la planificación. Las observaciones docentes no se usan como lectura ni se envían al tutor. Los objetivos y contenidos públicos de la planificación alimentan las prácticas.
- Mi progreso muestra clases marcadas, intentos de prácticas reales y aciertos. Es progreso formativo; no sustituye una calificación oficial.
- La consulta de datos deja de mostrar resultados de la materia anterior mientras carga una nueva.

## 1. Aplicar sin perder tu configuración

Extrae este ZIP en una carpeta nueva, por ejemplo C:\workspace\smart-learn-aula-playground. Comprueba que package.json y APLICAR_ACTUALIZACION.ps1 están en esa raíz.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-aula-playground\APLICAR_ACTUALIZACION.ps1 -Destination C:\workspace\smart-learn
cd C:\workspace\smart-learn
npm run test:practice
npm run test:ai
npm run lint
npm run build
```

El instalador modifica solo los archivos incluidos en CAMBIOS.json y crea un respaldo en una carpeta hermana del proyecto. Conserva .env.local, local-ai/.env, .git y node_modules, así como archivos propios fuera de la lista. Si editaste uno de los archivos listados después de crear el ZIP base, compara con el respaldo y combina tus cambios.

No se añadieron dependencias: no necesitas reinstalarlas en tu proyecto actual. Para una instalación nueva, ejecuta npm ci y configura tus variables Firebase antes de compilar. Usa Node.js 24. Conserva el secreto LOCAL_AI_TOKEN ya configurado en App Hosting y la misma clave del gateway. El apphosting.yaml de tu ZIP base permanece igual.

No hay cambios en las reglas ni índices de Firestore. Para volver a comprobar reglas en tu PC, con Java 21:

```powershell
npx firebase emulators:exec --project demo-smart-learn --only firestore "npm run test:rules"
```

## 2. Preparar usuarios para la demostración

La carga utiliza perfiles existentes: no crea cuentas, no cambia contraseñas, no concede roles y no modifica colecciones de otros proyectos. Necesitas un docente activo y uno o dos estudiantes activos.

En Firebase Console > Authentication, copia los UID de esas cuentas. En smart-learn-db > users, comprueba role teacher/student y status active. El script valida esos perfiles antes de escribir. Puedes usar el docente con UID FVPq1GvxLUfqauPNp4oz0c2ELp33 si sigue siendo tu cuenta docente activa.

En PowerShell define los UID reales:

```powershell
$docente = 'FVPq1GvxLUfqauPNp4oz0c2ELp33'
$estudiantes = 'UID_REAL_ESTUDIANTE_1,UID_REAL_ESTUDIANTE_2'
```

Puedes colocar solo un UID en $estudiantes. No uses nombres, correos ni los textos de ejemplo como UID.

## 3. Revisar y cargar contenido

Primero ejecuta la vista previa; no se conecta a Firebase:

```powershell
npm run demo:preview -- --project smart-savings-4be47 --teacher-uid $docente --student-uids $estudiantes --with-progress
```

Luego carga:

```powershell
npm run demo:load -- --project smart-savings-4be47 --teacher-uid $docente --student-uids $estudiantes --with-progress
```

El script usa las credenciales Firebase Admin de tu .env.local o Application Default Credentials disponibles. Haber iniciado sesión con firebase login por sí solo no asegura credenciales Admin para este script. Si recibes un error de credenciales, conserva el mensaje sin mostrar claves y revisa FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY de tu configuración privada existente.

Se crean tres materias con IDs demo-web, demo-db y demo-ia, una sección para cada materia, 12 clases, 6 guías imprimibles, 6 encuentros de demostración y 3 actividades integradoras con rúbrica. Cada estudiante queda inscrito en las tres materias. Los datos se identifican con demo=true. Los documentos existentes se conservan; repetir la carga completa documentos faltantes después de una interrupción. No sirve para sobrescribir cambios del docente.

--with-progress añade calificaciones simuladas claramente identificadas, un registro de asistencia y una clase completada por materia. Omite ese indicador en ambos comandos si quieres comenzar con progreso real desde cero. No borra datos al omitirlo después.

Si existen materias demo-* pertenecientes a otro docente, la carga se cancela: no reasigna materias ni matrículas.

Las guías están dentro de public/demo-materials y se pueden imprimir/guardar como PDF. Estarán accesibles en el sitio después de desplegar este paquete. Si tu dominio cambia, agrega --base-url https://TU_DOMINIO a ambos comandos.

Los encuentros incluyen fechas relativas a la carga y enlazan al aula como demostración. No son videoconferencias reales. Sustituye sus enlaces desde el portal docente por tus salas o videos reales antes de mostrar una clase en vivo. Las actividades son de entrega manual; no se crean exámenes automáticos calificables ni se inventan videos externos.

## 4. Publicar la nueva versión

Antes de publicar, mantén encendidos Ollama y el gateway y comprueba el Funnel. Conserva tus secretos y variables Firebase actuales.

```powershell
git status
git diff
```

Revisa CAMBIOS.json para identificar los archivos de esta entrega. Añade esos archivos explícitamente (no .env.local ni local-ai/.env), realiza commit y push en master siguiendo el flujo existente. No es necesario desplegar reglas para esta actualización.

```powershell
$archivos = Get-Content .\CAMBIOS.json -Raw | ConvertFrom-Json
foreach ($archivo in $archivos) { git add -- $archivo }
git diff --cached --stat
git commit -m "feat: improve classroom and generate lesson-based practice"
git pull --rebase origin master
git push origin master
```

Espera a que el rollout nuevo en Firebase App Hosting > smart-learn esté activo. Recarga con Ctrl+F5.

## 5. Guion de demostración

1. Docente: abre Materias y muestra las tres materias de demostración.
2. Planificaciones: muestra las clases de ambas unidades. Abre una y muestra Contenido de la clase para estudiantes, objetivos y actividades; guarda/publica una modificación si quieres probar la edición.
3. Estudiante: entra en Mis materias inscritas > Programación Web. Usa los capítulos laterales y las cuatro secciones de lectura.
4. Guarda una nota personal y marca la clase como completada. Recarga y comprueba que ambas acciones se conservan.
5. Pulsa Practicar esta clase. Debe abrir la materia y clase correctas. Selecciona dificultad y genera un ejercicio; no aparece ninguna pregunta fija como práctica principal.
6. Usa Dame una pista, elige una alternativa y comprueba la explicación. Genera otro ejercicio y comprueba que cambia la pregunta.
7. Cambia de dificultad o clase. La dificultad es una instrucción al modelo; revisa su calidad pedagógica con el docente.
8. Completa una práctica, recarga y revisa historial, intentos y aciertos. Una práctica pendiente también puede recuperarse.
9. Pregunta al tutor sobre la clase. El contexto enviado corresponde a la clase seleccionada.
10. Abre Mi progreso para mostrar clases, prácticas y calificaciones de muestra si cargaste --with-progress.
11. Docente: genera un borrador de planificación/actividad/rúbrica con el asistente IA. El borrador requiere revisión humana.

Ollama puede equivocarse o generar JSON inválido. Las validaciones comprueban la estructura y repetición textual, no la verdad académica. La primera generación puede tardar más por cargar el modelo. El gateway continúa atendiendo una consulta simultánea; las demás reciben un aviso de indisponibilidad. No se consulta Gemini cuando AI_PROVIDER=ollama.

## Comprobaciones de la entrega

- Lint y build de producción completados. Comprobación HTTP del servidor de producción: login, playground, aula demo y guía accesibles; API de prácticas rechaza acceso sin sesión (401).
- 8 pruebas de proveedor/gateway y 5 pruebas de prácticas/contenido aprobadas.
- Carga de demostración comprobada en modo vista previa: no se ejecutó contra tu Firebase.
- Reglas e índices conservados. El intento de repetir test:rules en este entorno se bloqueó por Java 17; el CLI exige Java 21. Debe ejecutarse en tu PC con el comando indicado.
- Falta la validación autenticada de estas pantallas y la generación real en tu despliegue después de cargar los datos. La integración Ollama anterior ya fue confirmada por ti; esta entrega no afirma haber probado remotamente tu PC ni haber cargado tus usuarios.
