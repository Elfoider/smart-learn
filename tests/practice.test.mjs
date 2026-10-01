import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChallenge, publicChallenge } from '../src/lib/practice/challenge.ts';
const item = { question: '¿Cuál es la función del estado de un componente?', options: ['Guardar información entre renderizados', 'Cambiar el servidor', 'Heredar las props', 'Crear una base de datos'], correctIndex: 0, explanation: 'El estado conserva información del componente entre renderizados.', hint: 'Piensa en los datos que cambian al pulsar un botón.' };
test('valida JSON con bloque de código sin filtrar la solución al navegador', () => {
  const parsed = parseChallenge('```json\n' + JSON.stringify(item) + '\n```', []);
  const visible = publicChallenge('id', parsed);
  assert.equal(visible.options.length, 4);
  assert.equal('correctIndex' in visible, false);
  assert.equal('explanation' in visible, false);
});
test('rechaza preguntas recientes aunque cambien acentos y puntuación', () => {
  assert.throws(() => parseChallenge(JSON.stringify(item), ['cual es la funcion del estado de un componente']), /repeated/);
});
test('rechaza alternativas repetidas, índices fuera de rango y respuesta incompleta', () => {
  assert.throws(() => parseChallenge(JSON.stringify({ ...item, options: ['A', 'a', 'B', 'C'] }), []));
  assert.throws(() => parseChallenge(JSON.stringify({ ...item, correctIndex: 4 }), []));
  assert.throws(() => parseChallenge('{}', []));
});
