export type LessonContentType =
  | "slides"
  | "video"
  | "document"
  | "practice";

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  contentType: LessonContentType;
  completed: boolean;
  locked?: boolean;
  description: string;
  objective: string;
  resources: string[];
  slide?: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
    number: number;
    total: number;
  };
}

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface LearningCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  teacher: string;
  teacherRole: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  estimatedTime: string;
  category: string;
  tone: "teal" | "violet" | "amber";
  units: CourseUnit[];
}

export const learningCourses: LearningCourse[] = [
  {
    id: "programacion-web",
    code: "PWA-402",
    title: "Programación Web Avanzada",
    description:
      "Construcción de aplicaciones modernas mediante componentes reactivos, arquitectura modular y buenas prácticas de interfaz.",
    teacher: "Dra. Laura Mendoza",
    teacherRole: "Docente de Ingeniería Informática",
    progress: 72,
    completedLessons: 8,
    totalLessons: 12,
    estimatedTime: "8 semanas",
    category: "Ingeniería de software",
    tone: "teal",
    units: [
      {
        id: "unidad-1",
        title: "Unidad 1 — Arquitectura moderna",
        description:
          "Fundamentos estructurales para aplicaciones web escalables.",
        lessons: [
          {
            id: "arquitectura-componentes",
            title: "Arquitectura basada en componentes",
            duration: "18 min",
            contentType: "slides",
            completed: true,
            description:
              "Introducción al diseño de interfaces mediante componentes independientes, reutilizables y mantenibles.",
            objective:
              "Reconocer las ventajas de dividir una interfaz compleja en componentes con responsabilidades específicas.",
            resources: [
              "Guía de arquitectura modular",
              "Resumen de conceptos",
            ],
            slide: {
              eyebrow: "Unidad 1 · Clase 1",
              title: "Pensar una interfaz como un sistema",
              body:
                "Una aplicación moderna no se construye como una única pantalla rígida. Se organiza como un conjunto de piezas independientes que colaboran entre sí.",
              points: [
                "Cada componente debe tener una responsabilidad clara.",
                "Los elementos reutilizables reducen trabajo repetido.",
                "La separación facilita pruebas y mantenimiento.",
              ],
              number: 1,
              total: 6,
            },
          },
          {
            id: "composicion-reutilizacion",
            title: "Composición y reutilización",
            duration: "22 min",
            contentType: "video",
            completed: true,
            description:
              "Aplicación de composición de componentes para construir interfaces flexibles.",
            objective:
              "Comprender cómo combinar piezas pequeñas para formar módulos académicos más complejos.",
            resources: [
              "Video principal",
              "Código de ejemplo",
            ],
          },
          {
            id: "practica-componentes",
            title: "Práctica: diseñar una tarjeta académica",
            duration: "25 min",
            contentType: "practice",
            completed: true,
            description:
              "Actividad guiada para estructurar una tarjeta reutilizable de asignatura.",
            objective:
              "Aplicar propiedades, composición y reutilización en un ejercicio visual.",
            resources: [
              "Enunciado de práctica",
              "Rúbrica de evaluación",
            ],
          },
        ],
      },
      {
        id: "unidad-2",
        title: "Unidad 2 — Estado e interacción",
        description:
          "Manejo de información dinámica y eventos dentro de la interfaz.",
        lessons: [
          {
            id: "estado-componentes",
            title: "Componentes reactivos y estado",
            duration: "24 min",
            contentType: "slides",
            completed: false,
            description:
              "Explicación del estado como mecanismo para representar cambios dentro de una interfaz.",
            objective:
              "Distinguir entre información estática, propiedades y estado interno.",
            resources: [
              "Presentación de la clase",
              "Mapa conceptual",
              "Ejemplos interactivos",
            ],
            slide: {
              eyebrow: "Unidad 2 · Clase 1",
              title: "La interfaz responde a los datos",
              body:
                "El estado representa información que puede cambiar durante la interacción del usuario. Cuando cambia, la interfaz se actualiza para reflejar su nuevo valor.",
              points: [
                "El estado pertenece al componente que lo administra.",
                "Los cambios deben realizarse mediante funciones controladas.",
                "Una buena ubicación del estado evita duplicaciones.",
              ],
              number: 1,
              total: 8,
            },
          },
          {
            id: "eventos-formularios",
            title: "Eventos y formularios",
            duration: "28 min",
            contentType: "video",
            completed: false,
            description:
              "Manejo de acciones del usuario, entradas de datos y validaciones.",
            objective:
              "Implementar formularios controlados mediante eventos de interfaz.",
            resources: [
              "Grabación de clase",
              "Formulario de ejemplo",
            ],
          },
          {
            id: "documento-estado",
            title: "Lectura complementaria",
            duration: "14 min",
            contentType: "document",
            completed: false,
            description:
              "Documento sobre patrones recomendados para organizar estados complejos.",
            objective:
              "Analizar buenas prácticas y errores comunes en el manejo del estado.",
            resources: [
              "Documento PDF",
              "Preguntas de reflexión",
            ],
          },
        ],
      },
      {
        id: "unidad-3",
        title: "Unidad 3 — Integración de datos",
        description:
          "Consumo de servicios, persistencia y sincronización de información.",
        lessons: [
          {
            id: "servicios-remotos",
            title: "Conexión con servicios remotos",
            duration: "30 min",
            contentType: "slides",
            completed: false,
            locked: true,
            description:
              "Conceptos iniciales para conectar la interfaz con servicios externos.",
            objective:
              "Comprender el flujo de solicitudes y respuestas en una aplicación web.",
            resources: [
              "Presentación",
              "Diagrama cliente-servidor",
            ],
            slide: {
              eyebrow: "Unidad 3 · Clase 1",
              title: "Del navegador al servidor",
              body:
                "Las aplicaciones modernas intercambian información con servicios externos mediante solicitudes estructuradas.",
              points: [
                "El cliente inicia una solicitud.",
                "El servidor valida y procesa la información.",
                "La respuesta vuelve en un formato estructurado.",
              ],
              number: 1,
              total: 7,
            },
          },
          {
            id: "proyecto-integrador",
            title: "Proyecto integrador",
            duration: "45 min",
            contentType: "practice",
            completed: false,
            locked: true,
            description:
              "Construcción de un pequeño módulo académico conectado a datos.",
            objective:
              "Integrar componentes, estado, eventos y persistencia.",
            resources: [
              "Enunciado del proyecto",
              "Rúbrica",
              "Archivos iniciales",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "base-datos",
    code: "BD-305",
    title: "Bases de Datos II",
    description:
      "Diseño y gestión de estructuras relacionales y no relacionales aplicadas a sistemas académicos.",
    teacher: "Prof. Andrés Salazar",
    teacherRole: "Docente de Bases de Datos",
    progress: 46,
    completedLessons: 5,
    totalLessons: 11,
    estimatedTime: "7 semanas",
    category: "Gestión de datos",
    tone: "violet",
    units: [
      {
        id: "unidad-1",
        title: "Unidad 1 — Modelado avanzado",
        description:
          "Diseño lógico de estructuras de información.",
        lessons: [
          {
            id: "normalizacion",
            title: "Normalización de datos",
            duration: "26 min",
            contentType: "slides",
            completed: true,
            description:
              "Principios para disminuir redundancia y mejorar la integridad de los datos.",
            objective:
              "Aplicar formas normales en estructuras académicas.",
            resources: [
              "Presentación",
              "Ejercicios resueltos",
            ],
            slide: {
              eyebrow: "Unidad 1 · Clase 1",
              title: "Organizar datos sin duplicaciones",
              body:
                "La normalización permite estructurar la información para disminuir inconsistencias y facilitar su mantenimiento.",
              points: [
                "Identificación de dependencias.",
                "Separación de entidades.",
                "Conservación de relaciones.",
              ],
              number: 1,
              total: 5,
            },
          },
          {
            id: "relaciones",
            title: "Relaciones y cardinalidad",
            duration: "21 min",
            contentType: "video",
            completed: true,
            description:
              "Estudio de relaciones uno a uno, uno a muchos y muchos a muchos.",
            objective:
              "Seleccionar la cardinalidad adecuada para cada proceso académico.",
            resources: [
              "Grabación",
              "Ejercicio práctico",
            ],
          },
        ],
      },
      {
        id: "unidad-2",
        title: "Unidad 2 — Bases NoSQL",
        description:
          "Estructuras flexibles orientadas a documentos.",
        lessons: [
          {
            id: "documentos-nosql",
            title: "Modelado de documentos NoSQL",
            duration: "31 min",
            contentType: "slides",
            completed: false,
            description:
              "Organización de información mediante colecciones y documentos.",
            objective:
              "Diseñar una estructura documental adaptable a procesos académicos.",
            resources: [
              "Presentación",
              "Ejemplo Firestore",
            ],
            slide: {
              eyebrow: "Unidad 2 · Clase 1",
              title: "Datos flexibles y orientados a documentos",
              body:
                "Los modelos NoSQL permiten almacenar información heterogénea sin depender de una estructura tabular rígida.",
              points: [
                "Colecciones como agrupaciones principales.",
                "Documentos con campos flexibles.",
                "Escalabilidad para aplicaciones web modernas.",
              ],
              number: 1,
              total: 7,
            },
          },
          {
            id: "consultas-nosql",
            title: "Consultas y filtros",
            duration: "27 min",
            contentType: "practice",
            completed: false,
            description:
              "Práctica de consulta, ordenamiento y filtrado.",
            objective:
              "Crear consultas eficientes sobre colecciones académicas.",
            resources: [
              "Laboratorio",
              "Datos de prueba",
            ],
          },
          {
            id: "seguridad-datos",
            title: "Seguridad de acceso",
            duration: "20 min",
            contentType: "document",
            completed: false,
            locked: true,
            description:
              "Lectura sobre permisos, roles y protección de información.",
            objective:
              "Reconocer principios para proteger registros académicos sensibles.",
            resources: [
              "Documento PDF",
              "Lista de comprobación",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "inteligencia-artificial",
    code: "IA-501",
    title: "Fundamentos de Inteligencia Artificial",
    description:
      "Conceptos, métodos y aplicaciones fundamentales de la inteligencia artificial en contextos educativos.",
    teacher: "Ing. Mariana Torres",
    teacherRole: "Docente de Inteligencia Artificial",
    progress: 28,
    completedLessons: 3,
    totalLessons: 10,
    estimatedTime: "9 semanas",
    category: "Tecnologías emergentes",
    tone: "amber",
    units: [
      {
        id: "unidad-1",
        title: "Unidad 1 — Introducción a la IA",
        description:
          "Conceptos esenciales y evolución de los sistemas inteligentes.",
        lessons: [
          {
            id: "conceptos-ia",
            title: "Conceptos fundamentales",
            duration: "19 min",
            contentType: "slides",
            completed: true,
            description:
              "Introducción a agentes inteligentes, datos, modelos y toma de decisiones.",
            objective:
              "Identificar los componentes básicos de un sistema de inteligencia artificial.",
            resources: [
              "Presentación",
              "Línea histórica",
            ],
            slide: {
              eyebrow: "Unidad 1 · Clase 1",
              title: "¿Qué hace inteligente a un sistema?",
              body:
                "Un sistema inteligente procesa información, identifica patrones y produce acciones o recomendaciones orientadas a un objetivo.",
              points: [
                "Percepción de información.",
                "Procesamiento y análisis.",
                "Selección de respuestas o acciones.",
              ],
              number: 1,
              total: 6,
            },
          },
          {
            id: "aplicaciones-educativas",
            title: "Aplicaciones en educación",
            duration: "23 min",
            contentType: "video",
            completed: true,
            description:
              "Ejemplos de automatización, tutoría y apoyo docente.",
            objective:
              "Analizar usos responsables de la IA dentro del entorno académico.",
            resources: [
              "Grabación",
              "Casos de estudio",
            ],
          },
        ],
      },
      {
        id: "unidad-2",
        title: "Unidad 2 — Aprendizaje automático",
        description:
          "Modelos que identifican patrones a partir de datos.",
        lessons: [
          {
            id: "aprendizaje-supervisado",
            title: "Aprendizaje supervisado",
            duration: "25 min",
            contentType: "slides",
            completed: false,
            description:
              "Introducción al aprendizaje mediante ejemplos previamente etiquetados.",
            objective:
              "Diferenciar datos de entrenamiento, características y resultados esperados.",
            resources: [
              "Presentación",
              "Conjunto de datos",
            ],
            slide: {
              eyebrow: "Unidad 2 · Clase 1",
              title: "Aprender mediante ejemplos",
              body:
                "En el aprendizaje supervisado, el modelo recibe ejemplos con respuestas conocidas y busca patrones que permitan predecir nuevos casos.",
              points: [
                "Datos de entrada y etiquetas.",
                "Entrenamiento y validación.",
                "Predicción sobre casos nuevos.",
              ],
              number: 1,
              total: 8,
            },
          },
          {
            id: "clasificacion-regresion",
            title: "Clasificación y regresión",
            duration: "29 min",
            contentType: "document",
            completed: false,
            description:
              "Diferencias entre predicción de categorías y valores numéricos.",
            objective:
              "Seleccionar el enfoque adecuado según el resultado requerido.",
            resources: [
              "Lectura",
              "Ejercicios",
            ],
          },
          {
            id: "practica-modelos",
            title: "Práctica de modelos predictivos",
            duration: "38 min",
            contentType: "practice",
            completed: false,
            locked: true,
            description:
              "Actividad visual para interpretar resultados de un modelo.",
            objective:
              "Analizar predicciones y reconocer posibles errores.",
            resources: [
              "Actividad",
              "Rúbrica",
            ],
          },
        ],
      },
    ],
  },
];

export function getLearningCourse(
  courseId: string,
): LearningCourse | undefined {
  return learningCourses.find(
    (course) => course.id === courseId,
  );
}