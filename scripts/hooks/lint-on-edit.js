#!/usr/bin/env node
// Claude Code PostToolUse hook (Edit|Write): lint the file Claude just changed.
//
// - Only .js files inside the `npm run lint` scope (server.js, routes/, db/, tests/).
// - Runs `eslint --fix`, so auto-fixable problems are corrected in place.
// - If errors remain, prints them to stderr and exits 2: Claude Code feeds that
//   back to Claude, which then has to fix them. Warnings don't block.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
const LINT_SCOPE = ['server.js', 'routes/', 'db/', 'tests/'];

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const rel = path.relative(root, path.resolve(root, filePath)).split(path.sep).join('/');
  if (!LINT_SCOPE.some((scope) => rel === scope || rel.startsWith(scope))) process.exit(0);

  // Call ESLint through node so a missing execute bit on node_modules/.bin doesn't matter.
  const eslint = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslint)) {
    process.stderr.write('lint-on-edit: ESLint not installed, skipping (run `npm install`).\n');
    process.exit(1); // non-blocking: shown to the user, Claude carries on
  }

  const result = spawnSync(process.execPath, [eslint, '--fix', rel], { cwd: root, encoding: 'utf8' });
  if (result.status === 0) process.exit(0);

  process.stderr.write(
    `ESLint found errors in ${rel} after your edit. Fix them before moving on:\n` +
      `${result.stdout}${result.stderr}`,
  );
  process.exit(2);
});
