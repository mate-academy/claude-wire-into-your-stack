# Project Notes - Wiring Claude

- **Which server did you connect, why is it useful here, and what did your permission rule allow?**
  Connected the official `mcp-server-fetch` to pull API documentation and references directly into the context. The permission rule in `.claude/settings.json` strictly scopes down access to `mcp__fetch__fetch`.
- **What repeated way of working did your skill capture, and how did you word the description so it fires?**
  Created an Express route standard skill (`express-route-standard`) capturing controller separation and try/catch error formatting. The description specifically targets creating or modifying Express routes and controllers.
- **What command did you add, and what makes it worth a shortcut?**
  Added `/review-route` command to quickly evaluate route implementations against project error handling and status code standards.
- **What hook did you set — does it react or prevent, and on which event?**
  Set a `PostToolUse` hook reacting after `Edit` events, automatically running `npx prettier --write $FILE` to keep code formatted.
- **What did you run headless, and what did you lock down?**
  Ran a headless task using `claude -p` with `--allowedTools "Edit,Bash"` to pre-approve only file editing and safe terminal commands.