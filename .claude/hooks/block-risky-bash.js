#!/usr/bin/env node
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const command = (data.tool_input && data.tool_input.command) || '';
  const risky = [
    /git\s+push\s+.*(--force|-f\b)/,
    /git\s+reset\s+--hard/,
    /rm\s+-rf/,
    /git\s+clean\s+-f/,
    /--no-verify/,
  ];
  const hit = risky.find((re) => re.test(command));
  if (hit) {
    process.stderr.write(
      `Blocked by project hook: "${command}" matches a disallowed pattern. ` +
      `Destructive/force operations must be run manually by a human in this repo.\n`
    );
    process.exit(2);
  }
  process.exit(0);
});
