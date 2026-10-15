#!/usr/bin/env node
// PostToolUse hook (matcher: Edit|Write) — auto-fixes lint issues on the
// file that was just touched, so every edit leaves the codebase ESLint-clean
// without anyone having to remember to run `npm run lint`.

const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    filePath = JSON.parse(input).tool_input?.file_path || '';
  } catch {
    process.exit(0);
  }

  if (!filePath.endsWith('.js') || filePath.includes('node_modules')) {
    process.exit(0);
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const result = spawnSync(
    'npx',
    ['eslint', '--fix', path.resolve(filePath)],
    { cwd: projectDir, shell: true, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    console.error(result.stdout || result.stderr);
  }

  process.exit(0);
});