#!/usr/bin/env node
// PostToolUse hook (Edit|Write): formats the edited file with Prettier.
// Reads the hook JSON payload on stdin; no dependency on jq.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const SUPPORTED = new Set(['.js', '.cjs', '.mjs', '.json', '.md', '.yml', '.yaml', '.css', '.html']);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const file = payload?.tool_response?.filePath ?? payload?.tool_input?.file_path;
  if (!file) return;

  const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
  const abs = path.resolve(projectDir, file);
  const rel = path.relative(projectDir, abs);

  // Only format files inside the project, never dependencies or Claude settings.
  if (rel.startsWith('..') || path.isAbsolute(rel)) return;
  if (rel.split(path.sep).some((p) => p === 'node_modules' || p === '.git')) return;
  if (!SUPPORTED.has(path.extname(abs).toLowerCase())) return;

  // Prettier treats backslashes as glob escapes: always pass a forward-slash relative path.
  const target = rel.split(path.sep).join('/');
  const res = spawnSync(`npx --yes prettier --write --ignore-unknown "${target}"`, {
    cwd: projectDir,
    encoding: 'utf8',
    shell: true, // resolves npx / npx.cmd on every platform
  });
  if (res.status !== 0) {
    process.stderr.write(`prettier failed on ${rel}: ${res.stderr || res.error}\n`);
    process.exitCode = 1;
  }
});
