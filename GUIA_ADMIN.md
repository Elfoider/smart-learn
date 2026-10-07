# Administración integral de Smart Learn

Esta actualización incorpora un panel administrador conectado a smart-learn-db e incluye las correcciones de Sprint 7 RC1. Puede aplicarse tanto después de esa entrega como sobre el ZIP base enviado el 7 de octubre. El instalador conserva las credenciales, los archivos fuera del manifiesto y el arranque local de IA. No vuelve a sembrar contenido académico.

## 1 Aplicar y comprobar

Extrae el ZIP en C:\workspace\smart-learn-admin. Detén npm run dev y ejecuta por separado:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-admin\APLICAR_ADMIN.ps1 -Destination C:\workspace\smart-learn
cd C:\workspace\smart-learn
npm ci
if ($LASTEXITCODE -ne 0) { throw "Falló la instalación." }
npm test
if ($LASTEXITCODE -ne 0) { throw "Fallaron las pruebas." }
npm run lint
if ($LASTEXITCODE -ne 0) { throw "Falló lint." }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw "Falló TypeScript." }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falló build." }
```

Necesitas Node 24; npm test ejecuta 44 pruebas. No hay dependencias nuevas. Los avisos de módulos de Node/mocking experimental no son fallos si el resumen termina con fail 0.

Con Java 21 disponible:

```powershell
npx firebase emulators:exec --project demo-smart-learn --only firestore "npm run test:rules"
if ($LASTEXITCODE -ne 0) { throw "Falló el emulador. No publicar reglas." }
```

Debe aprobar 19 pruebas: 16 de reglas y 3 de transacciones con Admin SDK real sobre la base emulada nombrada smart-learn-db. Los PERMISSION_DENIED esperados son parte de los casos que rechazan escrituras.

## 2 Publicar reglas

```powershell
npx firebase deploy --only firestore:smart-learn-db --project smart-savings-4be47
if ($LASTEXITCODE -ne 0) { throw "Falló el despliegue de reglas." }
```

El navegador administrador puede leer los registros académicos. Sus escrituras se realizan mediante /api/admin: comprobación de rol y estado en servidor, validación de datos, transacciones y registro de auditoría. Incluso el administrador tiene bloqueados los cambios directos de perfiles, configuración y auditoría desde Firestore cliente. No hay que editar índices ni trasladar datos a otra base.

## 3 Preparar la primera cuenta administradora

Si ya tienes un perfil admin activo en Smart Learn, inicia sesión con esa cuenta y omite este paso.

1. En Firebase Console del proyecto smart-savings-4be47, entra en Authentication → Usuarios → Agregar usuario.
2. Crea una cuenta adicional para administración con tu correo y una contraseña. No conviertas las cuentas de prueba docente/estudiante que ya tienen materias o matrículas.
3. Copia el UID de la cuenta nueva.
4. Desde C:\workspace\smart-learn utiliza las mismas credenciales de servidor que ya te permitieron ejecutar demo:load. El script admite FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en .env.local, o Application Default Credentials / GOOGLE_APPLICATION_CREDENTIALS. No necesita esos valores en el navegador.
5. Sustituye el UID en los comandos siguientes. El primero solo muestra lo previsto; el segundo aplica el alta inicial.

```powershell
$adminUid = "PEGA_AQUI_EL_UID_NUEVO"
npm run admin:bootstrap -- --project smart-savings-4be47 --uid $adminUid
if ($LASTEXITCODE -ne 0) { throw "Revisa el UID y el proyecto." }
npm run admin:bootstrap -- --project smart-savings-4be47 --uid $adminUid --apply
if ($LASTEXITCODE -ne 0) { throw "No se creó el administrador." }
```

El script verifica la cuenta en Authentication, impide reemplazar un primer administrador ya existente y rechaza perfiles con materias o matrículas activas. Solo escribe perfil, control de operaciones y auditoría en smart-learn-db. No cambia contraseñas, roles de otras aplicaciones ni custom claims. Cierra sesión y vuelve a entrar para acceder a /admin.

## 4 Permisos del servidor en App Hosting

Consultar o crear cuentas desde el panel requiere los permisos firebaseauth.users.get y firebaseauth.users.create para la identidad que ejecuta el backend. App Hosting utiliza habitualmente:

firebase-app-hosting-compute@smart-savings-4be47.iam.gserviceaccount.com

En Google Cloud Console → IAM y administración → Roles, crea un rol personalizado en el proyecto, llamado Smart Learn gestión de cuentas, con solo estos dos permisos. Después, en IAM, edita esa cuenta de servicio y asígnale el rol personalizado. Conserva los permisos existentes de App Hosting, Firestore y Secret Manager. Si el backend utiliza otra cuenta de servicio, aplica el rol a la identidad configurada en ese backend.

La identidad predeterminada puede compartirse entre backends del mismo proyecto. El permiso es del proyecto Firebase; la aplicación limita las operaciones a consultar/crear cuentas y gestiona roles/estado exclusivamente en smart-learn-db. No deshabilita ni elimina cuentas de Authentication compartidas con PERITAR u otras aplicaciones.

Fuentes oficiales para revisar la configuración:
- https://firebase.google.com/docs/app-hosting/about-app-hosting
- https://firebase.google.com/docs/projects/iam/permissions
- https://firebase.google.com/docs/auth/admin/manage-users

No añadas claves privadas a apphosting.yaml. La configuración actual de Ollama y LOCAL_AI_TOKEN se conserva. Si el panel carga pero Crear usuario falla en producción, revisa estos permisos y los logs del backend.

## 5 Probar el panel

```powershell
npm run dev
```

En http://localhost:3000 inicia sesión con el administrador. La página debe mostrar el panel, su menú y datos reales. Sigue docs/administracion/MATRIZ_PRUEBAS.csv.

Recorrido recomendado:

1. Usuarios: crea o vincula un docente y un estudiante mediante su correo. Si el correo ya existe en Firebase, se aprovecha su UID sin modificar la cuenta de Authentication. Si ya tiene perfil Smart Learn, utiliza Editar. Las altas del panel son activas; el usuario puede establecer su contraseña desde Recuperar contraseña en Login, o entrar con el proveedor que ya tiene vinculado. El panel no envía invitaciones automáticamente.
2. Materias: crea una materia activa, elige docente, código y período. Secciones: añade horario, modalidad y capacidad. En los días escribe un día por línea usando Lun, Mar, Mié, Jue, Vie, Sáb o Dom.
3. Matrículas: elige materia, sección y estudiante activo. La capacidad y los contadores se comprueban en el servidor, también en las matrículas creadas desde el portal docente.
4. Clases y planificación: escribe el contenido de la clase, objetivos, actividades y fechas. Activa Visible para estudiantes. Los campos de listas usan una línea por elemento.
5. Materiales y encuentros: publica enlaces a guías/reuniones/grabaciones. Los materiales de demo ya existentes se conservan. Este panel gestiona enlaces; no incorpora carga de archivos a Storage.
6. Evaluaciones: crea una actividad de entrega manual con instrucciones, fechas, ponderación, escala y criterios de rúbrica. Comprueba que la suma de puntos no supera el máximo. Las actividades online conservan su metadato, pero no incluyen un editor de cuestionarios dinámico.
7. Calificaciones: selecciona la matrícula y evaluación correspondientes, escribe la nota y publícala. La escala, ponderación y sección se obtienen de los registros reales. Verifica la nota en la cuenta del estudiante.
8. Asistencia: registra fecha y estado. Repetir la misma materia/sección/fecha/estudiante actualiza el registro utilizado por el docente, sin duplicarlo.
9. Reportes: revisa totales por materia y exporta CSV. El promedio corresponde a calificaciones publicadas normalizadas sin ponderación; no es una nota final oficial. Asistencia cuenta presentes y llegadas tarde sobre todos los registros. Sin datos se muestra Sin datos.
10. Configuración: cambia institución, período y aviso; comprueba su aparición en los tres portales. Cambia el cupo diario y comprueba el límite en la IA real. El cupo compartido por usuario usa la fecha UTC; reducirlo por debajo del consumo actual bloquea nuevas consultas ese día.
11. Auditoría: comprueba responsable, fecha, motivo, datos anteriores y posteriores. Actividad de IA registra proveedor/modelo y éxito/fallo de tutor de materia, prácticas y copiloto; Smart Tutor de demo conserva su registro. No almacena el texto de las conversaciones. El éxito se refiere a la generación del proveedor; un ejercicio puede rechazarse después si su formato es inválido.
12. Suspende una cuenta de prueba y verifica que pierda acceso. Los perfiles abiertos escuchan cambios de rol/estado; las APIs y reglas vuelven a validarlos.

Cada cambio pide un motivo de al menos ocho caracteres. No puedes retirar tu propio acceso administrativo. Un docente con materias o estudiante con matrículas activas conserva su rol hasta reasignar/desactivar esas relaciones. Para conservar historial, la sección de una matrícula con notas o asistencia no se cambia; la evaluación con notas conserva su escala, ponderación, sección y rúbrica.

Reasignar el docente de una materia traslada responsables de secciones, matrículas, clases, materiales, encuentros, evaluaciones, calificaciones y asistencia en una transacción. El máximo es 400 documentos asociados; por encima se rechaza sin cambios y se necesita una migración planificada. Esta acción no cambia los autores históricos de la auditoría.

Los registros se archivan, ocultan o suspenden mediante sus estados. El panel no elimina físicamente expedientes ni cuentas. Las listas usan páginas de 50; búsqueda/exportación se aplican a la página visible. Los selectores cargan hasta 1000 referencias por tipo. Reportes admiten hasta 5000 registros por colección y rechazan excedentes de forma explícita.

## 6 Subir y desplegar

Cuando las comprobaciones anteriores pasen:

```powershell
$archivos = Get-Content .\CAMBIOS_ADMIN.json -Raw | ConvertFrom-Json
foreach ($archivo in $archivos) { git add -- $archivo }
git diff --cached --stat
git commit -m "feat: add integrated Smart Learn administration"
if ($LASTEXITCODE -ne 0) { throw "Revisa el commit antes de seguir." }
git pull --rebase origin master
if ($LASTEXITCODE -ne 0) { throw "Resuelve el rebase antes de seguir." }
git push origin master
if ($LASTEXITCODE -ne 0) { throw "Falló git push." }
```

En Firebase Console → App Hosting → smart-learn comprueba que el commit nuevo tenga rollout activo. En la aplicación publicada prueba acceso administrador, alta de usuario y un cambio académico, además de docente/estudiante y consulta real al Funnel. No basta con aprobar localhost.

Para revertir el código utiliza el respaldo smart-learn-backup-admin-FECHA o revierte el commit en Git. Si publicaste reglas nuevas, publica el archivo anterior en la misma base. El código revertido no borra los documentos administrativos nuevos; no elimines usuarios para revertir una actualización.

Esta entrega amplía el Sprint 7 y su matriz de aceptación. La revisión con usuarios reales y el despliegue siguen pendientes de tu comprobación.
