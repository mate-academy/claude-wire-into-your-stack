// PreToolUse guard: blocks risky shell commands and edits to secret files.
// Claude Code passes the tool call as JSON on stdin; exiting with code 2
// cancels the call and shows the stderr message to Claude.

const path = require('path');

const BLOCKED_COMMANDS = [
  {
    pattern: /\bgit\s+push\b.*(\s--force(?!-with-lease)\b|\s-[a-zA-Z]*f\b)/,
    reason: 'force-push rewrites shared history; use --force-with-lease or a new commit',
  },
  {
    pattern: /\bgit\s+reset\s+.*--hard\b/,
    reason: 'git reset --hard discards uncommitted work',
  },
  {
    pattern: /\brm\s+(.*\s)?(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|--recursive\s+--force|--force\s+--recursive)\b/,
    reason: 'rm -rf deletes recursively with no confirmation; remove specific files instead',
  },
];

function isSecretFile(filePath) {
  const name = path.basename(filePath || '');
  return (name === '.env' || name.startsWith('.env.')) && name !== '.env.example';
}

function block(reason) {
  process.stderr.write(`Blocked by project hook (.claude/hooks/guard.js): ${reason}\n`);
  process.exit(2);
}

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const toolInput = event.tool_input || {};

  if (event.tool_name === 'Bash') {
    const command = toolInput.command || '';
    for (const { pattern, reason } of BLOCKED_COMMANDS) {
      if (pattern.test(command)) block(reason);
    }
  }

  if ((event.tool_name === 'Edit' || event.tool_name === 'Write') && isSecretFile(toolInput.file_path)) {
    block('.env files hold secrets and must be edited by hand, never by Claude');
  }

  process.exit(0);
});
