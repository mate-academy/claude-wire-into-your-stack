// PreToolUse hook (Bash): before `git commit` or `git push`, scans staged
// changes (and, for push, unpushed commits) for likely secrets and blocks
// the command if any are found.
const { execSync } = require('child_process');

let data = '';
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(data || '{}'); } catch { input = {}; }
  const cmd = (input.tool_input && input.tool_input.command) || '';

  if (!/\bgit\s+(commit|push)\b/i.test(cmd)) {
    console.log('{}');
    return;
  }

  const secretPatterns = [
    [/AKIA[0-9A-Z]{16}/, 'AWS access key ID'],
    [/-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, 'private key block'],
    [/xox[baprs]-[0-9A-Za-z-]{10,}/, 'Slack token'],
    [/ghp_[0-9A-Za-z]{36}/, 'GitHub personal access token'],
    [/(api|secret|access)[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i, 'hardcoded API/secret key'],
    [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JWT-looking token'],
  ];

  const run = (command) => {
    try {
      return execSync(command, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      return '';
    }
  };

  let diff = run('git diff --cached -U0');
  let stagedFiles = run('git diff --cached --name-only');

  const hasUpstream = run('git rev-parse --abbrev-ref --symbolic-full-name @{u}').trim().length > 0;
  if (/\bgit\s+push\b/i.test(cmd) && hasUpstream) {
    diff += run('git diff @{u}..HEAD -U0');
  }

  const envFileStaged = stagedFiles
    .split('\n')
    .map((f) => f.trim())
    .some((f) => /(^|\/)\.env(\..*)?$/.test(f) && !/\.env\.example$/.test(f));

  const addedLines = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const findings = new Set();
  for (const line of addedLines) {
    for (const [pattern, label] of secretPatterns) {
      if (pattern.test(line)) findings.add(label);
    }
  }
  if (envFileStaged) findings.add('a .env file staged for commit');

  if (findings.size) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Possible secret(s) detected: ${[...findings].join(', ')}. Remove them (use env vars / .gitignore) before committing or pushing.`,
      },
    }));
  } else {
    console.log('{}');
  }
});