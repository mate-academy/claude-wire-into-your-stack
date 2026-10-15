- Which server did you connect, why is it useful here, and what did your permission rule allow?

I chose the Context7 server because it solves the problem of working with up-to-date library documentation. Natively, Claude does not always reliably follow the full chain of actions required to determine which package and version are used in the project before looking up the relevant documentation page. The MCP server provides encapsulated logic for working with documentation and ensures that the source and documentation version are consistent for each request.
I configured permissions for mcp__context7__resolve-library-id and mcp__context7__get-docs.

- What repeated way of working did your skill capture, and how did you word the description so it fires?

I captured the workflow for creating routes according to the API documentation contract, including automatic documentation updates. The description was formulated so that the skill is triggered whenever any operation is performed on route code.

- What command did you add, and what makes it worth a shortcut?

I added a command that checks whether the code is synchronized with its documentation and test coverage. Its main value is saving time and avoiding the need to explain to Claude each time which principles and criteria should be used to review the code.

- What hook did you set — does it react or prevent, and on which event?

I configured two preventive hooks:
The first prevents Claude from reading .env files through the Read tool.
The second prevents git push --force commands through the Bash tool.
Prevent (PreToolUse) was chosen over react (PostToolUse) because both risks - leaking secrets into context and rewriting shared git history — are only safe to stop before they happen, not after.

- What did you run headless, and what did you lock down?
I ran Claude headless with:
`claude -p "/review-changes" --allowedTools "Read" "Bash(git diff:*)"`
I locked down the available tools to Read and Bash(git diff:*), so the review could only read files and inspect the Git diff. No other tools or write operations were allowed.
