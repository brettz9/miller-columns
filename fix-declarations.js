#!/usr/bin/env node
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fix the millerColumns.d.ts file to reference the correct path
const filePath = join(__dirname, 'dist', 'millerColumns.d.ts');
let content = readFileSync(filePath, 'utf8');

// Replace '../src/index.js' with './index.js'
content = content.replaceAll(/import\(['"]\.\.\/src\/index\.js['"]\)/gv, "import('./index.js')");

writeFileSync(filePath, content, 'utf8');

// eslint-disable-next-line no-console -- Info
console.log('Fixed declaration file paths');
