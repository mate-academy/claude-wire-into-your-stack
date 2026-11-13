---
description: Summarize a source file into a destination file
argument-hint: <source-file> <destination-file>
allowed-tools: Read, Write
---

Summarize a file into another file.

- Source file: `$1`
- Destination file: `$2`

Steps:
1. If either argument is missing, stop and reply with the usage: `/sumarize <source-file> <destination-file>`.
2. Read the source file `$1`. If it doesn't exist, say so and stop.
3. Write a concise summary of it (key points, main structure, important details; roughly 10-20% of the original length) to `$2`, in Markdown.
4. Don't modify the source file. If `$2` already exists, ask before overwriting it.
5. Reply with one line confirming the destination path.
