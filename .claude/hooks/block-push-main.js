#!/usr/bin/env node
// PreToolUse hook for Bash: blocks any `git push` that could update main.
// Exit 2 (with a message on stderr) blocks the call; exit 0 allows it.
//
// Covers: refspecs (main, +main, HEAD:main, refs/heads/main, HEAD/@ while on
// main, wildcard destinations), --all/--mirror, bare pushes (current branch,
// upstream branch, remote.<name>.push, push.default=matching), git global
// options (-C, -c, --git-dir, ...), git aliases, chains (&&, ||, ;, |),
// subshells, `sh -c "..."`, `eval`, $(...) and `...`. Pushes whose target
// cannot be determined statically (e.g. `git push origin $BRANCH`) are
// blocked, because the hook cannot prove they are safe.

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const PROTECTED = "main";
const MAX_DEPTH = 5;
const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh", "fish", "pwsh", "powershell"]);
const GIT_OPTS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--super-prefix", "--config-env"]);
const PUSH_FLAGS_WITH_VALUE = new Set(["--repo", "--receive-pack", "--exec", "-o", "--push-option"]);

function git(cwd, ...args) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

const baseName = (token) => path.basename(token).replace(/\.exe$/i, "");
const isDynamic = (token) => token.includes("$") || token.includes("`");

// Split a shell string into simple commands (arrays of tokens), respecting
// quotes. Command substitutions are returned in `nested` to be checked too.
function parse(src) {
  const commands = [];
  const nested = [];
  let tokens = [];
  let cur = "";
  let has = false;
  let quote = null;

  const endToken = () => {
    if (has) tokens.push(cur);
    cur = "";
    has = false;
  };
  const endCommand = () => {
    endToken();
    if (tokens.length) commands.push(tokens);
    tokens = [];
  };
  const take = (open, close, from) => {
    // Returns the index of the matching close, collecting the inner text.
    let depth = 1;
    let i = from;
    for (; i < src.length; i++) {
      if (open !== close && src[i] === open) depth++;
      else if (src[i] === close && --depth === 0) break;
    }
    nested.push(src.slice(from, i));
    cur += "$(…)"; // Placeholder: marks the token as dynamic.
    has = true;
    return i;
  };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote === "'") {
      if (c === "'") quote = null;
      else cur += c;
      continue;
    }
    if (c === "\\") {
      if (i + 1 < src.length) {
        cur += src[++i];
        has = true;
      }
      continue;
    }
    if (c === "$" && src[i + 1] === "(") {
      i = take("(", ")", i + 2);
      continue;
    }
    if (c === "`") {
      i = take("`", "`", i + 1);
      continue;
    }
    if (quote === '"') {
      if (c === '"') quote = null;
      else cur += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      has = true;
    } else if (/\s/.test(c) && c !== "\n") {
      endToken();
    } else if (";&|()\n".includes(c)) {
      endCommand();
    } else {
      cur += c;
      has = true;
    }
  }
  endCommand();
  return { commands, nested };
}

// Each check returns a reason string when the command must be blocked.
function check(src, cwd, depth = 0) {
  if (depth > MAX_DEPTH) return "command nesting is too deep to verify";
  const { commands, nested } = parse(src);
  for (const inner of nested) {
    const reason = check(inner, cwd, depth + 1);
    if (reason) return reason;
  }
  for (const tokens of commands) {
    const reason = checkCommand(tokens, cwd, depth);
    if (reason) return reason;
  }
  return null;
}

function checkCommand(tokens, cwd, depth) {
  for (let i = 0; i < tokens.length; i++) {
    const name = baseName(tokens[i]);
    if (SHELLS.has(name) || name === "eval") {
      // Anything after a shell/eval may be a script string: check it too.
      for (const arg of tokens.slice(i + 1)) {
        const reason = check(arg, cwd, depth + 1);
        if (reason) return reason;
      }
    }
    if (name === "git") {
      const reason = checkGit(tokens, i, cwd, depth);
      if (reason) return reason;
    }
  }
  return null;
}

