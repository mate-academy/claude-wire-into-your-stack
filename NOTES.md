1. I connected a file server that accesses a directory of my dropbox that I use often.
2. The skill is to create a PR against the original repository on Github, as I have noticed that Claude would usually create one agains my own main branch. 
3. The command is /list-docs which (sub-)directories of the repository of the MCP server. The subdirectory can be passed as argument 1
4. I added a hook to deny deletions of files by Claude.
5. I headlessy ran  "claude -p 'list root directory of MCP server'" 