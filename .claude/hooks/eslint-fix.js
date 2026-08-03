#!/usr/bin/env node
// PostToolUse hook — keeps edited JS lint-clean.
//
// Reads the hook payload on stdin, runs ESLint with --fix on the file that was
// just edited, and exits 2 with whatever it could not fix. Exit code 2 feeds
// stderr back to Claude, so a lint problem surfaces on the edit that caused it
// rather than at the end of the task via `npm run lint`.
//
// Uses ESLint's Node API rather than shelling out: no jq, no npx, no shell
// quoting, and it behaves the same on Windows, macOS and Linux.

const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
// Mirrors the lint script in package.json: eslint server.js routes db tests
const LINTED_DIRS = /^(routes|db|tests)\//;

function readStdin() {
  return new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      raw += chunk;
    });
    process.stdin.on('end', () => resolve(raw));
  });
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    return; // not JSON — nothing to act on
  }

  const file = payload?.tool_response?.filePath ?? payload?.tool_input?.file_path;
  if (typeof file !== 'string' || !file.endsWith('.js')) return;

  const rel = path.relative(PROJECT_ROOT, file).split(path.sep).join('/');
  const inLintedSet = rel === 'server.js' || LINTED_DIRS.test(rel);
  if (rel.startsWith('..') || !inLintedSet) return;

  const { ESLint } = require('eslint');
  const eslint = new ESLint({ cwd: PROJECT_ROOT, fix: true });
  const results = await eslint.lintFiles([file]);
  await ESLint.outputFixes(results);

  const remaining = results.reduce((n, r) => n + r.errorCount + r.warningCount, 0);
  if (remaining === 0) return;

  const formatter = await eslint.loadFormatter('stylish');
  process.stderr.write(
    `eslint --fix ran on ${rel}; ${remaining} problem(s) it could not fix automatically:\n`,
  );
  process.stderr.write(await formatter.format(results));
  process.exit(2);
}

main().catch((err) => {
  // Never wedge the session on a hook infrastructure failure — report and pass.
  process.stderr.write(`eslint-fix hook failed: ${err.message}\n`);
  process.exit(0);
});
