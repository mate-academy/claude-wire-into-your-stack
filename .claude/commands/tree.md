---
description: Show the file tree of the project or a given directory, including dotfiles but excluding .git and gitignored files
argument-hint: [directory]
allowed-tools: Bash(node .claude/scripts/tree.js:*)
---

## Tree

!`node .claude/scripts/tree.js $1`

Show the tree above to the user as-is, in a code block. Don't run any other commands.
