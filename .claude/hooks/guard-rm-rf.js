#!/usr/bin/env node
// PreToolUse guard for the Bash tool: blocks recursive force deletes
// (`rm -rf`, `rm -fr`, `rm -r -f`, `rm --recursive --force`, ...) before
// they run. Reads the hook payload as JSON on stdin, writes a decision
// as JSON on stdout.

const RISKY_RM = /(^|[;&|]|\s)rm\s+(-[A-Za-z]*r[A-Za-z]*f[A-Za-z]*|-[A-Za-z]*f[A-Za-z]*r[A-Za-z]*|-r\s+-f|-f\s+-r|--recursive\s+--force|--force\s+--recursive)/i;

let raw = '';
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let command = '';
  try {
    const payload = JSON.parse(raw);
    command = (payload.tool_input && payload.tool_input.command) || '';
  } catch {
    // Malformed input — nothing to guard against, allow.
  }

  if (RISKY_RM.test(command)) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason:
            'Blocked by project guard (.claude/hooks/guard-rm-rf.js): ' +
            'rm -rf (recursive force delete) is not allowed via Bash in this repo. ' +
            'Run it manually outside Claude Code if it is truly needed.',
        },
      })
    );
  } else {
    console.log('{}');
  }
});
