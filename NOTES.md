# Which server did you connect, why is it useful here, and what did your permission rule allow?

I connected the sequential thinking MCP server. It is useful for approaching complex problems with sequential thoughts. Largely, I added it as an exercise rather than choosing it for its usefulness. It has one tool, sequentialThinking, that I allowed in the permission rules. 

# What repeated way of working did your skill capture, and how did you word the description so it fires?
I added a test-driven development skill. It builds failing tests first, before implementing any changes to the code.
I added "Use when the user asks to build a new feature" to the description so that if fires when the user mentions a new feature. It also runs if the user mentions "TDD" or similar.


# What command did you add, and what makes it worth a shortcut?
I added a simple "/run-tests" command, which runs runs the suite of tests using "npm test". It slightly speeds up the process of typing out the command each time.



# What hook did you set — does it react or prevent, and on which event?
I added a PostToolUse hook, it reacts on writes or edits, to run a linter across the codebase.


# What did you run headless, and what did you lock down?
`claude -p "New feature: add delete user to routes/users.js. " --allowedTools "mcp__bigThink__sequentialthinking,Read,Write,Edit,Bash(npm test:*),Bash(npm run lint:*)"`

I gave it a relatively big permission space: allowing it to make changes to the code, and run tests, and lint also.