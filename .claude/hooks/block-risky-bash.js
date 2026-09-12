#!/usr/bin/env node
// PreToolUse guard for Bash. Blocks commands that destroy work or publish it,
// where a mistake cannot be undone by re-running something. Everything else is
// left to the normal permission rules in .claude/settings.json.

const RULES = [
  [/\brm\s+(-[a-zA-Z]*\s+)*-[a-zA-Z]*r[a-zA-Z]*f|\brm\s+(-[a-zA-Z]*\s+)*-[a-zA-Z]*f[a-zA-Z]*r/,
    'Recursive force-delete (rm -rf) is blocked on this project. Delete specific paths instead.'],
  [/\bgit\s+push\b[^&|;]*\s(--force\b(?!-with-lease)|-f\b)/,
    'Force-pushing is blocked: it rewrites history other clones already have.'],
  [/\bgit\s+reset\b[^&|;]*\s--hard\b/,
    'git reset --hard is blocked: it discards uncommitted work irreversibly.'],
  [/\bgit\s+clean\b[^&|;]*\s-[a-zA-Z]*f/,
    'git clean -f is blocked: it deletes untracked files with no way back.'],
  [/\bnpm\s+publish\b/,
    'npm publish is blocked: this is a course project, not a published package.'],
];

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input).tool_input?.command ?? '';
  } catch {
    process.exit(0); // Unparseable input must never block the session.
  }

  for (const [pattern, reason] of RULES) {
    if (pattern.test(command)) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason,
        },
      }));
      return;
    }
  }
});
