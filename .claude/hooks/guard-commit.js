#!/usr/bin/env node
// PreToolUse hook: block `git commit` if the test suite is currently red.
// This is the one standard the project can't compromise on — a change that
// breaks the tests should never reach a commit, let alone the shared branch.
const { execFileSync } = require('node:child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const command = payload?.tool_input?.command || '';
  if (!/\bgit\s+commit\b/.test(command)) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  try {
    execFileSync('npm', ['test', '--silent'], { cwd: projectDir, stdio: 'pipe' });
  } catch (err) {
    process.stderr.write(
      'Blocked: `npm test` is failing, so this commit was not allowed.\n' +
      'Fix the failing test(s) before committing.\n\n' +
      (err.stdout ? err.stdout.toString() : '')
    );
    process.exit(2); // exit 2 blocks the tool call and shows stderr to Claude
  }
  process.exit(0);
});
