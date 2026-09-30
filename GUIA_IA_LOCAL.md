# Smart Learn: Ollama local mediante Tailscale Funnel

Esta entrega añade un proveedor Ollama al código base de los Sprints 5 y 6. No inicia el Sprint 7. Incluye el proyecto completo y un instalador de los archivos modificados para conservar tu repositorio actual, sus credenciales y otras dependencias.

## Resultados y límites

Tu prueba local con qwen2.5:3b tardó 19,94 s y luego 2,84 s. Es una referencia de una pregunta corta, no una garantía para el contexto completo ni para varios estudiantes. La primera consulta probablemente cargó el modelo. El gateway mantiene el modelo 30 minutos después de cada consulta. El modelo sigue pudiendo cometer errores: las props no equivalen a herencia de JavaScript. Se refuerzan las instrucciones de tutoría; los borradores y ejercicios deben revisarse.

La IA se conecta en las cuatro funciones: playground de demostración, tutor de materia, generación de práctica y asistente docente. Se conserva Auth, las autorizaciones y cuotas de Firestore smart-learn-db. El playground de demostración conserva respaldo determinista al fallar Ollama; las otras funciones devuelven un error sin inventar contenido. No hay cambio automático hacia Gemini. La etiqueta del playground pasa a IA local después de una respuesta satisfactoria.

## 1. Instalar la actualización en Windows

Extrae el ZIP en una carpeta separada, por ejemplo C:\workspace\smart-learn-ollama. La raíz extraída contiene package.json y local-ai.

Antes de aplicar, comprueba tus cambios con git status y conserva cualquier edición propia de los archivos afectados. El instalador respalda los archivos que reemplaza en una carpeta hermana del proyecto y conserva package-lock.json, .env.local, las credenciales y los demás archivos.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-ollama\local-ai\install-update.ps1 -Destination C:\workspace\smart-learn
cd C:\workspace\smart-learn
node --version
npm run test:ai
npm run lint
npm run build
```

Utiliza Node.js 24. El servicio local no necesita instalar paquetes adicionales. Para una instalación nueva del proyecto completo, conserva/configura tus variables Firebase y ejecuta npm ci. No sobrescribas tu .env.local con .env.example.

## 2. Crear la clave local

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\local-ai\setup.ps1
npm run local-ai
```

La clave aleatoria queda en local-ai/.env, ignorado por Git. No la publiques ni la compartas en el chat. El proceso escucha solo en 127.0.0.1:8787. Mantén la ventana abierta. Ollama debe estar activo con qwen2.5:3b descargado.

