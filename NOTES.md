
Which server did you connect, why is it useful here, and what did your permission rule allow?
> I connected the filesystem MCP server. I find it useful to read files in the docs folder for API reference. The permission allowed read_file, read_text_file, and read_multiple_files.

What repeated way of working did your skill capture, and how did you word the description so it fires?
> I capture commit message skill to format and write commit messages. I worded it to fire when requesting to commit, commit and write message, and commit and push. 

What command did you add, and what makes it worth a shortcut?
> The command I added was /find-todos that can run on all files or on specific files. I find this command worth it if I forgot where I left off and need to find the todo items across files, which I would do often for late night projects.

What hook did you set — does it react or prevent, and on which event?
> The hook I added was to run on PostToolUse npx eslint. It reacts to Edit Write MultiEdit.

What did you run headless, and what did you lock down?
> I ran `claude -p "Run the test suite and the linter, then summarize the results in 3 bullets. Do not modify any files." --allowedTools "Bash(npm test)" "Bash(npm run lint)"` I locked it down to Bash(npm test) and Bash(npm run lint).
