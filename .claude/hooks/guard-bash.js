// PreToolUse guard for the Bash tool.
// Reads the hook payload (JSON) from stdin and blocks a small, explicit set of
// recursive delete commands. Exit code 2 blocks the call; stderr is shown to Claude.
//
// Blocked forms (regex, case-insensitive, on the command string):
//   - rm with a recursive flag: -r, -R, -rf, -fr, --recursive (any flag order)
//   - Remove-Item with -Recurse
//   - rd or rmdir with /s
//   - del with /s
// NOT covered: find -delete, git clean, python/node file removal, or any other
// tool that deletes files. This is a guard against common accidents, not a sandbox.

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    // Not a JSON payload we understand: do not block.
    process.exit(0);
  }

  const command = (payload && payload.tool_input && payload.tool_input.command) || '';

  const patterns = [
    /\brm\s+(?:[^\s;&|]*\s+)*?(?:-[a-z]*r[a-z]*\b|--recursive\b)/i,
    /\bRemove-Item\b[^;&|]*-Recurse\b/i,
    /\b(?:rd|rmdir)\b[^;&|]*\/s\b/i,
    /\bdel\b[^;&|]*\/s\b/i,
  ];

  if (patterns.some((re) => re.test(command))) {
    process.stderr.write(
      'Blocked by project guard: recursive delete command. ' +
        'Delete files one by one, or ask the user to run it.\n'
    );
    process.exit(2);
  }
  process.exit(0);
});
