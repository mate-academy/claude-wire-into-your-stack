# NOTES.md

## MCP
Installed filesystem MCP server for the project scope only. 
Allowed mcp__filesystem__read_file permission in settings.json file

## Command
Implemented a command to recognize all existiting API endpoints and writes the URLs for them.

## Hooks
Implemented the hook thats block the git push --force. A dedicated block-force-push.js script is written for this purpose.

## Headless execution of the claude cli
Executed command (allowing it Read only operation)
`claude -p "Summarize the last edits in the project" --allowed-tools "Read"`
