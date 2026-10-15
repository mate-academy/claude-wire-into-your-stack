#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a .js file in this project,
// auto-fix it with the project's ESLint config so style stays consistent
// without anyone having to remember to run `npm run lint` by hand.

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

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) {
    return;
  }

  try {
    execFileSync('npx', ['eslint', '--fix', filePath], { stdio: 'inherit' });
  } catch {
    // eslint exits non-zero when lint errors remain after fixing what it can;
    // that's a signal for the user, not a hook failure.
  }
});
