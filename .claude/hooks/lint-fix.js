#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a JavaScript file that
// `npm run lint` covers, auto-fix it with the project's own ESLint and report
// anything ESLint could not fix back to Claude, so the tree stays CI-green.
//
// Wired up in .claude/settings.json (matcher: Edit|Write|MultiEdit).
// Reads the hook payload as JSON on stdin; runs from the project root.
//
// Exit codes: 0 = nothing to do or clean, 2 = errors remain (stderr goes back
// to Claude so it can fix them in the same turn).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// The paths `npm run lint` covers — keep these in sync with package.json.
const LINTED = ['server.js', 'routes', 'db', 'tests'];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  const raw = readStdin();
  if (!raw.trim()) return 0;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return 0; // Not our payload shape — never block on a parse problem.
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath) return 0;

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const abs = path.resolve(root, filePath);
  const rel = path.relative(root, abs).split(path.sep).join('/');

  // Only lint project JavaScript that `npm run lint` would check.
  if (rel.startsWith('..') || path.isAbsolute(rel)) return 0;
  if (!rel.endsWith('.js')) return 0;
  if (!LINTED.some((p) => rel === p || rel.startsWith(`${p}/`))) return 0;
  if (!fs.existsSync(abs)) return 0;

  // Use the project's pinned ESLint, not whatever npx would fetch. On a fresh
  // clone without `npm install`, stay quiet rather than failing every edit.
  const eslintBin = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslintBin)) return 0;

  const result = spawnSync(process.execPath, [eslintBin, '--fix', abs], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status === 0) return 0;

  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  process.stderr.write(
    `ESLint auto-fixed what it could in ${rel}, but problems remain. ` +
      `Fix them before moving on:\n${output}\n`
  );
  return 2;
}

process.exit(main());
