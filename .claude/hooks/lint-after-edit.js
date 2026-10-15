#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a file, run ESLint --fix on
// it if it's inside this project's lint scope (see `lint` in package.json).
//
// - Silently does nothing for files outside the lint scope.
// - Silently does nothing if node_modules/eslint isn't installed (e.g. a
//   fresh checkout before `npm install`), so it never blocks a first run.
// - On success (or after a clean --fix), exits 0.
// - If problems remain that --fix can't fix, prints ESLint's report to
//   stderr and exits 2, which feeds the failure back to Claude to correct.

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  const raw = readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return 0; // no valid hook payload, nothing to do
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath) return 0;

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const absPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(projectDir, filePath);

  if (!absPath.endsWith('.js')) return 0;

  // Mirror package.json's `lint` script scope: server.js, routes, db, tests
  // (plus the eslint config itself).
  const relPath = path.relative(projectDir, absPath).replace(/\\/g, '/');
  const inScope =
    relPath === 'server.js' ||
    relPath === 'eslint.config.js' ||
    relPath.startsWith('routes/') ||
    relPath.startsWith('db/') ||
    relPath.startsWith('tests/');
  if (!inScope) return 0;

  const eslintBin = path.join(
    projectDir,
    'node_modules',
    'eslint',
    'bin',
    'eslint.js',
  );
  if (!fs.existsSync(eslintBin) || !fs.existsSync(absPath)) return 0;

  const result = spawnSync(
    process.execPath,
    [eslintBin, '--fix', absPath],
    { cwd: projectDir, encoding: 'utf8' },
  );

  if (result.status === 0) return 0;

  process.stderr.write(
    `ESLint found problems in ${relPath} that --fix could not resolve:\n\n` +
      `${result.stdout || ''}${result.stderr || ''}`,
  );
  return 2;
}

process.exit(main());
