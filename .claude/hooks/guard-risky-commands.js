#!/usr/bin/env node
// PreToolUse hook on Bash: blocks destructive shell commands outright,
// instead of relying on someone being present to reject a permission
// prompt (which won't hold during a headless run with --allowedTools Bash).
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const command = (data.tool_input && data.tool_input.command) || '';

  const dangerousPatterns = [
    /\brm\s+-[a-z]*r[a-z]*f\b/i, // rm -rf (any flag order)
    /\brm\s+-[a-z]*f[a-z]*r\b/i,
    /git\s+push\b[^\n]*--force/i, // force push
    /git\s+reset\s+--hard/i,
    /git\s+clean\s+-[a-z]*f/i, // git clean -f / -fd
  ];

  const hit = dangerousPatterns.find((pattern) => pattern.test(command));
  if (hit) {
    process.stderr.write(
      `Blocked by project hook (.claude/hooks/guard-risky-commands.js): "${command}" matches a destructive-command pattern. Run it manually if you're sure.\n`,
    );
    process.exit(2);
  }

  process.exit(0);
});
