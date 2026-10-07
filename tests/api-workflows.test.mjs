import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import './register-paths.mjs';

// Dobles de Auth/Firestore: las pruebas ejercitan los handlers reales sin escribir en producción.
let records, generated, calls, failure, lastInput;
const clone = value => structuredClone(value);
function snapshot(path) { return { id: path.split('/').at(-1), exists: records.has(path), data: () => records.has(path) ? clone(records.get(path)) : undefined }; }
function ref(path, filters = [], take = Infinity) {
  return { path, id: path.split('/').at(-1), collection: name => ref(`${path}/${name}`), doc: id => ref(`${path}/${id || crypto.randomUUID()}`),
    get: async () => {
      if (path.split('/').length % 2 === 0) return snapshot(path);
      const docs = [...records.keys()].filter(key => key.startsWith(path + '/') && key.split('/').length === path.split('/').length + 1)
        .filter(key => filters.every(([field, value]) => records.get(key)[field] === value)).reverse().slice(0, take).map(snapshot);
      return { docs };
    },
    where: (field, op, value) => { assert.equal(op, '=='); return ref(path, [...filters, [field,value]], take); },
    orderBy: () => ref(path, filters, take), limit: count => ref(path, filters, count),
    set: async (value, options) => write(path, value, options), add: async value => { const id = crypto.randomUUID(); write(`${path}/${id}`, value); return ref(`${path}/${id}`); },
  };
}
function write(path, value, options) {
  const before = records.get(path) || {};
  const result = options?.merge ? { ...before } : {};
  for (const [key, val] of Object.entries(value)) {
    if (val?.methodName === 'FieldValue.increment') result[key] = (before[key] || 0) + val.operand;
    else if (val?.methodName === 'FieldValue.serverTimestamp') result[key] = Date.now();
    else result[key] = clone(val);
  }
  records.set(path, result);
}
const db = { collection: name => ref(name), doc: path => ref(path),
  runTransaction: async callback => callback({ get: async r => snapshot(r.path), set: (r, v, o) => write(r.path,v,o), update: (r,v) => write(r.path,v,{merge:true}) }),
};
mock.module('../src/lib/firebase/admin.ts', { namedExports: { getAdminDb: () => db, getAdminAuth: () => ({ verifyIdToken: async token => { if (!['student','teacher','suspended'].includes(token)) throw Error('invalid'); return { uid: token }; } }) } });
mock.module('../src/lib/ai/generation.ts', { namedExports: { isAiConfigured: () => true, generateAcademicText: async input => { lastInput = input; calls++; if (failure) throw failure; return { text: generated, provider: 'ollama', model: 'qwen2.5:3b' }; } } });
const practice = await import('../src/app/api/ai/practice/route.ts');
const course = await import('../src/app/api/ai/course/route.ts');
const teacher = await import('../src/app/api/ai/teacher/route.ts');
const exams = await import('../src/lib/server/exam-attempt-admin.ts');
const { getStudentExam } = await import('../src/data/exams.ts');

