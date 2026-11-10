#!/usr/bin/env node
// PreToolUse hook (matcher: Bash) that blocks destructive Git commands:
//   - git reset --hard
//   - git clean (anything except a dry run: -n / --dry-run)
// Normal Git commands (status, diff, add, commit, log, ...) pass through.
//
// Protocol: Claude Code sends the hook input as JSON on stdin. Exit code 2
// blocks the tool call and shows stderr to Claude; exit code 0 allows it.
// This script only inspects the command string. It never runs Git.
//
// This is a guardrail against mistakes, not a security boundary.

'use strict';

// Matches `git` as its own word (also git.exe), followed by any global options
// (-C <path>, -c <k=v>, --no-pager, --git-dir=..., etc.), then the subcommand.
const GIT_PREFIX =
  '(?:^|[^\\w.-])git(?:\\.exe)?' +
  '(?:\\s+(?:-[Cc]\\s+(?:"[^"]*"|\'[^\']*\'|\\S+)|-{1,2}[\\w-]+(?:=\\S+)?))*';

const RESET_RE = new RegExp(GIT_PREFIX + '\\s+reset(?=\\s|$)');
const CLEAN_RE = new RegExp(GIT_PREFIX + '\\s+clean(?=\\s|$)');

// `--hard` as its own argument.
const HARD_RE = /(?:^|\s)--hard(?=\s|$|["'])/;
// `--dry-run`, or `-n` alone or combined in a short-flag group such as `-nd`.
const DRY_RUN_RE = /(?:^|\s)(?:--dry-run|-[a-zA-Z]*n[a-zA-Z]*)(?=\s|$|["'])/;

// Returns a reason string if the command must be blocked, otherwise null.
function findViolation(command) {
  // Judge each part of a compound command (a && b; c | d) on its own.
  const segments = command.split(/&&|\|\||[;|\n\r]/);

  for (const segment of segments) {
    const text = segment.trim();
    if (!text) continue;

    const reset = RESET_RE.exec(text);
    if (reset && HARD_RE.test(text.slice(reset.index + reset[0].length))) {
      return (
        'Blocked: "git reset --hard" discards uncommitted changes and cannot be undone. ' +
        'Use "git stash" to set changes aside, or "git reset --soft" / "git restore <file>" ' +
        'for a narrower change.'
      );
    }

    const clean = CLEAN_RE.exec(text);
    if (clean && !DRY_RUN_RE.test(text.slice(clean.index + clean[0].length))) {
      return (
        'Blocked: "git clean" permanently deletes untracked files. ' +
        'Preview with "git clean -n" (or --dry-run) instead. ' +
        'If a real clean is needed, ask the user to run it themselves.'
      );
    }
  }
  return null;
}

function main(raw) {
  let command;
  try {
    const input = JSON.parse(raw);
    command = input && input.tool_input && input.tool_input.command;
  } catch (err) {
    // Malformed input: fail open so a broken payload cannot lock up every Bash call.
    process.stderr.write('block-destructive-git: could not parse hook input; allowing.\n');
    return 0;
  }

  if (typeof command !== 'string' || command.trim() === '') return 0;

  const reason = findViolation(command);
  if (reason) {
    process.stderr.write(reason + '\n');
    return 2;
  }
  return 0;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  process.exitCode = main(raw);
});
process.stdin.on('error', () => {
  process.exitCode = 0;
});
