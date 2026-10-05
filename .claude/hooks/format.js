#!/usr/bin/env node
// PostToolUse hook: format a JS file (Prettier, then ESLint --fix) after Claude edits or writes it.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input?.file_path;
  } catch {
    return;
  }
  if (!file || !/\.(js|cjs|mjs)$/.test(file)) return;

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  if (path.relative(root, file).startsWith('..')) return;

  const bin = (name) => path.join(root, 'node_modules', '.bin', name);
  if (!fs.existsSync(bin('prettier')) || !fs.existsSync(bin('eslint'))) return; // not installed yet

  try {
    execFileSync(bin('prettier'), ['--write', file], {
      cwd: root,
      stdio: 'ignore',
    });
    execFileSync(bin('eslint'), ['--fix', file], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    // Remaining lint errors that --fix can't resolve: surface them to Claude.
    // ESLint reports findings on stdout, so prefer that over stderr.
    process.stderr.write(String(err.stdout || err.stderr || err.message));
    process.exit(2);
  }
});