En otra ventana:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/health
```

Debe mostrar status ok. Esto verifica que el gateway está activo, no que Ollama ya respondió.

## 3. Publicar el gateway en Tailscale

Detén con Ctrl+C el Funnel anterior del mensaje estático. En otra ventana ejecuta:

```powershell
& 'C:\Program Files\Tailscale\tailscale.exe' funnel http://127.0.0.1:8787
```

Mantén esta ventana abierta. Se espera la dirección que ya probaste:
https://desktop-2ckik7s.tail918b1e.ts.net

Abre /health desde el teléfono con datos móviles. Debe devolver status ok. Funnel es público: la autenticación de /v1/generate la implementa el gateway. No publiques directamente el puerto 11434 de Ollama.

## 4. Verificar la consulta protegida a través del túnel

Desde la raíz de tu proyecto, en una tercera ventana:

```powershell
$localSecret = ((Get-Content .\local-ai\.env | Where-Object { $_ -like 'LOCAL_AI_TOKEN=*' }) -replace '^LOCAL_AI_TOKEN=', '').Trim()
$body = @{
    model = 'qwen2.5:3b'
    systemInstruction = 'Eres un tutor universitario. Explica en español con precisión, en menos de 120 palabras. Las props no son herencia de JavaScript.'
    contents = 'Explica la diferencia entre props y estado en React.'
    maxOutputTokens = 300
} | ConvertTo-Json
Invoke-RestMethod -Uri 'https://desktop-2ckik7s.tail918b1e.ts.net/v1/generate' -Method Post -Headers @{ Authorization = "Bearer $localSecret" } -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 65
```

Espera provider ollama y text con una respuesta. Sin Authorization debe devolver 401. No pegues el valor de $localSecret en el chat. Una consulta simultánea recibe 429; una consulta agotada recibe 504; un error del modelo, respuesta vacía o truncada recibe 502. El servicio admite solo el modelo configurado y cuerpos hasta 64 KiB. No almacena los textos recibidos.

## 5. Configurar Firebase App Hosting

Una vez exitosa la prueba del túnel, crea el secreto en el mismo proyecto Firebase:

```powershell
npx firebase apphosting:secrets:set LOCAL_AI_TOKEN --project smart-savings-4be47
```

Introduce EXACTAMENTE la clave de local-ai/.env cuando el CLI solicite el valor. Puedes copiarla al portapapeles local con:

```powershell
$localSecret | Set-Clipboard
```

Si solicita conceder acceso al backend, selecciona smart-learn. Si no lo concede durante el proceso, ejecuta:

```powershell
npx firebase apphosting:secrets:grantaccess LOCAL_AI_TOKEN --backend smart-learn --location us-east4 --project smart-savings-4be47
```

apphosting.yaml configura AI_PROVIDER=ollama, la URL del túnel, OLLAMA_MODEL=qwen2.5:3b, LOCAL_AI_TIMEOUT_MS=60000 y el secreto LOCAL_AI_TOKEN solo para el servidor. Conserva en App Hosting las variables públicas de Firebase y la configuración Firebase Admin que ya funciona. Nunca uses NEXT_PUBLIC_LOCAL_AI_TOKEN.

El YAML de esta entrega deja de referenciar el secreto Gemini: no se necesita para Ollama. Si hubiera valores conflictivos en la consola de App Hosting, alinea AI_PROVIDER y LOCAL_AI_URL con el YAML antes del rollout.

Revisa y publica los cambios:

```powershell
git status
git diff
# Añade solo los archivos de esta integración; no claves ni registros.
git add src/lib/ai/generation.ts src/lib/ai/tutor-service.ts src/types/tutor.ts src/components/playground/smart-tutor-panel.tsx src/app/api/ai/course/route.ts src/app/api/ai/teacher/route.ts src/app/api/ai/practice/route.ts local-ai/server.mjs local-ai/setup.ps1 local-ai/.env.example tests/local-ai.test.mjs tests/ai-provider.test.mjs apphosting.yaml package.json .gitignore GUIA_IA_LOCAL.md
git commit -m "feat: connect academic AI to protected local Ollama"
git pull --rebase origin master
git push origin master
```

En Firebase Console > App Hosting > smart-learn revisa que el rollout nuevo finalice y sea la versión activa. Si no hay despliegue automático, crea el rollout desde la consola. No se requiere republicar reglas Firestore para este cambio.

## 6. Prueba real y disponibilidad

Abre el playground publicado, inicia sesión y pulsa Explícame. Espera IA local en la etiqueta y provider ollama en /api/ai/tutor. Si falla, revisa fallbackReason y los logs de ejecución de App Hosting.

Prueba también una materia con contenido docente publicado, generación de un ejercicio y un borrador docente. Las respuestas JSON de práctica siguen validadas por el esquema existente antes de guardar. Un JSON inválido produce error, no un ejercicio incompleto.

Mantén PC, Ollama, gateway y Funnel activos. Si cierras la ventana del gateway o de Funnel, o la PC entra en suspensión, Firebase pierde acceso. Esta entrega usa procesos en primer plano para comprobar el funcionamiento; el arranque automático se puede configurar después de validar la integración completa. La duración real desde Firebase puede superar la prueba local. Si falla la URL, revisa tailscale funnel status.

Para probar toda la web local conservando Firebase, añade/actualiza en .env.local AI_PROVIDER=ollama, LOCAL_AI_URL=http://127.0.0.1:8787, LOCAL_AI_TOKEN (la misma clave) y OLLAMA_MODEL=qwen2.5:3b. Reinicia npm run dev. Eso evita el túnel para consultas originadas por la web local.

## Validación de esta entrega

Pruebas automatizadas usan Ollama simulado: validan autenticación, límite de cuerpo, modelo permitido, formato JSON, concurrencia, timeout, fallos y selección exclusiva del proveedor local. La inferencia real se verificó en tu PC con la prueba previa, pero falta la validación de extremo a extremo con la nueva versión desplegada. Las reglas Firestore no cambian y mantienen las pruebas anteriores.
