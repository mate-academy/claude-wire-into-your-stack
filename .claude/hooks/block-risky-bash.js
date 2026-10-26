#!/usr/bin/env node
// PreToolUse hook for the Bash tool: blocks commands that can destroy work or
// rewrite shared history. Exit code 2 tells Claude Code to cancel the call and
// shows the stderr message to Claude so it can pick a safer approach.

const RULES = [
  { pattern: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, reason: 'recursive force delete (rm -rf)' },
  { pattern: /\bgit\s+push\b.*(--force\b|--force-with-lease\b|\s-f\b)/, reason: 'force push' },
  { pattern: /\bgit\s+push\b.*\b(main|master)\b/, reason: 'pushing straight to main — work on a branch and open a PR' },
  { pattern: /\bgit\s+reset\s+--hard\b/, reason: 'git reset --hard discards uncommitted work' },
  { pattern: /\bgit\s+clean\s+-[a-z]*f/, reason: 'git clean -f deletes untracked files' },
];

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input).tool_input?.command || '';
  } catch {
    process.exit(0);
  }

  const hit = RULES.find((rule) => rule.pattern.test(command));
  if (hit) {
    console.error(`Blocked by project hook: ${hit.reason}.\nCommand: ${command}\nAsk the user to run it themselves if it is really intended.`);
    process.exit(2);
  }
  process.exit(0);
});
