import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../src/', import.meta.url));
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server') return nextResolve('next/server.js', context);
  if (specifier.startsWith('@/')) {
    const path = root + specifier.slice(2);
    for (const extension of ['.ts', '.tsx', '/index.ts']) if (existsSync(path + extension)) return { url: pathToFileURL(path + extension).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}});
