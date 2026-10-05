#!/usr/bin/env node
// PostToolUse hook: run `eslint --fix` on a JS file Claude just edited.
//
// CI runs `npm run lint` on every push, so a lint error is a broken build.
// Fixing it the moment the file is written keeps that standard without
// anyone having to remember it.
//
// Written in Node (not shell) on purpose: this is a Node project, so the
// runtime is guaranteed on every machine that can run the tests — no jq,
// no bash-only syntax, works the same on Windows, macOS and Linux.

const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const LINTED_DIRS = ['routes', 'db', 'tests'];
const LINTED_ROOT_FILES = ['server.js', 'eslint.config.js'];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const raw = readStdin();
if (!raw.trim()) process.exit(0);

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (!filePath || !filePath.endsWith('.js')) process.exit(0);

// Only lint files this project's eslint config actually covers (see the
// `lint` script in package.json), and only inside the repo.
const projectRoot = process.cwd();
const relative = path.relative(projectRoot, filePath);
if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0);

const topLevel = relative.split(path.sep)[0];
const covered =
  LINTED_DIRS.includes(topLevel) || LINTED_ROOT_FILES.includes(relative);
if (!covered) process.exit(0);

try {
  execFileSync('npx', ['eslint', '--fix', relative], {
    cwd: projectRoot,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  console.error(`[hook] eslint --fix ${relative}`);
} catch (error) {
  // Lint errors that --fix can't repair are reported back to Claude so it
  // can correct them, but the edit itself still stands.
  const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
  console.error(`[hook] eslint found problems in ${relative}:\n${output}`);
}

process.exit(0);
