#!/usr/bin/env node
// PostToolUse hook: lint every JavaScript file Claude edits or writes, using the
// project's own ESLint config (the same check CI runs).
//
// Registered at project scope in .claude/settings.json:
//   hooks.PostToolUse[].matcher = "Edit|Write|MultiEdit"
//   hooks.PostToolUse[].hooks[].command = node "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-edited-file.js"
//
// PostToolUse runs after the file is already written, so this hook cannot block the
// edit. On lint errors it exits 2, which reports the ESLint output back to Claude
// so it fixes the file in its next step.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // Not hook JSON; nothing to do.
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const filePath = input.tool_input && input.tool_input.file_path;
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const absolute = path.resolve(projectDir, filePath);
  const relative = path.relative(projectDir, absolute);
  if (relative.startsWith('..') || relative.split(path.sep).includes('node_modules')) {
    process.exit(0); // Outside the project or a dependency: not ours to lint.
  }
  if (!fs.existsSync(absolute)) process.exit(0);

  const eslintBin = path.join(projectDir, 'node_modules', '.bin', 'eslint');
  if (!fs.existsSync(eslintBin)) {
    console.log('lint hook: ESLint not installed (run `npm ci`); skipped.');
    process.exit(0);
  }

  const result = spawnSync(eslintBin, ['--no-warn-ignored', relative], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  if (result.status === 0) process.exit(0);

  process.stderr.write(
    `ESLint found problems in ${relative}. Fix them before moving on ` +
      '(CI runs `npm run lint` and will fail otherwise):\n' +
      (result.stdout || '') +
      (result.stderr || ''),
  );
  process.exit(2);
});
