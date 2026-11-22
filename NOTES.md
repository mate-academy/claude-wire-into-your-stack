# NOTES: Claude setup for this repo

Environment used for checks: Windows 11, Claude Code 2.1.330, Node 26, npm 11.

## 1. MCP server: filesystem (project scope)

- **Server:** `@modelcontextprotocol/server-filesystem`, pinned to **2.4.0**, started with `npx -y`. Defined in `.mcp.json`.
- **Why:** lets Claude read the API reference in `docs/` through MCP instead of the built-in file tools. No API keys. No Python or `uv` needed, since the repo already needs Node.
- **Scope:** only `./docs` is an allowed directory. `--read-only` is set, so the server registers only read tools.
- **Verified:**
  - `--read-only` exists in 2.4.0. Checked in the package README and source (`readOnlyHint: true` on read tools).
  - At runtime, a ToolSearch for "write/edit" returned only read tools: `read_file`, `read_text_file`, `read_media_file`, `read_multiple_files`, `list_directory`, `list_directory_with_sizes`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`. No `write_file`, `edit_file`, `move_file`.
  - `claude -p` read `docs/api.md` through `mcp__filesystem__read_text_file` (stream-json shows the tool call; no errors). Output: `## Health`, `## Users`.
- **Windows:** plain `npx` works here. The `cmd /c` wrapper is not used, so the config is not Windows-only.
- **Interactive check (done):** in an interactive session, `/mcp` shows `filesystem` as connected with 10 tools. After that, `mcp__filesystem__read_text_file` read `docs/api.md` successfully.
- **Not verified:** macOS/Linux teammates (plain `npx` should work there too, but I have not run it). A relative path (`./docs`) was verified only because the server resolved the file on this machine.

## 2. Permissions

`.claude/settings.json` allows only:
- `mcp__filesystem__read_text_file`
- `mcp__filesystem__list_directory`

Not allowed: wildcard `mcp__filesystem__*`, global `Read`, `Bash(npm test)`, `bypassPermissions`, `--dangerously-skip-permissions`. Each MCP tool name was confirmed from the server's source before listing.

## 3. Skill: `express-route-conventions`

- **File:** `.claude/skills/express-route-conventions/SKILL.md`.
- **Description** names two triggers: adding or changing a route, and planning a new endpoint. Planning is included on purpose, so the skill fires on a "plan a new endpoint" request.
- **Verified:** a headless prompt asked to plan `GET /users/search` **without naming the skill**. The run called the `Skill` tool with `express-route-conventions`. The plan then mentioned the route-ordering issue: `GET /:id` must not catch `/search`. No files were changed.

## 4. Command: `/review-api`

- **File:** `.claude/commands/review-api.md`, with `$ARGUMENTS` for the file path.
- **Verified:** `claude -p "/review-api routes/users.js"` ran the command and produced a PASS/FAIL checklist (5 PASS, 1 FAIL). No files were changed.
- **Finding (app code, not changed):** `PUT /users/:id` only checks that fields are `undefined`, so `{ "name": "" }` is accepted, while `POST` rejects empty values. This is a real gap, left for the team to decide.
- **Note:** Claude Code loads commands through the skill mechanism. The `review-api` command also appeared as a skill call in the run output.

## 5. Hook: PreToolUse guard for Bash

- **Config:** `PreToolUse`, matcher `Bash`, command `node "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard-bash.js"`. `node` is used directly because npm `.cmd` shims cannot take arguments on Windows.
- **Blocks** (exit 2) when the command text contains:
  - `rm` with a recursive flag (`-r`, `-R`, `-rf`, `-fr`, `--recursive`)
  - `Remove-Item` with `-Recurse`
  - `rd` or `rmdir` with `/s`
  - `del` with `/s`
