#!/usr/bin/env node
// PostToolUse hook: keep every edited .js file lint-clean.
// CI runs `npm run lint` on every PR (.github/workflows/ci.yml), so this
// applies the auto-fixable half locally and hands the rest back to Claude.
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..', '..');
const ESLINT = path.join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    const payload = JSON.parse(raw || '{}');
    file = payload.tool_input?.file_path || payload.tool_response?.filePath;
  } catch {
    return; // malformed payload: never block the edit
  }

  if (!file || !file.endsWith('.js')) return;
  const abs = path.resolve(ROOT, file);
  if (!abs.startsWith(ROOT) || !fs.existsSync(abs)) return;
  if (!fs.existsSync(ESLINT)) return; // deps not installed yet

  const run = spawnSync(process.execPath, [ESLINT, '--fix', '--format', 'json', abs], {
    cwd: ROOT,
    encoding: 'utf8',
  });

  let results;
  try {
    results = JSON.parse(run.stdout || '[]');
  } catch {
    return;
  }

  const remaining = (results[0]?.messages ?? []).filter((m) => !m.fix);
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');

  if (remaining.length === 0) {
    console.log(JSON.stringify({ suppressOutput: true }));
    return;
  }

  const lines = remaining
    .map((m) => `  ${rel}:${m.line}:${m.column}  ${m.severity === 2 ? 'error' : 'warning'}  ${m.message}  (${m.ruleId ?? 'parse'})`)
    .join('\n');

  console.log(
    JSON.stringify({
      systemMessage: `ESLint: ${remaining.length} problem(s) left in ${rel} that --fix cannot resolve`,
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `ESLint auto-fix ran on ${rel}. These problems remain and will fail \`npm run lint\` in CI — fix them now:\n${lines}`,
      },
    })
  );
});
