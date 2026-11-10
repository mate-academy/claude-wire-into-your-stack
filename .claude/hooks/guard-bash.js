#!/usr/bin/env node
// PreToolUse hook (matcher: Bash). Blocks risky shell commands before they run.
// Reads the tool call as JSON on stdin; exit code 2 blocks it and sends stderr back to Claude.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(raw).tool_input.command || '';
  } catch {
    process.exit(0); // never break the session on malformed input
  }
  const rules = [
    [/git\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/, 'force-push is blocked in this project'],
    [/git\s+push\b[^\n]*\b(origin\s+)?(main|master)\b/, 'push to main/master is blocked; use a branch + PR'],
    [/\brm\s+-[a-z]*r[a-z]*f?[a-z]*\s+(\/|~|\.\.?(\s|$)|\*)/, 'recursive rm on root/home/cwd is blocked'],
  ];
  for (const [re, why] of rules) {
    if (re.test(cmd)) {
      console.error(`Blocked by project hook: ${why}.`);
      process.exit(2);
    }
  }
  process.exit(0);
});
