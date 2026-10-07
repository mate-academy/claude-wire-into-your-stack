<!-- Which server did you connect, why is it useful here, and what did your permission rule allow? -->
 filesystem server, lets Claude read files in the project, permission allows read_file and read_directory
<!-- What repeated way of working did your skill capture, and how did you word the description so it fires? -->
express-response skill for POST route handlers, triggers when adding a new Express POST route
<!-- What command did you add, and what makes it worth a shortcut? -->
review command that checks diffs against a checklist
<!-- What hook did you set — does it react or prevent, and on which event? -->
 prettier runs after Edit, npm run lint runs after Write (PostToolUse, reacts)
<!-- What did you run headless, and what did you lock down? -->
claude -p "read the server.js file and tell me what routes are registered" --allowedTools mcp__filesystem__read_file
allowed read only access because that's all that was neeeded
