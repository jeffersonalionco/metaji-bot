/**
 * Ofusca apenas o módulo de multi-sessão.
 * Uso: npm run obfuscate-multi
 * Gera: dist/multiSessionManager.obfuscated.js
 * O main.js carrega esse arquivo quando existe; caso contrário usa o original.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const input = join(root, 'src', 'libraries', 'multiSessionManager.js');
const outDir = join(root, 'dist');
const output = join(outDir, 'multiSessionManager.obfuscated.js');

const code = readFileSync(input, 'utf8');
const obfuscated = JavaScriptObfuscator.obfuscate(code, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  reservedNames: ['^startMultiSession$'],
  reservedStrings: [],
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
});

mkdirSync(outDir, { recursive: true });
writeFileSync(output, obfuscated.getObfuscatedCode(), 'utf8');
console.log('OK: dist/multiSessionManager.obfuscated.js');
