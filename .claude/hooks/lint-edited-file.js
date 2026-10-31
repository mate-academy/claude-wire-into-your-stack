#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a .js file, run ESLint with
// --fix on just that file. Auto-fixable issues are fixed silently; anything
// left over is reported back to Claude (exit code 2 + stderr) so it fixes it
// before moving on. Non-JS files and files outside the project are ignored.

const { spawnSync } = require('node:child_process');
const path = require('node:path');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const relative = path.relative(projectDir, path.resolve(projectDir, filePath));
  if (relative.startsWith('..') || relative.startsWith('node_modules')) process.exit(0);

  const eslint = path.join(projectDir, 'node_modules', '.bin', 'eslint');
  const result = spawnSync(eslint, ['--fix', '--max-warnings=0', relative], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  if (result.error) {
    // ESLint isn't installed (no `npm install` yet) — don't block the edit.
    process.stderr.write(`lint hook skipped: ${result.error.message}\n`);
    process.exit(0);
  }

  if (result.status !== 0) {
    process.stderr.write(
      `ESLint found problems in ${relative} that --fix could not resolve:\n${result.stdout}${result.stderr}`,
    );
    process.exit(2);
  }

  process.exit(0);
});
