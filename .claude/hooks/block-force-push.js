// PreToolUse hook for Bash: block `git push` commands that force-push
// (--force, --force-with-lease, -f, or a +refspec). Exit code 2 denies the call
// and sends stderr back to Claude.
let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const command = JSON.parse(input).tool_input?.command ?? '';
  if (!/\bgit\s+push\b/.test(command)) return;

  const forced =
    /\s--force(-with-lease|-if-includes)?\b/.test(command) ||
    /\s-[a-zA-Z]*f[a-zA-Z]*(\s|$)/.test(command) ||
    /\s\+\S/.test(command);

  if (forced) {
    console.error('Blocked: force-pushing is not allowed in this project. Use a regular `git push`.');
    process.exit(2);
  }
});
