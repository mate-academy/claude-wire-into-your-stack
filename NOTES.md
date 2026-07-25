we connected the playwright-mcp server to test our UI
we created a skill to review and consolidate functions when the user says things like "make sure to reuse functions", "cleanup functions", "consolidate duplicates"
we added a command skill to Summarize what changed in the working tree and recent commits, list all uncompleted TODOs and open change requests, and report without making any changes. Use when the user says "/summarize", "summarize what changed", "what's changed", "what's left to do", or similar.
we setup a hook to ensure all functions are in a try catch block as defined in our error_handling.md file. it is a PostToolUse on edit or write functions. I tested it and it worked.
I ran claude -p "summarize this project" --allowedTools "Read". It worked as it was read only, nothing was changed.

