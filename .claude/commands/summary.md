---
description: Summarize the work done in this session since the last /summary
---

Summarize what has happened in this conversation since the last time this command
was run.

1. Scan back through the conversation for the most recent prior assistant message
   that starts with the heading `## Session summary`. That message's turn is the
   boundary — only cover what happened *after* it.
   - If no such message exists, this is the first summary: cover the whole session
     from the start.
2. Do not re-derive facts by re-reading files or re-running commands — this is a
   recap of what already happened in the conversation, not a fresh investigation.
3. Write the summary as:

   ## Session summary

   - **Done:** what was built/changed/decided, as concrete bullets (files touched,
     commands run, artifacts created, decisions made and why). Skip narration of
     dead ends or intermediate steps that didn't lead anywhere.
   - **Open:** anything left unresolved, offered but not yet actioned, or explicitly
     deferred by the user — omit this section if nothing is open.

Keep it tight — a handful of bullets, not a transcript. Always start the reply with
the exact heading `## Session summary` so the next `/summary` invocation can find
this one as its boundary.
