import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoDocuments, demoCourses } from '../scripts/demo-content.mjs';
const config = { teacherUid: 'teacher', students: [{ uid: 'student', name: 'Estudiante', email: 'demo@example.test' }], baseUrl: 'https://example.test', now: new Date('2026-09-30T12:00:00Z') };
test('carga tres materias y treinta y seis clases completas con IDs independientes', () => {
  const docs = buildDemoDocuments(config);
  assert.equal(demoCourses.length, 3);
  assert.equal(docs.filter(d => d.path.startsWith('lessonPlans/')).length, 36);
  assert.equal(new Set(docs.map(d => d.path)).size, docs.length);
  for (const doc of docs) assert.equal(doc.data.demo, true);
  for (const doc of docs.filter(d => d.path.startsWith('lessonPlans/'))) {
    assert.equal(doc.data.visibleToStudents, true);
    assert.ok(doc.data.lessonContent.length > 200);
    assert.equal(doc.data.teacherId, 'teacher');
  }
});
test('no crea usuarios, roles ni calificaciones salvo progreso solicitado', () => {
  const docs = buildDemoDocuments(config);
  assert.ok(!docs.some(d => d.path.startsWith('users/') || d.path.startsWith('grades/')));
  assert.equal(docs.filter(d => d.path.startsWith('enrollments/')).length, 3);
  const full = buildDemoDocuments({ ...config, withProgress: true });
  assert.equal(full.filter(d => d.path.startsWith('grades/')).length, 3);
  assert.ok(!full.some(d => /^users\/[^/]+$/.test(d.path)));
});

test('amplía contenido sin cambiar IDs de clases previas ni crear calificaciones nuevas', () => {
  const docs = buildDemoDocuments(config);
  assert.equal(docs.filter(d => d.path.startsWith('materials/')).length, 18);
  assert.equal(docs.filter(d => d.path.startsWith('assessments/')).length, 15);
  for (const course of demoCourses) {
    assert.equal(course.lessons.length, 12);
    for (let index = 1; index <= 12; index++) assert.ok(docs.some(d => d.path === `lessonPlans/demo-${course.slug}-clase-${index}`));
    for (const lesson of course.lessons.slice(4)) assert.ok(lesson.concept.length > 500);
  }
  assert.ok(!docs.some(d => d.path.startsWith('grades/')));
  for (const doc of docs.filter(d => d.path.includes('-actividad-unidad-'))) assert.equal(doc.data.weightPercentage, 0);
});
