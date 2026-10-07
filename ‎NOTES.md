# Project integrations

## Execution status
Configurations were created and checked with Codex. Claude Code is authenticated but requires a paid plan, so automatic skill selection, slash-command execution, and the headless Claude response below are theoretical and have not been observed. No Claude execution is claimed.

## MCP
The official filesystem server is pinned at 2026.8.31 and scoped to `${PWD}/docs` in project `.mcp.json`. Start Claude from the repository root so PWD resolves to this checkout. It helps read the API contract before reviewing routes. Only `mcp__docs__read_text_file` and `mcp__docs__list_directory` are pre-approved; write/edit tools are explicitly denied. No credentials are needed. A real standalone MCP initialize/tools-call exchange successfully read docs/api.md (816 characters). This verifies the server outside Claude, not Claude's permission integration.

## Skill
`api-change-review` captures repeated Express route/store review: JSON status/error contracts, invalid input, missing users, stable IDs, existing Node test/Supertest style, and evidence-based findings. The description explicitly names API review and endpoint edge cases. Expected natural trigger: “Review the changed user endpoint for edge cases.” Automatic selection in Claude remains unverified.

## Command
`/review-api routes/users.js` substitutes `$ARGUMENTS` into a repeatable review checklist and asks for actual test/lint results without editing or pushing. This makes a frequent QA task concise. The saved prompt and target were reviewed manually; the Claude slash command was not run.

## Hook
Project `PreToolUse`, matcher `Bash`, runs block-publish.py. It prevents a direct `npm publish` by returning exit 2. Synthetic JSON input for npm publish returned 2; npm test returned 0. The proposed commands were never executed. This educational regex is not a complete shell security boundary. Python 3 must be installed; Claude event invocation remains unverified.

## Headless task (theoretical)
Suggested invocation: `claude -p "Summarize docs/api.md in three bullets; do not modify files" --allowedTools "Read,mcp__docs__read_text_file" --tools "Read,mcp__docs__read_text_file" --max-turns 3`.
`--allowedTools` pre-approves the necessary read tools; `--tools` restricts the available tool set. Neither edits nor Bash are needed. A turn cap bounds the loop. Expected summary: health endpoint; user list/get/create; partial user update with JSON errors. This invocation and output are theoretical due to the paid-plan restriction.

## Actual verification
`npm ci`, all 5 existing tests, and `npm run lint` passed. Application code and course tests were not changed. The starter dependency audit reports 7 vulnerabilities; dependency upgrades were outside this configuration task.
