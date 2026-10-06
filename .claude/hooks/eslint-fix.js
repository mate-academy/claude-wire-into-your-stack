// PostToolUse hook (Edit|Write): run ESLint --fix on the edited .js file and
// feed any remaining lint errors back to Claude (exit code 2 + stderr).
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', async () => {
  let filePath;
  try {
    const payload = JSON.parse(input);
    filePath = payload.tool_input?.file_path || payload.tool_response?.filePath;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const relative = path.relative(projectDir, filePath);
  if (relative.startsWith('..') || relative.split(path.sep).includes('node_modules')) {
    process.exit(0);
  }

  let ESLint;
  try {
    ({ ESLint } = require(require.resolve('eslint', { paths: [projectDir] })));
  } catch {
    process.exit(0); // ESLint not installed (e.g. before `npm install`) — nothing to enforce.
  }

  const eslint = new ESLint({ cwd: projectDir, fix: true });
  const results = await eslint.lintFiles([filePath]);
  await ESLint.outputFixes(results);

  const errors = results.flatMap((r) => r.messages.filter((m) => m.severity === 2));
  if (errors.length === 0) process.exit(0);

  const lines = errors.map((m) => `  ${relative}:${m.line}:${m.column}  ${m.message}  (${m.ruleId})`);
  process.stderr.write(`ESLint found ${errors.length} error(s) after auto-fix:\n${lines.join('\n')}\n`);
  process.exit(2);
});
