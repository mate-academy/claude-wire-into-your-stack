#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a JavaScript file, run
// ESLint with --fix on that file. If problems remain that ESLint can't fix,
// exit 2 so the errors are fed back to Claude to fix right away.
const { execFileSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath;
  try {
    const payload = JSON.parse(input);
    filePath = payload.tool_input && payload.tool_input.file_path;
  } catch {
    process.exit(0); // not something we can act on
  }
  if (!filePath || !/\.(c|m)?js$/.test(filePath)) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = path.relative(projectDir, filePath);
  if (rel.startsWith('..') || rel.includes('node_modules')) process.exit(0);

  const eslint = path.join(projectDir, 'node_modules', '.bin', 'eslint');
  try {
    execFileSync(eslint, ['--fix', rel], { cwd: projectDir, stdio: 'pipe' });
    console.log(`lint-on-edit: ${rel} is clean`);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('lint-on-edit: ESLint not installed — run `npm install`.');
      process.exit(0);
    }
    const out = `${err.stdout || ''}${err.stderr || ''}`.trim();
    console.error(`ESLint found problems in ${rel} that need fixing:\n${out}`);
    process.exit(2);
  }
});
