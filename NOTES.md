# NOTES

* **MCP Server (.mcp.json): filesystem**
  `npx @modelcontextprotocol/server-filesystem`
  I chose the filesystem server because this is an Express API project where most of the work is reading and exploring existing route files, configs, and docs. It lets Claude safely read files and list directories in the project without giving it write access, which is enough for review and API design tasks.

* **Permission allow:**
  `mcp__filesystem__read_file`
  `mcp__filesystem__list_directory`
  I allowed only these two tools because they follow the principle of least privilege. Claude needs to read files and explore the folder structure to understand the API, but it does not need to create, edit, or delete files for this task, so I did not allow write tools.

* **Skill (.claude/skills/api-route/SKILL.md):**
  `create API route`
  I created this skill to standardize how new API routes are created in this project. It ensures Claude follows the same Express pattern, folder structure, and naming conventions every time, instead of inventing a different structure in each conversation.

* **Command (.claude/commands/review.md):**
  `/review`
  I added the `/review` command to make code reviews repeatable. Instead of writing a long prompt each time, I can run `/review` and get a consistent check of the project with a report, which saves time and keeps the review criteria the same.

* **Hook (.claude/settings.json):**
  `PostToolUse matcher Write runs npm run lint`
  I added this hook so that every time Claude writes a file, lint runs automatically. This catches style and syntax errors immediately after the change, instead of discovering them later when running tests or during review.

* **Headless:**
  `claude -p "Revisa el proyecto y genera reporte"`
  `--allowedTools "mcp__filesystem__read_file, mcp__filesystem__list_directory"`
  I used headless mode because it allows running Claude from the terminal or CI without an interactive chat. I limited `--allowedTools` to the same two read-only filesystem tools so the automated run can inspect the project but cannot modify it.

* **Tools allowed:**
  `mcp__filesystem__read_file,`
  `mcp__filesystem__list_directory`
  These are the only tools needed for reading and exploring the project. Limiting the tools reduces risk and makes the behavior of Claude predictable for this Express API.
