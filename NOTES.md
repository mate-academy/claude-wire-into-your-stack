# Wire Claude Into Your Stack - Notes

## Server (MCP)

Connected filesystem MCP server to allow Claude to read project documentation in the docs folder.

Permission rule only allows read-only operations:
- read_file
- list_directory

This prevents accidental file modification.

## Skill

I created a skill called express-route.

It captures the project's repeated pattern for:
- Express routes
- JSON responses
- Route tests

The description is focused on route and endpoint creation so the skill triggers only for those requests.


## Command

Command: /review

This command reviews a specified file for:
- bugs
- readability
- naming
- edge cases

I added $ARGUMENTS so the same command can be used for any file in the project.

## Hook

Hook:
- Event: PostToolUse
- Matcher: Write|Edit
- Command: npm run lint

The hook automatically runs lint after every file edit to catch issues immediately.

## Headless Task

Command:

claude -p "Summarize this project in 3 bullet points" \
  --allowedTools Bash(ls) \
  --allowedTools Bash(cat)

Allowed tools:
- Bash(ls)
- Bash(cat)

Reason:

The task required reading the project structure and file contents to generate an accurate summary.

I allowed only:
- Bash(ls) to inspect the repository structure
- Bash(cat) to read project files

This limited Claude to the minimum read-only permissions required for the task.
