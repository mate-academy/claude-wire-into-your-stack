#!/usr/bin/env node
/**
 * PostToolUse hook: keep edited JavaScript lint-clean.
 *
 * CI runs `npm run lint` on every push and pull request, so a lint error that
 * slips into an edit is a red build later. This runs ESLint with --fix on the
 * file that was just written, so the fix happens now instead of in CI.
 *
 * Contract with Claude Code:
 *   stdin  - JSON hook payload; we use tool_input.file_path
 *   exit 0 - nothing to say, the edit stands
 *   exit 2 - stderr is fed back to Claude so it can repair the file
 *
 * Invoked as `node .claude/hooks/lint-changed.js` (never as a shell one-liner)
 * so it behaves the same on Windows, macOS and Linux.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function main(payload) {
  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !/\.(js|mjs|cjs)$/.test(filePath)) return 0;

  const projectDir = payload.cwd || process.cwd();
  const rel = path.relative(projectDir, filePath);

  // Ignore anything outside the repo, plus dependencies and the hook itself.
  if (rel.startsWith('..') || path.isAbsolute(rel)) return 0;
  if (rel.split(path.sep).includes('node_modules')) return 0;
  if (!fs.existsSync(filePath)) return 0;

  // Fresh checkout before `npm ci` - stay quiet rather than erroring on
  // every single edit.
  const eslint = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslint)) return 0;

  const before = fs.readFileSync(filePath, 'utf8');
  const run = spawnSync(process.execPath, [eslint, '--fix', filePath], {
    cwd: projectDir,
    encoding: 'utf8',
  });
  const after = fs.readFileSync(filePath, 'utf8');

  const output = `${run.stdout || ''}${run.stderr || ''}`.trim();

  if (run.status !== 0) {
    process.stderr.write(
      `ESLint still reports problems in ${rel} after --fix. ` +
        `Fix them before moving on:\n\n${output}\n`
    );
    return 2;
  }

  if (before !== after) {
    process.stdout.write(`[lint-changed] ESLint auto-fixed ${rel}.\n`);
  }
  return 0;
}

let raw = '';
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let payload = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // Malformed payload must never block an edit.
  }
  try {
    process.exit(main(payload));
  } catch (err) {
    process.stderr.write(`[lint-changed] hook error: ${err.message}\n`);
    process.exit(0); // A broken hook must not wedge the session.
  }
});
