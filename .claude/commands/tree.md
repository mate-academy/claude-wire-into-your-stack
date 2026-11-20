---
description: Show the file tree of the project or a given directory, including dotfiles but excluding .git
argument-hint: [directory]
allowed-tools: Bash(tree -a -I .git:*)
---

## Tree

!`tree -a -I .git $1`

Show the tree above to the user as-is, in a code block. Don't run any other commands.
