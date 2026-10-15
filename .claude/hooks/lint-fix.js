#!/usr/bin/env node
// PostToolUse hook (Edit|Write): auto-fix the file Claude just touched with
// this project's own ESLint config, so every edit holds the same lint
// standard without anyone having to remember to run `npm run lint`.
const { execFileSync } = require('node:child_process');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) {
    process.exit(0);
  }

  try {
    execFileSync('npx', ['eslint', '--fix', filePath], {
      stdio: 'inherit',
      shell: true,
    });
  } catch {
    // eslint exits non-zero on issues it can't auto-fix — that's expected,
    // this hook only auto-fixes what it can, it doesn't block the edit.
  }
  process.exit(0);
});
