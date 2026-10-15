#!/usr/bin/env node

// PostToolUse hook: lint the JS file Claude just edited or wrote.
// Exit 2 sends ESLint output back to Claude.

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let input = '';

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let filePath;

  try {
    filePath = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }

  if (!filePath) {
    process.exit(0);
  }

  const rootInput =
    process.env.CLAUDE_PROJECT_DIR || process.cwd();

  let root;
  let resolvedFile;

  try {
    root = fs.realpathSync(rootInput);
    resolvedFile = fs.realpathSync(filePath);
  } catch {
    process.exit(0);
  }

  const rel = path.relative(root, resolvedFile);

  const isJsFile = /\.js$/.test(rel);
  const isInLintScope =
    rel === 'server.js' ||
    rel.startsWith('routes/') ||
    rel.startsWith('db/') ||
    rel.startsWith('tests/');

  if (!isJsFile || !isInLintScope) {
    process.exit(0);
  }

  const result = spawnSync(
    'npx',
    ['--no-install', 'eslint', rel],
    {
      cwd: root,
      encoding: 'utf8',
    }
  );

  if (result.status !== 0) {
    process.stderr.write(
      `ESLint failed on ${rel}:\n${result.stdout}${result.stderr}`
    );
    process.exit(2);
  }

  process.exit(0);
});
