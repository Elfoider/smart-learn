# Guía de implementación · Smart Learn (hasta Sprint 6)

## 1. Respaldar y reemplazar el proyecto en Windows

Cierra el servidor de desarrollo. Conserva una copia completa de tu proyecto actual, incluido `.git` y `.env.local`. Descomprime `smart-learn-sprints-5-6.zip` en una carpeta nueva. El ZIP tiene la carpeta `smart-learn/` como raíz y no contiene credenciales, `node_modules` ni `.next`.

Si deseas mantener el historial de tu repositorio Git, copia la carpeta `.git` de tu respaldo a la nueva carpeta `smart-learn/`. Copia también **tu propio** `.env.local` desde el respaldo y revisa sus variables antes de continuar. Después puedes renombrar el proyecto antiguo a `smart-learn-respaldo` y poner la nueva carpeta en su lugar. No mezcles directorios `node_modules` ni `.next` del respaldo.

Compara `git status` y revisa tus cambios locales antes de hacer commit; el ZIP se construyó desde la versión que enviaste, no desde cambios posteriores de tu computadora. Las colecciones existentes no se borran al reemplazar el código.

## 2. Variables y Firebase

En la raíz del proyecto, completa `.env.local` tomando `.env.example` como plantilla. Obtén `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` y `NEXT_PUBLIC_FIREBASE_APP_ID` de la configuración de tu app web en Firebase. En el servidor local usa `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` de la cuenta de servicio; las secuencias `\n` deben representar los saltos de línea de la clave. Usa `GEMINI_API_KEY` solo en el servidor. `GEMINI_MODEL` puede ser `gemini-3.5-flash-lite`, `AI_DAILY_LIMIT=50` y `AI_FALLBACK_ENABLED=true` conserva el tutor de demostración aunque Gemini falle.

El SDK web y Admin seleccionan explícitamente la base **smart-learn-db**. Verifica que exista en el mismo proyecto de Firebase; no se crea desde el código. Firebase Authentication debe tener habilitados los métodos de acceso que utilices y el dominio de App Hosting autorizado. Las cuentas nuevas se registran como estudiantes; la promoción a docente o administrador requiere editar de forma segura el documento `users/{uid}` desde la consola o un proceso administrativo de confianza. El perfil debe tener `role` (`teacher` o `student`) y `status: active`.

En Firebase App Hosting configura las variables `NEXT_PUBLIC_*` en **Backend → Settings → Environment**, disponibles durante compilación y ejecución. Configura `FIREBASE_PROJECT_ID`, `GEMINI_MODEL`, `AI_DAILY_LIMIT` y `AI_FALLBACK_ENABLED` allí. El archivo `apphosting.yaml` de este paquete ya enlaza `GEMINI_API_KEY` con el secreto homónimo durante la ejecución. Desde la raíz del proyecto crea el secreto con `npx firebase apphosting:secrets:set GEMINI_API_KEY --project smart-savings-4be47`, pega el valor cuando lo solicite la CLI y autoriza el acceso del backend `smart-learn` si aparece la opción. No guardes la clave en Git ni en el chat. El Admin SDK usa las credenciales por defecto de App Hosting: no copies la clave privada al repositorio ni hace falta subir `FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL` a ese backend.

## 3. Instalar y verificar

Desde la carpeta nueva:

```powershell
npm ci
npm run lint
npm run build
npm run dev
```

Abre `http://localhost:3000`. Con una cuenta docente crea una materia, una sección e inscribe una cuenta estudiantil activa. Publica una planificación visible, un material por enlace y una clase. Entra como estudiante y comprueba **Mis materias → Entrar al salón**; pregunta al tutor sobre el contenido publicado y genera un ejercicio en **Playground → Practicar mi materia**. Registra asistencia y publica una nota; comprueba la vista de progreso y la exportación CSV docente. El playground y examen heredados son ejemplos independientes de las materias inscritas.

## 4. Reglas de Firestore y pruebas locales

Instala Firebase CLI si hace falta: `npm install -g firebase-tools`; inicia sesión con `firebase login`. Instala Java **21 o posterior** para el emulador. Para verificar las reglas sin tocar datos reales:

```powershell
npx firebase emulators:exec --project demo-smart-learn --only firestore "npm run test:rules"
```

Las pruebas comprueban lectura por inscripción y sección, bloqueo a estudiantes ajenos, bloqueo de cambios de roles/notas y permisos de publicación docente. El archivo `firebase.json` apunta a la base nombrada; las pruebas cargan esas mismas reglas en una instancia aislada del emulador. Si tu equipo usa otro proceso en el puerto 8080, libéralo o cambia `emulators.firestore.port` y el puerto del archivo de prueba.

Luego publica **solo** la configuración de Firestore de la base nombrada:

```powershell
npx firebase deploy --only firestore:smart-learn-db --project TU_PROJECT_ID
```

Confirma en Firebase Console que se actualizaron las reglas de `smart-learn-db`, no las de `(default)`. No uses `firebase deploy --only firestore` si administras otras bases mediante configuraciones distintas. El SDK Admin del servidor ignora las reglas, por eso los endpoints vuelven a verificar rol, estado e inscripción.

## 5. Desplegar Firebase App Hosting

Conecta el repositorio de GitHub a tu backend existente de App Hosting (o créalo si no existe). Conserva el directorio raíz de la app como raíz del repositorio, configura las variables/secreto anteriores y selecciona la rama de despliegue. Comprueba el resultado de `npm run build` en los logs del rollout. Si tu backend está configurado para despliegue desde fuente local, inicializa App Hosting para ese backend y utiliza `npx firebase deploy --only apphosting:ID_DEL_BACKEND --project TU_PROJECT_ID`. Alternativamente haz commit/push a la rama conectada y ejecuta un rollout desde la consola.

Tras el despliegue, añade el dominio del backend en Firebase Authentication → Settings → Authorized domains. Comprueba login docente y estudiante, reglas efectivas en `smart-learn-db`, la publicación de recursos por sección, el tutor y los logs `aiLogs`. No se ha hecho un despliegue ni se han modificado datos de tu proyecto desde este paquete.

## Alcance y límites

La UI original incluye un examen gráfico y materias de muestra. Esos datos no se migran automáticamente a Firestore ni forman parte de las materias creadas por docentes. Materiales publica URL; no incorpora subida binaria. El tutor del aula real exige contenido docente publicado y clave Gemini; el tutor de demostración conserva un modo de respuesta local si está habilitado. Los reportes calculan promedios de calificaciones **publicadas** y presencia sobre registros de asistencia; no sustituyen un expediente académico institucional. Sprint 7 no se inició.