function checkGit(tokens, gitAt, cwd, depth) {
  let dir = cwd;
  const aliases = {};
  let j = gitAt + 1;

  // Skip git's global options to find the subcommand.
  while (j < tokens.length && tokens[j].startsWith("-")) {
    const opt = tokens[j];
    if (GIT_OPTS_WITH_VALUE.has(opt)) {
      const value = tokens[j + 1] || "";
      if (opt === "-C") dir = path.resolve(dir, value);
      if (opt === "-c") {
        const m = value.match(/^alias\.([^=]+)=(.*)$/);
        if (m) aliases[m[1]] = m[2];
      }
      j += 2;
    } else {
      j++;
    }
  }
  if (j >= tokens.length) return null;

  let sub = tokens[j];
  let args = tokens.slice(j + 1);
  if (isDynamic(sub)) return "cannot verify a git subcommand built from a variable";

  // Resolve one level of alias (git config or -c alias.x=...).
  const alias = aliases[sub] ?? git(dir, "config", "--get", `alias.${sub}`);
  if (alias) {
    if (alias.startsWith("!")) return check(`${alias.slice(1)} ${args.join(" ")}`, dir, depth + 1);
    const words = alias.split(/\s+/);
    sub = words[0];
    args = [...words.slice(1), ...args];
  }
  if (sub !== "push") return null;
  return checkPush(args, dir);
}

function destOf(refspec, dir) {
  let dest = refspec.replace(/^\+/, "");
  if (dest.includes(":")) dest = dest.split(":").pop();
  dest = dest.replace(/^refs\/heads\//, "");
  if (dest === "HEAD" || dest === "@") dest = git(dir, "branch", "--show-current");
  return dest;
}

function refspecReason(refspec, dir) {
  if (isDynamic(refspec)) return `cannot verify push target "${refspec}"`;
  const dest = destOf(refspec, dir);
  if (dest.includes("*")) return "wildcard push refspecs could update " + PROTECTED;
  return dest === PROTECTED ? `pushing to ${PROTECTED}` : null;
}

function checkPush(args, dir) {
  const positional = [];
  let remoteViaFlag = false;
  let rest = false;

  for (let k = 0; k < args.length; k++) {
    const arg = args[k];
    if (!rest && arg === "--") {
      rest = true;
    } else if (!rest && arg.startsWith("-")) {
      if (arg === "--all" || arg === "--branches" || arg === "--mirror") {
        return `${arg} would push ${PROTECTED}`;
      }
      if (arg === "--repo") remoteViaFlag = true;
      if (PUSH_FLAGS_WITH_VALUE.has(arg)) k++;
    } else {
      positional.push(arg);
    }
  }

  const remote = remoteViaFlag ? "" : positional[0] || "";
  const refspecs = remoteViaFlag ? positional : positional.slice(1);

  for (const refspec of refspecs) {
    const reason = refspecReason(refspec, dir);
    if (reason) return reason;
  }
  if (refspecs.length) return null;

  // No refspec: work out what git would push by default.
  if (git(dir, "config", "--get", "push.default") === "matching") {
    return `push.default=matching would push ${PROTECTED}`;
  }
  const branch = git(dir, "branch", "--show-current");
  if (branch === PROTECTED) return `the current branch is ${PROTECTED}`;
  const upstream = branch && git(dir, "config", "--get", `branch.${branch}.merge`);
  if (upstream && upstream.replace(/^refs\/heads\//, "") === PROTECTED) {
    return `the upstream of ${branch} is ${PROTECTED}`;
  }
  const configured = remote ? git(dir, "config", "--get-all", `remote.${remote}.push`) : "";
  for (const refspec of configured.split("\n").filter(Boolean)) {
    const reason = refspecReason(refspec, dir);
    if (reason) return `remote.${remote}.push: ${reason}`;
  }
  return null;
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let command = "";
  let cwd = process.cwd();
  try {
    const event = JSON.parse(input);
    command = event.tool_input.command || "";
    cwd = event.cwd || cwd;
  } catch {
    process.exit(0); // Not parseable: don't get in the way.
  }

  const reason = check(command, cwd);
  if (reason) {
    console.error(`Blocked: ${reason}. Pushing to ${PROTECTED} is not allowed; push a feature branch and open a PR instead.`);
    process.exit(2);
  }
  process.exit(0);
});
