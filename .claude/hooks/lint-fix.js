// PostToolUse hook: auto-fix lint on any .js file Claude edits or writes.
// Reads the hook payload on stdin; exits 2 (blocking feedback) if unfixable
// lint errors remain, so Claude sees them and fixes the code.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^﻿/, ''));
} catch {
  process.exit(0);
}

const file = payload.tool_input && payload.tool_input.file_path;
if (!file || !file.endsWith('.js') || file.includes('node_modules')) {
  process.exit(0);
}

const eslintBin = path.resolve('node_modules', 'eslint', 'bin', 'eslint.js');
if (!fs.existsSync(eslintBin) || !fs.existsSync(file)) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [eslintBin, '--fix', file], {
  encoding: 'utf8',
});

if (result.status !== 0) {
  console.error(`ESLint found problems it could not auto-fix in ${file}:\n${result.stdout || result.stderr}`);
  process.exit(2);
}
process.exit(0);
