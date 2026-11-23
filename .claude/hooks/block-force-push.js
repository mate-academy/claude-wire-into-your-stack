#!/usr/bin/env node
// PreToolUse hook: blocks `git push` with --force, --force-with-lease, -f,
// a short option group containing f (e.g. -fu), or a refspec starting with "+".
// Claude Code passes the tool call as JSON on stdin; the command is in tool_input.command.
// Exit 2 blocks the tool call and shows stderr to Claude. Exit 0 allows it.

// Global git options that take their value as a separate token (e.g. `-C <path>`).
const GIT_OPTS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--super-prefix']);

// Split a command into segments on ; && || | & and newlines.
function splitSegments(command) {
  return command.split(/&&|\|\||[;|&\n]/);
}

// Tokenize a segment on whitespace, keeping quoted strings together and removing the quotes.
function tokenize(segment) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(segment)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3]);
  }
  return tokens;
}

function isGitBinary(token) {
  const base = token.split(/[\\/]/).pop().toLowerCase();
  return base === 'git' || base === 'git.exe';
}

// Returns true if this segment is a `git ... push ...` that performs a force-push.
function isForcePushSegment(segment) {
  const tokens = tokenize(segment);

  // Skip leading environment assignments such as FOO=bar.
  let i = 0;
  while (i < tokens.length && /^[A-Za-z_]\w*=/.test(tokens[i])) i++;

  // The command word must be git (or git.exe). `echo "git push -f"` is not a git call.
  if (i >= tokens.length || !isGitBinary(tokens[i])) return false;
  i++;

  // Skip global options between `git` and the subcommand.
  while (i < tokens.length && tokens[i].startsWith('-')) {
    i += GIT_OPTS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
  }

  if (tokens[i] !== 'push') return false;
  const args = tokens.slice(i + 1);

  let endOfOptions = false;
  for (const arg of args) {
    if (!endOfOptions && arg === '--') {
      endOfOptions = true;
      continue;
    }
    if (!endOfOptions && arg.startsWith('--')) {
      if (/^--force(-with-lease)?(=.*)?$/.test(arg)) return true;
      continue;
    }
    if (!endOfOptions && arg.startsWith('-') && arg.length > 1) {
      // Short option or group, e.g. -f, -fu, -uf.
      if (arg.includes('f')) return true;
      continue;
    }
    // Positional argument (remote or refspec).
    if (arg.startsWith('+')) return true;
  }
  return false;
}

function isForcePush(command) {
  return splitSegments(command).some(isForcePushSegment);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let command = '';
  try {
    const input = JSON.parse(raw);
    command = (input && input.tool_input && input.tool_input.command) || '';
  } catch {
    // Not JSON: fall back to treating the whole stdin as the command text.
    command = raw;
  }

  if (isForcePush(command)) {
    process.stderr.write('Blocked: force-push is not allowed in this project.\n');
    process.exit(2);
  }
  process.exit(0);
});
