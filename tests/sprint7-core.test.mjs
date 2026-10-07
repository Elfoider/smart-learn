import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingExamSeconds } from '../src/lib/exams/exam-clock.ts';
import { getDailyAiLimit } from '../src/lib/ai/limits.ts';
import { aiFailure } from '../src/lib/ai/errors.ts';
import { documentId, readRequestJson } from '../src/lib/server/request-validation.ts';

test('reloj: recarga y pestaña suspendida no extienden el plazo', () => {
  assert.equal(remainingExamSeconds(1000,60,1000),60);
  assert.equal(remainingExamSeconds(1000,60,31000),30);
  assert.equal(remainingExamSeconds(1000,60,62000),0);
  assert.equal(remainingExamSeconds(1000,60,0),60);
  assert.equal(remainingExamSeconds(NaN,60),0);
});
test('cuota: valores inválidos y decimales no provocan límites ilimitados', () => {
  assert.equal(getDailyAiLimit('Infinity'),50);
  assert.equal(getDailyAiLimit('abc'),50);
  assert.equal(getDailyAiLimit('2.8'),2);
  assert.equal(getDailyAiLimit('0'),1);
  assert.equal(getDailyAiLimit('900'),200);
});
test('errores IA: ocupado, timeout y configuración no revelan detalles internos', () => {
  assert.equal(aiFailure(new Error('ollama/gateway-429')).status,429);
  assert.equal(aiFailure(new Error('ollama/gateway-504')).status,504);
  assert.equal(aiFailure(new Error('ollama/gateway-401')).status,503);
  assert.ok(!aiFailure(new Error('SECRET VALUE')).message.includes('SECRET'));
});
test('entrada: rechaza JSON inválido y rutas de documento inesperadas', async () => {
  for (const id of ['a/b','..','.','']) assert.equal(documentId.safeParse(id).success,false);
  assert.equal(documentId.parse(' demo-web '),'demo-web');
  await assert.rejects(readRequestJson(new Request('http://localhost',{method:'POST',body:'{'})),/JSON válido/);
});
