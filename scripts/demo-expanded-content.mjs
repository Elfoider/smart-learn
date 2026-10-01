// Ampliación de contenido propio para demostración académica.
export const expandedLessons = {
  "web": [
    {
      "unit": "Unidad 3 · Estructura y diseño",
      "title": "HTML semántico y accesibilidad",
      "objective": "Organizar una página que pueda recorrerse con teclado y lectores de pantalla.",
      "concept": "HTML describe la estructura y significado del contenido. main identifica el contenido principal, nav agrupa navegación y button representa una acción. Un enlace navega a un destino. Usar un div con un clic no aporta automáticamente el comportamiento de teclado de un botón. Los encabezados deben formar una jerarquía comprensible.\n\nCada control necesita un nombre accesible. Un label asociado a un input comunica su propósito; un placeholder desaparece al escribir y no sustituye la etiqueta. Una imagen informativa necesita un texto alternativo que describa su función; una imagen decorativa puede usar alt vacío. El foco visible permite saber dónde está el usuario.",
      "example": "Ejemplo: <label for=\"correo\">Correo</label><input id=\"correo\" type=\"email\" required><button type=\"submit\">Enviar</button>. La etiqueta y el control comparten el identificador. Tab recorre los controles y Enter puede activar el botón.",
      "activity": "Construye la estructura de una página de inscripción. Incluye navegación, título, formulario y mensajes de error. Recorre la página usando solo Tab y explica tres mejoras de accesibilidad."
    },
    {
      "unit": "Unidad 3 · Estructura y diseño",
      "title": "CSS, modelo de caja y diseño adaptable",
      "objective": "Diseñar una interfaz legible en móvil y escritorio.",
      "concept": "El modelo de caja comprende contenido, padding, borde y margen. Con box-sizing: border-box, el ancho declarado incluye padding y borde. Flexbox organiza elementos principalmente en una dimensión; Grid permite distribuir filas y columnas. El diseño adaptable cambia su distribución según el espacio disponible.\n\nUn enfoque mobile first comienza con una estructura sencilla y añade columnas cuando hay espacio. Las medidas máximas, el ajuste de texto y los tamaños relativos ayudan a evitar desplazamiento horizontal. Una media query aplica reglas según condiciones de la ventana; no identifica de forma fiable el dispositivo físico.",
      "example": "Ejemplo: .lista { display: grid; gap: 1rem; grid-template-columns: 1fr; } @media (min-width: 48rem) { .lista { grid-template-columns: repeat(3, 1fr); } }. Las tarjetas ocupan una columna en ventanas estrechas y tres al disponer de suficiente ancho.",
      "activity": "Diseña tres tarjetas de materias. Prueba ventanas de 360 y 1024 píxeles. Explica qué ocurre si el título es largo y cómo evitar que el contenido desborde."
    },
    {
      "unit": "Unidad 4 · Datos y comunicación",
      "title": "Promesas, async y manejo de errores",
      "objective": "Representar carga, éxito y fallo de una petición.",
      "concept": "Una promesa representa un resultado futuro y puede resolverse o rechazarse. async permite declarar una función que devuelve una promesa; await espera su resultado dentro de esa función sin bloquear todo el navegador. try/catch permite tratar errores rechazados.\n\nfetch no rechaza su promesa por todos los errores HTTP: un 404 o 500 normalmente produce una respuesta que debe revisarse mediante response.ok. El estado de carga debe restaurarse tanto en éxito como en error, por ejemplo en finally. Una consulta lenta necesita una interfaz clara y evitar envíos duplicados.",
      "example": "Ejemplo: try { const r = await fetch(\"/api/materias\"); if (!r.ok) throw new Error(\"No se pudieron cargar\"); const datos = await r.json(); } catch (error) { mostrarError(); } finally { terminarCarga(); }. El error se comunica sin presentar datos incompletos como si fueran válidos.",
      "activity": "Describe una pantalla con estados de carga, lista vacía, datos y error. Simula un 500 y explica por qué response.json() por sí solo no confirma que la petición salió bien."
    },
    {
      "unit": "Unidad 4 · Datos y comunicación",
      "title": "APIs, JSON y validación",
      "objective": "Distinguir el transporte de datos de su validación.",
      "concept": "Una API establece un contrato entre cliente y servidor. HTTP utiliza métodos, rutas, encabezados y códigos de respuesta. GET consulta información; POST suele crear recursos o ejecutar acciones. JSON representa objetos, arreglos, cadenas, números, booleanos y null, pero no funciones ni fechas como tipo nativo.\n\nEl servidor debe validar la estructura, tipos y límites de cualquier entrada. La validación del navegador mejora la experiencia, pero puede omitirse con una petición directa. Un código 401 señala ausencia de autenticación válida y un 403 falta de permiso. Los secretos deben permanecer en el servidor.",
      "example": "Ejemplo: POST /api/inscripciones con {\"materiaId\":\"web\",\"estudianteId\":\"e1\"}. El servidor verifica que el usuario pueda inscribir a ese estudiante y que la materia exista antes de escribir. Recibir un objeto JSON no demuestra que la operación esté autorizada.",
      "activity": "Diseña el contrato de una API para crear una nota de estudio: entrada, salida, límites y tres casos de error. Explica por qué no debes poner un token privado en código del navegador."
    },
    {
      "unit": "Unidad 5 · React aplicado",
      "title": "Listas, claves y actualización inmutable",
      "objective": "Actualizar listas sin perder la identidad de sus elementos.",
      "concept": "React utiliza las claves para identificar elementos hermanos de una lista entre renderizados. Una clave estable, como el identificador de un producto, ayuda a conservar la identidad. El índice puede provocar asociaciones incorrectas cuando se reordena, inserta o elimina contenido. Las claves no necesitan ser únicas en toda la aplicación, sino entre hermanos.\n\nLos arreglos guardados en estado se actualizan creando nuevos arreglos. map reemplaza un elemento y filter elimina elementos por condición. Cuando el próximo estado depende del anterior, la forma funcional del actualizador evita depender de un valor capturado desactualizado.",
      "example": "Ejemplo: setTareas(prev => prev.map(t => t.id === id ? {...t, completada: true} : t)); y tareas.map(t => <li key={t.id}>{t.nombre}</li>). Se conserva el identificador y se produce un nuevo arreglo sin modificar directamente el anterior.",
      "activity": "Diseña una lista de tareas que permita completar y eliminar elementos. Explica qué error podría ocurrir si usas el índice como clave y después ordenas la lista."
    },
    {
      "unit": "Unidad 5 · React aplicado",
      "title": "Efectos y sincronización externa",
      "objective": "Reconocer cuándo se necesita un efecto y su limpieza.",
      "concept": "Un efecto sincroniza un componente con un sistema externo, como un temporizador, una suscripción o una conexión. Un cálculo derivado de props o estado normalmente puede realizarse durante el renderizado sin un efecto adicional. Las dependencias indican qué valores reactivos utiliza la sincronización.\n\nLa limpieza detiene el trabajo anterior antes de una nueva sincronización o al desmontar el componente. Una petición puede terminar después de cambiar de materia; hay que cancelar o ignorar su respuesta para no mostrar datos de la materia anterior. Omitir dependencias para silenciar avisos puede mantener valores desactualizados.",
      "example": "Ejemplo: useEffect(() => { const id = setInterval(actualizarHora, 1000); return () => clearInterval(id); }, []); instala un temporizador y lo elimina al desmontar. La función de limpieza impide acumular temporizadores al volver a montar.",
      "activity": "Clasifica estos casos: calcular el total de precios, escuchar cambios de una base de datos y enviar un formulario al pulsar un botón. Justifica cuáles requieren un efecto y cuáles pertenecen a un cálculo o evento."
    },
    {
      "unit": "Unidad 6 · Calidad y proyecto",
      "title": "Autenticación, autorización y seguridad",
      "objective": "Separar identidad de permisos en una aplicación web.",
      "concept": "La autenticación determina quién es el usuario; la autorización determina qué operaciones puede realizar. Un botón oculto no constituye una barrera de seguridad: el servidor o las reglas deben verificar permisos. Un estudiante autenticado no debe poder cambiar su propio rol para convertirse en docente.\n\nLos tokens se verifican antes de usar la identidad. Las consultas deben limitarse a los recursos permitidos y las escrituras validar propiedad, relaciones y campos. La información sensible no debe aparecer en registros de depuración ni en repositorios. La interfaz debe explicar los errores sin mostrar credenciales o detalles internos.",
      "example": "Ejemplo: para leer una clase, el sistema verifica una sesión válida, un perfil activo, una matrícula activa y la publicación para la sección correspondiente. Conocer el identificador de otra materia no concede acceso.",
      "activity": "Elabora una matriz con estudiante y docente frente a leer clases, editar clases y publicar notas. Propón pruebas permitidas y denegadas para cada rol."
    },
    {
      "unit": "Unidad 6 · Calidad y proyecto",
      "title": "Proyecto integrador: catálogo de materias",
      "objective": "Planificar y verificar una interfaz completa de consulta.",
      "concept": "Un proyecto integrador reúne estructura, diseño, estado, consultas y validación. Antes de programar, se definen historias de uso y criterios de aceptación observables. Cada componente debe tener una responsabilidad clara y los datos conservar identificadores estables.\n\nLas pruebas deben cubrir tanto el recorrido exitoso como resultados vacíos, entradas incorrectas y fallos de conexión. La revisión de accesibilidad incluye etiquetas y teclado. La entrega explica cómo ejecutar el proyecto y reconoce sus limitaciones, en lugar de presentar funcionalidades simuladas como completas.",
      "example": "Ejemplo: criterio de aceptación: al buscar \"datos\", se muestran solo materias coincidentes; si no hay coincidencias, aparece un mensaje; si la API falla, se ofrece reintentar. Cada condición puede comprobarse con datos preparados.",
      "activity": "Construye un catálogo con búsqueda, tarjetas, detalle y formulario de inscripción simulado. Entrega una lista de cinco pruebas, capturas en móvil y escritorio y una explicación de la diferencia entre simulación y persistencia real."
    }
  ],
  "db": [
    {
      "unit": "Unidad 3 · Diseño relacional",
      "title": "Normalización y dependencias",
      "objective": "Reducir redundancia manteniendo relaciones claras.",
      "concept": "Normalizar organiza las tablas según dependencias entre atributos. La primera forma normal exige valores atómicos respecto al uso previsto y evita grupos repetidos de columnas. La segunda elimina dependencias parciales de una clave compuesta. La tercera evita dependencias transitivas de atributos no clave respecto a la clave.\n\nRepetir el nombre de una materia en cada matrícula puede producir inconsistencias al renombrarla. Separar Materia y referenciar su identificador permite actualizar una sola fila. La normalización no elimina todas las repeticiones posibles: preserva información y dependencias importantes del dominio.",
      "example": "Ejemplo: Matricula(estudiante_id, materia_id, estudiante_nombre, materia_nombre). Los nombres dependen de sus respectivos identificadores, no de toda la pareja. Se separan Estudiante, Materia y Matricula para evitar duplicar esos nombres.",
      "activity": "Normaliza una tabla de pedidos con cliente, dirección, producto y precio. Identifica una anomalía de inserción, actualización y eliminación. Explica qué información pertenece al pedido histórico."
    },
    {
      "unit": "Unidad 3 · Diseño relacional",
      "title": "Restricciones y tipos de datos",
      "objective": "Definir reglas que impidan registros incoherentes.",
      "concept": "Los tipos delimitan qué valores puede representar una columna. NOT NULL exige presencia, UNIQUE limita duplicados, CHECK valida una condición y las claves foráneas controlan referencias. Las reglas de negocio también pueden requerir lógica transaccional o validación adicional.\n\nUn valor NULL indica ausencia o desconocimiento; no equivale a cero ni a una cadena vacía. Se consulta con IS NULL en lugar de = NULL. Para cantidades monetarias, un tipo decimal exacto suele ser apropiado para evitar errores de representación binaria de coma flotante.",
      "example": "Ejemplo: precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0), codigo VARCHAR(30) UNIQUE. Un producto no puede tener precio negativo y su código no se repite. WHERE fecha_entrega IS NULL encuentra entregas pendientes.",
      "activity": "Diseña cinco columnas para una evaluación: identificador, título, fecha, puntaje máximo y estado. Propón sus tipos y restricciones y explica qué campos podrían aceptar NULL."
    },
    {
      "unit": "Unidad 4 · Consultas aplicadas",
      "title": "Agregación, GROUP BY y HAVING",
      "objective": "Resumir registros y filtrar grupos correctamente.",
      "concept": "COUNT, SUM, AVG, MIN y MAX resumen valores. COUNT(*) cuenta filas; COUNT(columna) cuenta valores no nulos de esa columna. GROUP BY reúne filas con valores comunes. WHERE filtra filas antes de la agrupación y HAVING filtra los grupos resultantes.\n\nUna consulta agrupada debe expresar claramente las columnas agregadas y las de agrupación. Un JOIN con varias coincidencias puede multiplicar filas y alterar totales si no se considera la cardinalidad. Revisar primero el conjunto que se agrega evita presentar cifras duplicadas.",
      "example": "Ejemplo: SELECT materia_id, COUNT(*) AS inscritos FROM matriculas WHERE estado = 'activo' GROUP BY materia_id HAVING COUNT(*) >= 5; muestra materias con al menos cinco matrículas activas.",
      "activity": "Escribe una consulta que calcule el promedio por materia y conserve promedios mayores a 15. Explica cómo cambian los resultados si filtras primero notas inferiores a 10."
    },
    {
      "unit": "Unidad 4 · Consultas aplicadas",
      "title": "Subconsultas y lectura de resultados",
      "objective": "Descomponer una consulta sin confundir filas y valores.",
      "concept": "Una subconsulta es una consulta dentro de otra. Puede producir un valor escalar, una lista o un conjunto de filas. IN permite comparar con un conjunto de valores y EXISTS comprueba si una subconsulta produce alguna fila. Una subconsulta correlacionada referencia la fila de la consulta externa.\n\nLa elección depende de la pregunta y de la estructura de los datos. NOT IN puede tener resultados inesperados cuando el conjunto contiene NULL debido a la lógica de tres valores de SQL. La claridad y la verificación con casos pequeños son esenciales antes de optimizar.",
      "example": "Ejemplo: SELECT e.nombre FROM estudiantes e WHERE EXISTS (SELECT 1 FROM matriculas m WHERE m.estudiante_id = e.id AND m.estado = 'activo'); obtiene estudiantes con alguna matrícula activa sin duplicar sus nombres por múltiples matrículas.",
      "activity": "Obtén productos con precio superior al promedio. Después busca estudiantes sin matrículas usando NOT EXISTS. Prueba un estudiante con dos matrículas y otro sin ninguna."
    },
    {
      "unit": "Unidad 5 · Rendimiento y consistencia",
      "title": "Índices y planes de consulta",
      "objective": "Evaluar el beneficio y costo de un índice.",
      "concept": "Un índice es una estructura auxiliar que puede acelerar búsquedas y ordenamientos. Ocupa espacio y debe actualizarse al insertar, modificar o eliminar datos. No todos los índices benefician todas las consultas; la selectividad, el tamaño de la tabla y la forma del filtro influyen.\n\nEl plan de ejecución muestra cómo el motor pretende resolver una consulta. Un índice compuesto organiza varias columnas y su orden importa. Aplicar una función a la columna filtrada puede limitar el uso de un índice ordinario. Medir antes y después evita suponer mejoras por el simple hecho de crear índices.",
      "example": "Ejemplo: un índice sobre matriculas(estudiante_id, estado) puede ayudar a consultar matrículas de un estudiante por estado. No implica que una búsqueda solo por estado aproveche del mismo modo ese índice.",
      "activity": "Elige dos consultas frecuentes de un portal académico y propón índices. Explica el costo en escrituras y cómo compararías sus planes y tiempos sin modificar los datos de producción."
    },
    {
      "unit": "Unidad 5 · Rendimiento y consistencia",
      "title": "ACID y concurrencia",
      "objective": "Reconocer inconsistencias cuando varias operaciones compiten.",
      "concept": "ACID resume atomicidad, consistencia, aislamiento y durabilidad. Atomicidad aplica todas las operaciones o ninguna. Consistencia conserva las reglas definidas. Aislamiento controla cómo interactúan transacciones concurrentes. Durabilidad mantiene los cambios confirmados ante fallos según las garantías del sistema.\n\nDos procesos que leen el mismo cupo y luego escriben por separado pueden vender o asignar el último lugar dos veces. Una operación transaccional debe verificar y modificar de manera coordinada. Los niveles de aislamiento y el control de concurrencia tienen costos y garantías diferentes.",
      "example": "Ejemplo: con un cupo restante, dos inscripciones leen 1 simultáneamente. Si ambas aceptan y guardan 0, se inscriben dos estudiantes. Una transacción con verificación del cupo evita confirmar ambas como si fueran independientes.",
      "activity": "Describe paso a paso una transferencia entre dos cuentas. Identifica qué ocurre ante un fallo entre el débito y el crédito y diseña una prueba con dos inscripciones simultáneas."
    },
    {
      "unit": "Unidad 6 · Documentos y proyecto",
      "title": "Bases documentales y Firestore",
      "objective": "Modelar documentos según los recorridos de lectura.",
      "concept": "Una base documental organiza información en documentos y colecciones. Firestore permite documentos con campos y subcolecciones. Las relaciones pueden representarse mediante identificadores y, cuando conviene, datos duplicados controlados. No ofrece JOIN SQL directo; el diseño debe considerar las consultas de la aplicación.\n\nDuplicar un nombre facilita ciertas lecturas, pero exige definir cómo actualizarlo cuando cambia. La base nombrada se selecciona explícitamente en el cliente y en el servidor. Las reglas del cliente controlan acceso; el SDK Admin utiliza permisos del servicio y exige que las rutas del servidor validen al usuario.",
      "example": "Ejemplo: courses/{id}, enrollments/{curso--estudiante} y users/{uid}/courseProgress/{curso}. La matrícula relaciona identidades y el progreso se guarda por estudiante. En Smart Learn se utiliza la base smart-learn-db, no la base predeterminada.",
      "activity": "Diseña colecciones para materias, clases y matrícula. Enumera tres consultas y explica qué datos duplicarías, cómo los mantendrías consistentes y quién puede escribirlos."
    },
    {
      "unit": "Unidad 6 · Documentos y proyecto",
      "title": "Proyecto integrador: gestión académica",
      "objective": "Justificar un modelo y comprobar su integridad.",
      "concept": "El diseño comienza con requisitos: qué se registra, quién lo consulta y qué relaciones deben mantenerse. Un modelo académico separa estudiantes, materias, secciones, matrículas y evaluaciones. Los identificadores permiten referenciar entidades sin depender de nombres que pueden cambiar.\n\nLa entrega incluye un diccionario de datos, ejemplos válidos y casos que deben rechazarse. Las pruebas de integridad y autorización tienen propósitos distintos: un registro puede ser estructuralmente válido y aun así estar prohibido para un usuario. Las copias de seguridad y el procedimiento de recuperación forman parte de la operación.",
      "example": "Ejemplo: un estudiante solo consulta sus calificaciones; un docente publica notas de sus secciones. La matrícula activa establece la relación académica, mientras que el permiso determina qué acciones se permiten.",
      "activity": "Entrega un diagrama, el diccionario de cinco entidades y cinco consultas o recorridos de lectura. Prueba una referencia inexistente, una matrícula duplicada y un intento de acceso a notas de otro estudiante."
    }
  ],
  "ia": [
    {
      "unit": "Unidad 3 · Preparación de datos",
      "title": "Calidad, limpieza y datos ausentes",
      "objective": "Detectar problemas antes de entrenar un modelo.",
      "concept": "Los datos pueden incluir duplicados, etiquetas incorrectas, valores fuera de rango y registros incompletos. Limpiar consiste en identificar estos problemas y elegir una respuesta justificada. Eliminar cualquier fila incompleta puede descartar grupos de forma desigual; completar valores sin criterio también introduce sesgos.\n\nLas transformaciones que aprenden parámetros, como una media para imputar, se ajustan con entrenamiento y se aplican después a validación y prueba. Usar toda la información antes de separar conjuntos puede filtrar conocimiento de los datos de prueba. Documentar cambios permite reproducir el proceso.",
      "example": "Ejemplo: para completar edades ausentes con la mediana, se calcula la mediana del conjunto de entrenamiento. Ese mismo valor se usa en los otros conjuntos. No se calcula una mediana nueva usando todas las filas antes de evaluar.",
      "activity": "Revisa una tabla con edades negativas, nombres repetidos y notas ausentes. Propón una acción por problema y explica qué información conservarías para auditar los cambios."
    },
    {
      "unit": "Unidad 3 · Preparación de datos",
      "title": "Características y fuga de información",
      "objective": "Elegir entradas disponibles en el momento de predecir.",
      "concept": "Una característica es una entrada utilizada por el modelo. Debe tener relación con la tarea y estar disponible cuando se realice la predicción. La codificación convierte categorías en representaciones utilizables; la escala puede afectar ciertos algoritmos, aunque no todos requieren normalización.\n\nLa fuga de información ocurre cuando el entrenamiento utiliza datos que revelarían indebidamente el resultado o que no existirían al predecir. Separar registros aleatoriamente no siempre basta: ejemplos de la misma persona o datos futuros pueden producir una evaluación demasiado optimista.",
      "example": "Ejemplo: predecir abandono al inicio del semestre usando el estado final de matrícula revela el resultado. En cambio, asistencia de semanas anteriores puede ser una entrada válida si la predicción se hace después de esas semanas.",
      "activity": "Selecciona entradas para predecir necesidad de apoyo académico en la semana 3. Descarta nota final y estado de egreso. Explica cómo separarías datos para evitar que el mismo estudiante aparezca en entrenamiento y prueba."
    },
    {
      "unit": "Unidad 4 · Evaluación aplicada",
      "title": "Matriz de confusión, precisión y sensibilidad",
      "objective": "Interpretar distintos tipos de error de clasificación.",
      "concept": "La matriz de confusión compara etiquetas reales y predichas. Un verdadero positivo es un caso positivo detectado; un falso positivo es un caso negativo marcado como positivo; un falso negativo es un positivo no detectado. La precisión mide qué fracción de las predicciones positivas fue correcta y la sensibilidad qué fracción de los positivos reales se detectó.\n\nLas métricas responden a preguntas diferentes. En detección de riesgo puede ser importante reducir falsos negativos, pero aumentar alertas incorrectas tiene costos. Si el denominador es cero, la métrica requiere una convención explícita en lugar de afirmar una división válida.",
      "example": "Ejemplo: TP=8, FP=2, FN=4, TN=86. Precisión=8/(8+2)=80%; sensibilidad=8/(8+4), aproximadamente 66,7%; exactitud=(8+86)/100=94%. Una alta exactitud no elimina los cuatro positivos omitidos.",
      "activity": "Calcula las métricas para TP=6, FP=3, FN=2 y TN=9. Explica qué error sería más costoso en un detector de spam y en una alerta de apoyo estudiantil."
    },
    {
      "unit": "Unidad 4 · Evaluación aplicada",
      "title": "Validación, umbrales y comparación justa",
      "objective": "Comparar modelos sin reutilizar la prueba para ajustar decisiones.",
      "concept": "Entrenamiento ajusta parámetros, validación ayuda a elegir decisiones y prueba estima el desempeño final. La validación cruzada repite evaluaciones con distintas particiones, pero debe respetar grupos o tiempo cuando corresponde. Utilizar repetidamente la prueba para elegir el modelo convierte ese conjunto en parte del ajuste.\n\nUn clasificador puede producir puntuaciones que se comparan con un umbral. Cambiarlo altera la relación entre falsos positivos y falsos negativos. Para comparar modelos deben mantenerse datos y criterios coherentes, medir el tiempo de respuesta y documentar la variación de resultados.",
      "example": "Ejemplo: bajar el umbral de una alerta de 0,7 a 0,4 puede detectar más casos positivos y también elevar falsas alarmas. Se elige según los costos de la tarea usando validación y luego se evalúa la decisión fijada en prueba.",
      "activity": "Compara dos modelos con una tabla de precisión, sensibilidad y latencia. Elige uno para un tutor interactivo y otro para revisión de riesgo; justifica los criterios sin afirmar que la mayor exactitud siempre gana."
    },
    {
      "unit": "Unidad 5 · Asistentes generativos",
      "title": "Prompts, contexto y formatos estructurados",
      "objective": "Solicitar respuestas claras y verificables.",
      "concept": "Un prompt útil define tarea, contexto, restricciones y formato. El contexto aporta contenido relevante, pero el modelo puede interpretar incorrectamente instrucciones o generar afirmaciones no respaldadas. Un formato JSON facilita procesamiento automático solo si se valida su sintaxis y su estructura.\n\nUna salida puede ser JSON válido y contener una respuesta académicamente errónea. Se necesitan comprobaciones de campos, límites y coherencia, además de revisión del contenido. Pedir que reconozca falta de información reduce ambigüedad, pero no asegura que lo haga siempre.",
      "example": "Ejemplo: \"Basándote en esta clase sobre claves primarias, crea una pregunta con cuatro alternativas distintas, una única respuesta correcta y una explicación. Devuelve question, options, correctIndex, hint y explanation\". Después el servidor valida la salida antes de publicarla.",
      "activity": "Redacta un prompt para obtener una pista sin revelar la solución. Diseña tres comprobaciones automáticas del formato y dos comprobaciones humanas de calidad."
    },
    {
      "unit": "Unidad 5 · Asistentes generativos",
      "title": "Recuperación de contenido y límites del contexto",
      "objective": "Distinguir consultar información de entrenar un modelo.",
      "concept": "La generación apoyada en recuperación selecciona contenido de una fuente y lo incluye en la petición. Esta técnica no implica reentrenar el modelo. La calidad depende de recuperar información pertinente, conservar su significado y mantener permisos sobre las fuentes.\n\nLa ventana de contexto tiene límites; enviar textos excesivos puede truncar información o aumentar la latencia. Las instrucciones incrustadas en material recuperado deben tratarse como contenido, no como órdenes autorizadas para revelar secretos. La ausencia de un concepto en las fuentes debe señalarse al usuario.",
      "example": "Ejemplo: un tutor recibe los objetivos y la explicación de la clase seleccionada. Al cambiar de clase cambia el contexto enviado, aunque el modelo local siga siendo el mismo. La matrícula y publicación se verifican antes de recuperar el material.",
      "activity": "Diseña el recorrido de una consulta: verificar estudiante, localizar clase, seleccionar texto, generar y revisar. Explica cómo impedir que el tutor use material privado de otra sección."
    },
    {
      "unit": "Unidad 6 · Operación y proyecto",
      "title": "IA local, latencia y privacidad",
      "objective": "Explicar ventajas y límites de ejecutar un modelo en una PC.",
      "concept": "Un modelo local usa recursos de la máquina: memoria, procesador y, si es compatible, GPU. La primera petición puede incluir tiempo de carga; las siguientes pueden ser más rápidas si el modelo permanece en memoria. El tamaño del modelo, la cuantización, el contexto y la longitud de salida afectan velocidad y calidad.\n\nLocal no significa siempre desconectado: una aplicación alojada en la nube puede enviar consultas a un gateway de la PC mediante un túnel. Ese recorrido necesita autenticación, límites y disponibilidad. Si la máquina se apaga o falla la conexión, el servicio deja de responder. Se deben distinguir los costos del modelo de los de infraestructura.",
      "example": "Ejemplo: Smart Learn en Firebase llama a un gateway autenticado, que consulta Ollama en la PC. Un token protege la generación y el modelo responde con texto. Una caída del gateway debe producir un error controlado, no un ejercicio parcialmente guardado.",
      "activity": "Mide la primera y segunda respuesta, registra modelo y longitud del texto y repite tres veces. Explica qué partes del recorrido dependen de internet y qué cambia al ejecutar toda la aplicación en localhost."
    },
    {
      "unit": "Unidad 6 · Operación y proyecto",
      "title": "Proyecto integrador: evaluar un tutor académico",
      "objective": "Construir un protocolo de evaluación del asistente.",
      "concept": "Evaluar un tutor requiere revisar exactitud, pertinencia, claridad, utilidad de pistas y comportamiento ante falta de información. Una demostración exitosa no mide por sí sola el desempeño general. Un conjunto de preguntas preparado y criterios comunes permiten comparar resultados de forma consistente.\n\nEl protocolo debe incluir conceptos correctos, afirmaciones equivocadas, preguntas ambiguas y consultas fuera del tema. Se registra respuesta, tiempo y evaluación humana. La privacidad exige usar datos ficticios o autorizados. Los errores se conservan como evidencia para mejorar el sistema.",
      "example": "Ejemplo: una rúbrica puntúa exactitud, contexto y claridad de 0 a 2 cada uno. Dos evaluadores revisan las mismas respuestas y discuten diferencias. Una respuesta convincente pero incorrecta recibe una puntuación baja en exactitud.",
      "activity": "Elabora diez preguntas distribuidas entre tres materias. Registra latencia y califica cada respuesta con la rúbrica. Incluye una prueba de caída del gateway y presenta dos fortalezas, dos fallos y propuestas de mejora."
    }
  ]
};
