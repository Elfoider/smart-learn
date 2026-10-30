import test from 'node:test';
import assert from 'node:assert/strict';
import { assessmentState, courseLearning, instructionSteps, safeMeetingUrl } from '../src/lib/student/experience.ts';
const now = Date.parse('2026-10-30T12:00:00Z');
const activity = {status:'open',opensAt:'2026-10-29T12:00:00Z',closesAt:'2026-10-31T12:00:00Z'};
test('evaluaciones: respeta apertura futura, cierre y estados explícitos',()=>{
 assert.equal(assessmentState(activity,now),'available');
 assert.equal(assessmentState({...activity,opensAt:'2026-10-31T12:00:00Z'},now),'upcoming');
 assert.equal(assessmentState({...activity,closesAt:'2026-10-29T12:00:00Z'},now),'closed');
 assert.equal(assessmentState({...activity,status:'closed'},now),'closed');
 assert.equal(assessmentState({...activity,status:'scheduled'},now),'upcoming');
});
test('evaluaciones: solo un resultado publicado habilita el estado con resultado',()=>{
 assert.equal(assessmentState({...activity,status:'graded'},now),'closed');
 assert.equal(assessmentState(activity,now,true),'graded');
 assert.equal(assessmentState({...activity,status:'archived'},now,true),'archived');
});
test('avance: ignora clases eliminadas, ajenas y duplicados al calcular el porcentaje',()=>{
 const lessons=[{id:'a',courseId:'web',title:'A'},{id:'b',courseId:'web',title:'B'},{id:'x',courseId:'db',title:'X'}];
 const learning=courseLearning(lessons,'web',{completedLessonIds:['a','a','deleted','x']});
 assert.equal(learning.completed,1);assert.equal(learning.total,2);assert.equal(learning.percent,50);assert.equal(learning.next.id,'b');
});
test('inicio: reanuda una clase publicada pendiente y salta la clase ya completada',()=>{
 const lessons=[{id:'a',courseId:'web',title:'A'},{id:'b',courseId:'web',title:'B'}];
 assert.equal(courseLearning(lessons,'web',{currentLessonId:'b'}).next.id,'b');
 assert.equal(courseLearning(lessons,'web',{currentLessonId:'a',completedLessonIds:['a']}).next.id,'b');
 assert.equal(courseLearning(lessons,'web',{completedLessonIds:['a','b']}).state,'completed');
 assert.equal(courseLearning([],'web',{completedLessonIds:['old']}).percent,0);
});
test('instrucciones: conserva el contenido al dividir párrafos y listas numeradas',()=>{
 assert.deepEqual(instructionSteps('  Paso A.\n\nPaso B.\n2. Paso C.  '),['Paso A.','Paso B.','2. Paso C.']);
});
test('agenda: solo permite enlaces web y rechaza protocolos ejecutables',()=>{
 assert.equal(safeMeetingUrl('https://meet.example.test/a'),true);
 assert.equal(safeMeetingUrl('javascript:alert(1)'),false);
 assert.equal(safeMeetingUrl('no es una URL'),false);
});
