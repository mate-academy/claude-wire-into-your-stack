// PreToolUse hook for Bash: blocks destructive commands before they run.
// Exit code 2 = block; stderr is shown to Claude as the reason.
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(input).tool_input.command || '';
  } catch {
    process.exit(0);
  }
  const rules = [
    [/\bgit\s+push\b.*(--force\b|\s-f\b|--force-with-lease)/, 'force push'],
    [/\bgit\s+reset\s+--hard\b/, 'git reset --hard'],
    [/\bgit\s+clean\s+-\w*f/, 'git clean -f'],
    [/\brm\s+-\w*r\w*f|\brm\s+-\w*f\w*r/, 'rm -rf'],
  ];
  for (const [re, name] of rules) {
    if (re.test(cmd)) {
      process.stderr.write(`Blocked by project hook: "${name}" is not allowed in this repo. Ask the user to run it manually if really needed.\n`);
      process.exit(2);
    }
  }
  process.exit(0);
});
