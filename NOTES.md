# Notes of what I did

- I've connected project directory as the MCP server so it can read it
- I've added create-test command to create a unit tests for the specified source file. This way I can create tests for the source code that I think needed the tests.
- I've added a PostToolUse hook for each Write|Edit it will trigger lint check.
- I've added an `add-endpoint` project skill (`.claude/skills/add-endpoint/SKILL.md`) that captures the repeated workflow for adding/changing an API route in this project: update `db/store.js`, add/edit the route in `routes/`, use the project's `400`/`404`/`{ "error": "message" }` conventions, mount new routers in `server.js`, and update `docs/api.md`. The description names concrete trigger phrases ("add a DELETE endpoint for users", "add a products resource", "add a new route") so it fires when I ask for an endpoint in plain language, without naming the skill.
- commnd that I've run ```claude -p "Check all the files for leaked credentials. If found any then show me the list of such files." --allowedTools "Read,Glob,Grep"```. I made sure that this command only allow to read files.