- **Does NOT block:** `find -delete`, `git clean`, deletion from Python or Node, or other tools that remove files. It is a guard against common accidental recursive deletes, not a sandbox.
- **Scope: Bash tool only.** The matcher is `Bash`, so a separate PowerShell tool call is not checked. A `Remove-Item -Recurse` run through PowerShell gets no guard. The patterns for `Remove-Item` only take effect when the command goes through the Bash tool.
- **Known false positive:** the guard matches the text anywhere in the command, so a quoted mention such as `echo "rm -rf"` is also blocked. Observed during testing.
- **Verified:**
  - The script was checked against 12 cases (`rm -r`, `-R`, `-fr`, `--recursive`, chained `&&`, `Remove-Item -Recurse`, `rd /s`, `rmdir /S`, and allowed cases `rm -f file`, `rm file-r.txt`, `npm test`, `find -delete`). All 12 matched the expected exit codes.
  - **Real trigger through Claude:** a headless run was asked to delete a temp directory with `rm -rf`. The hook error appeared in the Bash tool result, and the directory and its file remained. The temp directory is `%TEMP%\hook-test-dir` and is safe to delete.

## 6. Headless task: npm test summary

```
claude -p "Run npm test once and reply with a 3-line report: total tests, passed, failed. Do not modify any files." --tools "Bash" --allowedTools "Bash(npm test)"
```
- `--tools "Bash"` limits the built-in tools to Bash.
- `--allowedTools "Bash(npm test)"` auto-approves only that command.
- No `--bare`, so the project hook and MCP server still load.
- No `bypassPermissions` or `--dangerously-skip-permissions`.
- **Verified:** output was `Total tests: 5, Passed: 5, Failed: 0`; `git status` showed no changes from the run.
- **Note:** `claude` is not on PATH on this machine. The full path `%USERPROFILE%\.local\bin\claude.exe` was used.
- **Observed:** in one headless run, `ls` and `cat` Bash commands ran without an allow rule. Read-only commands seem to be auto-approved; not investigated further.

## 7. Repo checks

- `npm ci`: installed.
- `npm test`: 5 pass, 0 fail.
- `npm run lint`: clean.
- `npm audit`: 3 vulnerabilities in transitive dependencies of Express (`body-parser` high, `proxy-addr` critical, `qs` moderate). **Not fixed:** `npm audit fix` changes `package-lock.json`, which is out of scope for this task. Recommend a separate change.

## 8. Clean copy of the committed branch (this machine)

- Source: `git archive` of `feat/claude-stack` into an empty scratch folder. No `settings.local.json`.
- `npm ci`, `npm test`: 5 pass, 0 fail. `npm run lint`: exit 0.
- **MCP, headless:** `claude -p` read `docs/api.md` through `mcp__filesystem__read_text_file` with no error; the result contained the real file.
- **MCP, approval:** `claude mcp list` in that folder shows `filesystem` as "Pending approval (run `claude` to approve)". Approval is stored per folder, so a new clone needs one interactive approval.
- **Hook:** `guard-bash.js` gave the expected exit code on 11 of 11 sample commands, including the `echo "rm -rf"` false positive.
- **Skill:** a headless planning request for a partial user update, with no skill name given, called `Skill` with `express-route-conventions`.
- **/review-api routes/users.js:** the run applied the PUT partial-update rule (at least one field, not both). The partial-PUT rule (one field is enough) reported PASS. This does not clear the empty-string finding in section 4.

## 9. Fresh clone check (Windows 11)

Clone path: `C:\Users\angie\AppData\Local\Temp\claude-fresh-1795357186\fresh`. This is a separate clone from the `git archive` copy in section 8.

Results below come from the earlier check of this fresh clone. **These checks were not repeated for this note.**

- **Tests:** `npm test` 5 pass, 0 fail.
- **Lint:** `npm run lint` exit 0.
- **MCP:** `filesystem` was approved interactively, then `mcp__filesystem__read_text_file` read `docs/api.md` and Claude listed its five routes.
- **Command:** `/review-api` ran.
  - **PASS** covers only the partial-PUT rule: one field is enough.
  - **Accepting an empty string** is a separate finding, already recorded in section 4. The PASS does not mean all review criteria passed.
- **Skill autoload:** the `express-route-conventions` skill loaded automatically.
- **Hook:** a real Bash deletion attempt of the temp folder `hook-target` through Claude was blocked by the hook. The folder and `sub/file.txt` were left unchanged.
- **Not checked:** other operating systems (macOS, Linux).

## Not done / not verified

- Fresh clone run on another machine. The clean copy above was made on this machine only.
- Hook behavior on macOS/Linux.
