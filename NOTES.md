# NOTES: Wiring Claude into the repo

## MCP server: Context7 (.mcp.json)
- Added at project scope so everyone who clones the repo gets it
- Picked Context7 because it gives Claude current Express docs and needs no API key, so no secrets in a committed file
- Allowed only its two tools (resolve-library-id, query-docs). Both are read-only, and any new tool it adds will still ask first
- Verified: asked how Express handles errors; it called Context7 with no permission prompt

## Skill: add-endpoint
- Adding routes is the task this project repeats, so I wrote down the house rules (Number() on IDs, JSON errors with an "error" key, data only through db/store, tests on both layers)
- The description uses words people actually say ("add a DELETE /users/:id", "new route"), since that's what makes it fire
- It didn't fire at first: the file was named SKILLS.md, and the opening --- was missing, so Claude couldn't read the description
- Verified: "Add a DELETE /users/:id" showed Skill(add-endpoint) without naming the skill
- CLAUDE.md holds facts that are always loaded; the skill holds a procedure loaded only for endpoint work

## Command: /pr-summary
- Every project ends with a PR, so this is a prompt I'll run every time
- allowed-tools is read-only git (status, diff, log), so it can't commit or push
- Also included /test, which writes tests for a file passed in $ARGUMENTS

## Hooks (.claude/settings.json)
- Main hook: require-tests.js on Stop. Claude can't say "done" while tests are failing. It prevents rather than reacts
- A skill only asks Claude to run tests; a hook runs every time, so it can't be skipped
- Only runs when routes/, db/, tests/ or server.js changed. stop_hook_active prevents an endless loop
- Verified: asked Claude to change the 404 message without updating tests. The hook ran npm test, caught the failure, and sent it back
- Also included: block-main-push.js (PreToolUse on Bash, prevents pushes to main) and format.js (PostToolUse on Edit|Write, runs eslint --fix after edits)

## Headless run
- claude -p "List every route... flag any that have no test." --allowedTools "Read,Grep,Glob"
- Read-only tools because it's a report: look at everything, change nothing
- It listed the routes and said it couldn't run npm test, which shows the scoping worked

## What I learned
- File names and folder depth must be exact. A nested folder and SKILLS.md broke things silently, with no error
- Test each piece by making it fire (or fail), not just by checking the file exists
- Check which repo the lesson uses before opening the PR. My first PR went to last lesson's repo, so the platform never saw it.