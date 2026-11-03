#!/usr/bin/env node
// PostToolUse hook: format whatever file Claude just edited.
// Never blocks. Problems go to stderr and we always exit 0.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PRETTIER = 'prettier@3.9.10';
const EXTENSIONS = new Set(['.js', '.json', '.md']);

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    run(JSON.parse(raw));
  } catch (err) {
    console.error(`format hook: ${err.message}`);
  }
  process.exit(0);
});

function run(input) {
  const file = input && input.tool_input && input.tool_input.file_path;
  if (!file) return;

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const abs = path.resolve(root, file);
  const rel = path.relative(root, abs);

  if (rel.startsWith('..') || path.isAbsolute(rel)) return; // outside the project
  if (rel.split(path.sep).includes('node_modules')) return;
  if (!EXTENSIONS.has(path.extname(abs))) return;
  if (!fs.existsSync(abs)) return;

  const opts = { cwd: root, encoding: 'utf8' };
  const fmt = spawnSync(
    'npx',
    ['--yes', PRETTIER, '--single-quote', '--write', abs],
    opts,
  );
  if (fmt.status !== 0) console.error(`prettier failed: ${fmt.stderr}`);

  const eslintBin = path.join(root, 'node_modules', '.bin', 'eslint');
  if (path.extname(abs) === '.js' && fs.existsSync(eslintBin)) {
    spawnSync(eslintBin, ['--fix', abs], opts);
  }
}
