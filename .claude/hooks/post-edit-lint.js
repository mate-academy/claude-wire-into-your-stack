#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a JS file, auto-fix it
// with this project's eslint config so every change stays formatted the
// same way without anyone having to remember to run lint.
const { execFileSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const file = payload.tool_input && payload.tool_input.file_path;
  if (!file || !file.endsWith('.js')) return;

  try {
    execFileSync('npx', ['eslint', '--fix', file], {
      stdio: 'inherit',
      cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    });
  } catch {
    // eslint --fix exits non-zero when unfixable errors remain — that's
    // fine, the hook's job is only to auto-fix what it can.
  }
});
