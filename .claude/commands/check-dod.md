---
description: Verify the Definition of Done checklist in README.md against the actual repo state, and update the checkboxes to match
allowed-tools: Read, Grep, Edit(README.md), Bash(git status *), Bash(git log *)
---

Read the "### Definition of done" checklist in README.md — treat its current wording as the source of truth for what "done" means, since it can change over time. Do not hardcode or assume what the items are; read them fresh each time.

For each checkbox item:
1. Split its wording into the part that's a durable fact about the repo (a file exists, is committed, is configured or written a certain way) and any part that describes a one-off action or experience outside the repo (you used something, you confirmed something fires, you ran something, it worked as intended). Most items are a mix of both.
2. Verify the durable, repo-inspectable part with your tools — don't take the existing checkbox state, or any prior conversation, on faith. Re-check it from scratch against the repo as it is right now.
3. For the one-off/experiential part: if the item's own wording is *itself* asking for a written record (e.g. it names a file like `NOTES.md`, or it's the kind of action — like a headless run — that leaves no trace anywhere except however you chose to document it), then that record is the evidence, and its absence means the item isn't done. Otherwise, don't withhold the checkmark just because the one-off action has no separate paper trail alongside working, correctly-configured evidence — once the durable part is solid, treat the described action as having happened, and say in your summary that this part is taken on your word rather than independently verified.
4. Set the checkbox to `[x]` once you've resolved both parts this way; otherwise leave (or set) it to `[ ]` and say what durable evidence is missing.

Only edit the "### Definition of done" section of README.md. Leave the rest of the file — including the "Before you submit" checklist — untouched; that one needs human judgment about the PR itself, not something you can verify from repo state.

When you're done, report a short summary: which boxes you flipped and why, and which remain unchecked along with what evidence is missing. If you're unsure whether something counts as done, leave it unchecked and say what's missing rather than guessing.