function setup(t) {
  records = new Map([
    ['users/student', { role: 'student', status: 'active' }], ['users/teacher', { role: 'teacher', status: 'active' }], ['users/suspended', { role: 'student', status: 'suspended' }],
    ['courses/course1', { teacherId: 'teacher', name: 'Materia' }], ['courses/course2', { teacherId: 'other', name: 'Ajena' }],
    ['enrollments/course1--student', { studentId:'student', courseId:'course1', teacherId:'teacher', sectionId:'section1', status:'active' }],
    ['lessonPlans/lesson1', { teacherId:'teacher', courseId:'course1', sectionId:'section1', visibleToStudents:true, title:'Claves primarias', unit:'Unidad 1', contents:['Una clave primaria identifica filas.'], objectives:['Identificar una clave primaria'], lessonContent:'Una clave primaria identifica una fila.', notes:'INTERNAL-NOTE-MUST-NOT-LEAK' }],
    ['lessonPlans/private', { teacherId:'teacher', courseId:'course1', sectionId:'section2', visibleToStudents:true, title:'Clase de otra sección' }],
  ]);
  calls = 0; failure = null;
  generated = JSON.stringify({ question:'¿Qué restricción identifica de forma única una fila en una tabla?', options:['Clave primaria','Descripción','Comentario','Nombre repetido'], correctIndex:0, explanation:'La clave primaria distingue cada fila sin duplicados ni valores nulos.', hint:'Piensa en un identificador único.' });
  const env = { ...process.env }; process.env.AI_DAILY_LIMIT = '50'; t.after(() => { process.env = env; });
}
const post = (payload, token='student') => new Request('http://localhost/api', { method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const generate = () => post({ action:'generate', courseId:'course1', lessonId:'lesson1', difficulty:'basico' });

test('API: rechaza usuario anónimo, token inválido y perfil suspendido antes de usar IA', async t => {
  setup(t);
  assert.equal((await practice.POST(post({}, ''))).status, 401);
  assert.equal((await practice.POST(post({}, 'invalid'))).status, 401);
  assert.equal((await practice.POST(post({}, 'suspended'))).status, 403);
  assert.equal(calls,0);
});
test('API: JSON malformado, rutas y clase de otra sección no llegan al modelo', async t => {
  setup(t);
  const bad = new Request('http://localhost/api', {method:'POST',headers:{Authorization:'Bearer student'},body:'{'});
  assert.equal((await practice.POST(bad)).status,400);
  assert.equal((await course.POST(post({courseId:'a/b/c',question:'Explica'}))).status,400);
  assert.equal((await practice.POST(post({action:'generate',courseId:'course1',lessonId:'private'}))).status,404);
  assert.equal(calls,0);
});
test('API: genera sin revelar solución y entrega una única vez con progreso', async t => {
  setup(t);
  const response = await practice.POST(generate()); assert.equal(response.status,200);
  const body = await response.json(); assert.equal(body.provider,'ollama'); assert.ok(!('correctIndex' in body)); assert.ok(!('explanation' in body));
  const answer = String(body.options.indexOf('Clave primaria'));
  assert.equal((await practice.POST(post({action:'submit',challengeId:body.challengeId,answer}))).status,200);
  assert.equal((await practice.POST(post({action:'submit',challengeId:body.challengeId,answer}))).status,409);
  const progress = records.get('users/student/playgroundSessions/course1--real');
  assert.equal(progress.attempts,1); assert.equal(progress.correctAnswers,1);
});
test('API: recuperación e historial no filtran solución; rechazo de repetición no guarda reto nuevo', async t => {
  setup(t);
  const first = await (await practice.POST(generate())).json();
  const catalog = await (await practice.GET(new Request('http://localhost/api?courseId=course1',{headers:{Authorization:'Bearer student'}}))).json();
  assert.equal(catalog.lessons.length,1); assert.equal(catalog.pending.challengeId,first.challengeId); assert.ok(!('correctIndex' in catalog.pending));
  assert.equal((await practice.POST(generate())).status,422);
  assert.equal([...records.keys()].filter(key=>key.includes('/practiceChallenges/')).length,1);
});
test('API: matrícula revocada impide entregar y consultar', async t => {
  setup(t);
  const first = await (await practice.POST(generate())).json(); records.get('enrollments/course1--student').status='inactive';
  assert.equal((await practice.POST(post({action:'submit',challengeId:first.challengeId,answer:'0'}))).status,403);
  assert.equal((await course.POST(post({courseId:'course1',question:'Explica la clave'}))).status,403);
  assert.ok(!records.has('users/student/playgroundSessions/course1--real'));
});
test('API: cuota compartida entre prácticas y tutor limita las llamadas', async t => {
  setup(t);process.env.AI_DAILY_LIMIT='1';
  assert.equal((await practice.POST(generate())).status,200);
  assert.equal((await course.POST(post({courseId:'course1',lessonId:'lesson1',question:'Explícame'}))).status,429);
  assert.equal(calls,1);
});
test('API: gateway ocupado y timeout producen mensajes recuperables sin guardar ejercicio', async t => {
  setup(t);
  failure=new Error('ollama/gateway-429');assert.equal((await practice.POST(generate())).status,429);
  failure=new Error('ollama/gateway-504');assert.equal((await practice.POST(generate())).status,504);
  assert.equal([...records.keys()].filter(key=>key.includes('/practiceChallenges/')).length,0);
});
test('API: docente solo genera para sus materias y estudiante no usa copiloto', async t => {
  setup(t);
  const payload={courseId:'course2',task:'plan',topic:'Plan de clase'};
  assert.equal((await teacher.POST(post(payload,'teacher'))).status,403);
  assert.equal((await teacher.POST(post({...payload,courseId:'course1'}))).status,403);
  assert.equal((await teacher.POST(post({...payload,courseId:'course1'},'teacher'))).status,200);
});
test('examen: reanudar no consume otro intento y entregar es idempotente', async t => {
  setup(t);const exam=getStudentExam('arquitectura-web-interactiva');
  const first=await exams.startExamForStudent('student',exam);
  const next=await exams.startExamForStudent('student',exam);assert.equal(next.attempt.attemptId,first.attempt.attemptId);assert.equal(next.progress.attemptsUsed,1);
  const path=`users/student/examAttempts/${first.attempt.attemptId}`;
  records.get(path).answers=Object.fromEntries(exam.questions.map(q=>[q.id,q.correctAnswer]));
  const result=await exams.submitExamForStudent('student',exam,first.attempt.attemptId,'manual');assert.equal(result.attempt.result.score,100);
  const again=await exams.submitExamForStudent('student',exam,first.attempt.attemptId,'manual');assert.equal(again.attempt.result.score,100);assert.equal(again.progress.attemptsUsed,1);
});
test('examen: el servidor detecta vencimiento aunque el contador se haya manipulado', async t => {
  setup(t);const exam=getStudentExam('arquitectura-web-interactiva');
  const first=await exams.startExamForStudent('student',exam);
  const attempt=records.get(`users/student/examAttempts/${first.attempt.attemptId}`);attempt.startedAtMs=Date.now()-attempt.durationSeconds*1000-5000;attempt.remainingSeconds=999999;
  const resumed=await exams.startExamForStudent('student',exam);assert.equal(resumed.attempt.remainingSeconds,0);
  const result=await exams.submitExamForStudent('student',exam,first.attempt.attemptId,'manual');assert.equal(result.attempt.remainingSeconds,0);assert.equal(result.attempt.submissionReason,'time-expired');
});

test('API: el tutor recibe contenido publicado y nunca observaciones internas', async t => {
  setup(t);
  const response=await course.POST(post({courseId:'course1',lessonId:'lesson1',question:'Explica las claves'}));
  assert.equal(response.status,200);
  const body=await response.json();assert.equal(body.provider,'ollama');assert.equal(body.remaining,49);
  assert.ok(lastInput.contents.includes('Una clave primaria'));
  assert.ok(!lastInput.contents.includes('INTERNAL-NOTE-MUST-NOT-LEAK'));
  assert.ok(!lastInput.contents.includes('Clase de otra sección'));
});
