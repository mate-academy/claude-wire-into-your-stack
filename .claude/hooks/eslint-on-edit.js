#!/usr/bin/env node
// PostToolUse hook (Write|Edit): lints the touched file with the project's local ESLint.
// Never blocks the tool call - failures and lint errors are surfaced as stderr output only.

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  let input;
  try {
    input = JSON.parse(readStdin() || '{}');
  } catch {
    return;
  }

  const filePath = input?.tool_input?.file_path ?? input?.tool_response?.filePath;
  if (!filePath || !filePath.endsWith('.js')) return;

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const eslintBin = path.join(
    projectDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'eslint.cmd' : 'eslint',
  );
  if (!fs.existsSync(eslintBin)) return;

  const result = spawnSync(eslintBin, [filePath], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  if (output) process.stderr.write(output + '\n');
}

main();
