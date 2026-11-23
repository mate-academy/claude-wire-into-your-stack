#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a JavaScript file in this
// project, lint that one file with the project's own ESLint config.
//
// Claude Code passes the tool call as JSON on stdin. Exit codes:
//   0 - nothing to do, or the file is clean
//   2 - ESLint found errors; the report goes to stderr so Claude sees it and fixes them
//   1 - the hook itself could not run (shown to the user, does not block Claude)

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

const input = readInput();
const filePath = input.tool_input && input.tool_input.file_path;

// Only JavaScript files that exist.
if (!filePath || path.extname(filePath) !== '.js' || !fs.existsSync(filePath)) {
  process.exit(0);
}

// Only files inside this project, and never dependencies.
const relative = path.relative(projectDir, path.resolve(filePath));
if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).includes('node_modules')) {
  process.exit(0);
}

const eslintBin = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!fs.existsSync(eslintBin)) {
  console.error('lint hook: ESLint is not installed. Run `npm install`, then edit again.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [eslintBin, relative], {
  cwd: projectDir,
  encoding: 'utf8',
});

if (result.status === 0) {
  process.exit(0);
}

console.error(`ESLint found problems in ${relative}. Fix them:\n\n${result.stdout}${result.stderr}`);
process.exit(2);
