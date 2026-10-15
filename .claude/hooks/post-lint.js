// PostToolUse hook (Write|Edit): after a change to a core JS file
// (server.js, routes/, db/, tests/), run eslint on that file and feed any
// errors back to Claude so they get fixed before moving on.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let data = '';
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(data || '{}'); } catch { input = {}; }
  const filePath = (input.tool_response && input.tool_response.filePath)
    || (input.tool_input && input.tool_input.file_path)
    || '';
  const normalized = filePath.replace(/\\/g, '/');
  const isLintable = /\.js$/.test(normalized)
    && (/(^|\/)(routes|db|tests)\//.test(normalized) || /(^|\/)server\.js$/.test(normalized));

  if (!filePath || !isLintable) {
    console.log('{}');
    return;
  }

  // eslint isn't installed locally (npm install hasn't been run) — npx would
  // otherwise silently fetch an unrelated, incompatible version. Skip rather
  // than report a misleading "lint error" in that case.
  const eslintBin = path.join(process.cwd(), 'node_modules', '.bin', 'eslint');
  if (!fs.existsSync(eslintBin) && !fs.existsSync(`${eslintBin}.cmd`)) {
    console.log(JSON.stringify({
      systemMessage: 'Skipped post-change lint: dependencies are not installed (run `npm install`).',
    }));
    return;
  }

  try {
    execSync(`npx eslint "${filePath}"`, { encoding: 'utf8', stdio: 'pipe' });
    console.log('{}');
  } catch (e) {
    const output = `${e.stdout || ''}${e.stderr || ''}`.slice(0, 4000);
    console.log(JSON.stringify({
      decision: 'block',
      reason: `Lint errors in ${filePath} — fix these before continuing:\n${output}`,
    }));
  }
});