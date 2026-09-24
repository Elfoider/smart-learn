import type { CourseLesson } from "@/data/course-content";

export type SlideLayout =
  | "introduction"
  | "points"
  | "steps"
  | "summary";

export interface LessonSlide {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  layout: SlideLayout;
  points: string[];
}

const customLessonSlides: Record<
  string,
  LessonSlide[]
> = {
  "estado-componentes": [
    {
      id: "estado-componentes-1",
      eyebrow: "Unidad 2 · Clase 1",
      title: "La interfaz responde a los datos",
      body:
        "El estado representa información que puede cambiar durante la interacción del usuario. Cuando cambia, la interfaz se actualiza para mostrar el nuevo valor.",
      layout: "introduction",
      points: [
        "Los datos determinan lo que se muestra.",
        "La interfaz reacciona ante cada cambio.",
        "El usuario recibe una respuesta inmediata.",
      ],
    },
    {
      id: "estado-componentes-2",
      eyebrow: "Concepto fundamental",
      title: "¿Qué información debe convertirse en estado?",
      body:
        "No toda variable necesita ser un estado. Solamente debe serlo la información que cambia y afecta directamente la representación visual.",
      layout: "points",
      points: [
        "Valores escritos en un formulario.",
        "Elementos seleccionados por el usuario.",
        "Resultados recibidos desde un servicio.",
        "Estados de carga, éxito o error.",
      ],
    },
    {
      id: "estado-componentes-3",
      eyebrow: "Flujo de funcionamiento",
      title: "Del evento a la actualización",
      body:
        "El cambio visual ocurre mediante un flujo controlado que comienza con una acción y termina con una nueva representación.",
      layout: "steps",
      points: [
        "El usuario ejecuta una acción.",
        "Una función procesa el evento.",
        "El estado recibe un nuevo valor.",
        "El componente vuelve a representarse.",
      ],
    },
    {
      id: "estado-componentes-4",
      eyebrow: "Buenas prácticas",
      title: "Mantener el estado simple",
      body:
        "Una estructura clara disminuye errores, duplicaciones y comportamientos difíciles de controlar.",
      layout: "points",
      points: [
        "Ubica el estado cerca de donde se utiliza.",
        "Evita almacenar información que puede calcularse.",
        "No dupliques el mismo valor en varios componentes.",
        "Usa nombres que describan su propósito.",
      ],
    },
    {
      id: "estado-componentes-5",
      eyebrow: "Comprobación",
      title: "Preguntas para reflexionar",
      body:
        "Antes de avanzar, verifica que puedas relacionar el concepto de estado con una situación real.",
      layout: "summary",
      points: [
        "¿Qué dato cambia durante la interacción?",
        "¿Qué parte de la interfaz depende de ese dato?",
        "¿Cuál componente debe administrarlo?",
      ],
    },
  ],
};

function createAutomaticSlides(
  lesson: CourseLesson,
): LessonSlide[] {
  if (!lesson.slide) {
    return [];
  }

  const original = lesson.slide;

  return [
    {
      id: `${lesson.id}-introduction`,
      eyebrow: original.eyebrow,
      title: original.title,
      body: original.body,
      layout: "introduction",
      points: original.points,
    },
    {
      id: `${lesson.id}-concepts`,
      eyebrow: "Ideas principales",
      title: "Conceptos que debes recordar",
      body:
        "Estos elementos resumen los fundamentos abordados durante la lección.",
      layout: "points",
      points: original.points,
    },
    {
      id: `${lesson.id}-application`,
      eyebrow: "Aplicación",
      title: "Relaciona la teoría con la práctica",
      body: lesson.objective,
      layout: "steps",
      points: [
        "Identifica el concepto central.",
        "Analiza un ejemplo relacionado.",
        "Explica su aplicación con tus propias palabras.",
        "Registra cualquier duda en tus notas personales.",
      ],
    },
    {
      id: `${lesson.id}-summary`,
      eyebrow: "Cierre de la clase",
      title: "Resumen y comprobación",
      body:
        "Antes de continuar, confirma que puedes explicar los conceptos esenciales de esta lección.",
      layout: "summary",
      points: [
        `Describe: ${original.title}.`,
        "Menciona dos ideas importantes.",
        "Relaciona el contenido con el objetivo de aprendizaje.",
      ],
    },
  ];
}

export function getLessonSlides(
  lesson: CourseLesson,
): LessonSlide[] {
  const customSlides =
    customLessonSlides[lesson.id];

  if (customSlides) {
    return customSlides;
  }

  return createAutomaticSlides(lesson);
}