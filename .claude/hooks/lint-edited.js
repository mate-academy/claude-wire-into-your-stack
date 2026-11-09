#!/usr/bin/env node
// PostToolUse hook: after Claude edits a JS file, lint that file with the
// project's ESLint config. Lint errors are sent back to Claude (exit 2 +
// stderr) so it fixes them immediately.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !file.endsWith('.js') || file.includes('/node_modules/')) process.exit(0);
  if (path.relative(process.cwd(), file).startsWith('.claude')) process.exit(0);

  const res = spawnSync('npx', ['eslint', file], { encoding: 'utf8' });
  if (res.status !== 0) {
    process.stderr.write(`ESLint failed for ${file}:\n${res.stdout}${res.stderr}`);
    process.exit(2);
  }
});
