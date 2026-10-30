# Smart Learn — UX/UI 2: acceso y aulas reales

Esta entrega continúa UX/UI 1 y reemplaza el diseño del login, Inicio y Mis materias del estudiante. El ZIP contiene el proyecto completo y un instalador que aplica solo los archivos del manifiesto. Para esta actualización usa APLICAR_UX2.ps1; las instrucciones UX1 incluidas corresponden a la entrega anterior.

## Qué cambia

- Login: se elimina el panel promocional anterior con «Próxima experiencia» y porcentaje fijo. Se reemplaza por información sobre los tres roles y orientación para acceder. El logo institucional permanece en el formulario.
- Inicio: saludo con el nombre del usuario y tarjetas de las materias realmente inscritas. Se retira el recorrido estático de demostración del inicio y de Mis materias. No se borran contenidos de Firebase ni los módulos de demostración que aún existen en otras pantallas.
- Tarjetas: azul, índigo y cian; efectos al pasar el cursor; botón visual de entrada al aula; estados de carga, error y sin inscripción. Ninguna tarjeta inventa un avance, nota, docente o número de clases.
- Búsqueda: filtra las materias inscritas por nombre, código o descripción; admite acentos y ofrece limpiar la búsqueda.
- Navegación del estudiante: se elimina la barra horizontal superior en todo su portal. Buscador de secciones, avisos, ayuda, tema y concentración pasan al lateral. En móvil se abren desde el botón de menú. Al activar concentración, el menú móvil se cierra y queda un botón «Volver».
- Docente y administrador conservan la distribución de UX1. Los próximos cambios del aula, Playground y experiencia docente siguen en las fases acordadas; este paquete resuelve los ajustes solicitados de acceso e inicio.

## Aplicar en Windows

1. Detén `npm run dev` con Ctrl+C.
2. Extrae el ZIP en `C:\workspace\smart-learn-ux2`, separado del proyecto actual.
3. Ejecuta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\workspace\smart-learn-ux2\APLICAR_UX2.ps1 -Destination C:\workspace\smart-learn
cd C:\workspace\smart-learn
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

No hacen falta nuevas dependencias, variables ni secretos. El instalador valida todas las rutas antes de copiar, usa rutas literales para `[courseId]`, crea un respaldo y conserva `.env.local`, `local-ai/.env` y el arranque local de IA. No copies el ZIP encima manualmente si deseas conservar archivos de configuración locales.

## Revisar en tu entorno

1. Abre `/login`: información real de funciones y acceso; ningún «68%» ni «Próxima experiencia».
2. Revisa claro y oscuro; en móvil se prioriza el formulario.
3. Inicia sesión como estudiante: sus materias deben coincidir con las matrículas activas. Si tiene dos matrículas activas de la misma materia, aparece una sola tarjeta.
4. Busca una materia por código o nombre con/sin acento. Prueba una búsqueda inexistente y «Ver todas mis materias».
5. Entra a un aula: debe abrir su ID real y conservar clases, materiales y permisos.
6. Prueba calendario, evaluaciones y Playground. La IA debe seguir usando tu gateway local.
7. Abre avisos y guía desde el lateral. Cambia el tema, expande/contrae el menú y activa/desactiva concentración.
8. En móvil abre el menú y prueba concentración: el menú se cierra automáticamente y «Volver» permite restaurarlo.
9. Comprueba una cuenta sin matrículas y otra con acceso suspendido según los controles existentes del sistema.
10. Comprueba los portales docente y administrador tras iniciar sesión con cada rol.

## Validación realizada

- `npm test`: 44 pruebas aprobadas (6 práctica/contenido, 8 IA, 15 integración y 15 administrador).
- ESLint sin errores ni advertencias; TypeScript y build de producción aprobados.
- Verificación visual e interacción en navegador a 1440×900 y 390×844: inicio, Mis materias, login, búsqueda, enlaces, menú, ayuda, avisos, concentración, temas y ausencia de desbordamiento horizontal.
- El navegador utiliza una sesión y respuestas de datos aisladas; ejecuta el componente real y el efecto de suscripción con un transporte simulado. No prueba las credenciales ni las lecturas de tu Firebase real. El build utiliza configuración Firebase ficticia; en tu instalación conserva la configuración actual.
- El instalador fue revisado por estructura y contenido, pero no ejecutado en Windows en este entorno.

## Publicar después de revisar

```powershell
$archivos = Get-Content -LiteralPath .\CAMBIOS_UX2.json -Raw | ConvertFrom-Json
foreach ($archivo in $archivos) { git add -- $archivo }
git diff --cached --stat
git commit -m "feat: redesign login and student classroom home"
git pull --rebase origin master
git push origin master
```

Revisa el rollout de Firebase App Hosting. Si tu backend no despliega automáticamente al actualizar master, crea el rollout desde la consola del backend conectado. Después verifica la versión publicada en una ventana privada. Esta entrega no cambia reglas, índices, apphosting.yaml ni configuración de IA; no requiere cargar nuevamente el contenido académico.
