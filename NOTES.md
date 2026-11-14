## Setup: GitHub MCP server

`.mcp.json` connects the GitHub MCP server at project scope. The token is **not**
committed — the config reads it from your environment:

    "Authorization": "Bearer ${GITHUB_PAT}"

1. Create a **fine-grained personal access token** on GitHub
   (Settings → Developer settings → Fine-grained tokens):
   - Repository access: only this repository
   - Permissions (read-only): Issues, Pull requests, Contents, Metadata
2. Export it in your shell **before** starting Claude Code
   (add to `~/.zshrc` / `~/.bashrc` to make it permanent):

       export GITHUB_PAT=github_pat_xxx

3. Start `claude` in the repo, approve the `github` server when prompted,
   and run `/mcp` — it should show `github` as connected.

Never paste the token into `.mcp.json` or `.claude/settings.json`; both are committed.
If `/mcp` shows the server as failed, check `echo ${GITHUB_PAT:+set}` prints `set`
and restart `claude`.


## Skill ##
Added a skip to ask-format - when user ask about some tools, features in the project, to know how it works, which functionality is covered by tests

## Commands ##
To summarize changes was was made

## Hook ##
Summarize was changes was made in the commit


## allowedTools ##
Run to ask was was made in this project with allowed permission read only and made no changes
