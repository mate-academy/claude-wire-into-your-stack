const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const file = payload?.tool_response?.filePath || payload?.tool_input?.file_path;
  if (!file || !file.endsWith('.js') || file.includes('node_modules')) return;

  const eslintBin = path.join(__dirname, '..', '..', 'node_modules', 'eslint', 'bin', 'eslint.js');
  spawnSync(process.execPath, [eslintBin, '--fix', file], { stdio: 'inherit' });
});
