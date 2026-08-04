#!/usr/bin/env node
// PostToolUse hook: keep this repo's JavaScript lint-clean automatically.
//
// Claude Code pipes a JSON payload describing the tool call on stdin. We read
// the edited file's path and, if it is a JavaScript file inside this project,
// run ESLint's autofix over it. Everything else is ignored.
//
// This always exits 0 on purpose: tidying up formatting should never block the
// edit that triggered it. The hook reports what it did on stderr, which Claude
// Code surfaces in the transcript.

const { execFileSync } = require('node:child_process');
const path = require('node:path');

let raw = '';
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(raw)?.tool_input?.file_path;
  } catch {
    process.exit(0); // Malformed payload — nothing to format.
  }

  if (!filePath || !filePath.endsWith('.js')) {
    process.exit(0);
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const relative = path.relative(projectDir, filePath);

  // Ignore anything outside the project, and anything vendored in node_modules.
  if (relative.startsWith('..') || relative.split(path.sep).includes('node_modules')) {
    process.exit(0);
  }

  try {
    execFileSync('npx', ['eslint', '--fix', filePath], {
      cwd: projectDir,
      stdio: 'ignore',
    });
    console.error(`[eslint-fix] cleaned ${relative}`);
  } catch {
    // ESLint exits non-zero when problems remain that autofix cannot repair.
    // Surface that, but let the edit stand.
    console.error(`[eslint-fix] ${relative} has issues autofix could not repair`);
  }

  process.exit(0);
});
