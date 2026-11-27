#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a .js file, run ESLint with
// --fix on just that file. Anything ESLint can't fix is printed to stderr and
// the hook exits 2, which hands the problems back to Claude to deal with.
const { execFileSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const eslint = path.join(root, 'node_modules', '.bin', 'eslint');
  try {
    execFileSync(eslint, ['--fix', filePath], { cwd: root, stdio: 'pipe' });
  } catch (err) {
    process.stderr.write(`ESLint found problems in ${filePath}:\n${err.stdout || err.message}`);
    process.exit(2);
  }
});
