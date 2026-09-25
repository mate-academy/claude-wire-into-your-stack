---
name: australian-spelling
description: Check and correct spelling in written text (docs, README, NOTES.md, comments, commit messages) so it follows Australian/British English conventions instead of American English. Use when the user asks to check spelling, proofread text, or make wording "Australian" or "British" — not for code identifiers, variable names, or general code review.
---

# Australian English spelling check

This project writes prose (README, `NOTES.md`, docs, comments, PR descriptions) in
Australian English, not American English. When asked to check or fix spelling:

1. Scan the requested text (or file) for American spellings and flag/fix them using
   Australian conventions. Common patterns:
   - `-ize` / `-yze` → `-ise` / `-yse` (organize → organise, analyze → analyse)
   - `-or` → `-our` (color → colour, favorite → favourite, behavior → behaviour)
   - `-er` → `-re` (center → centre, meter → metre)
   - `-log` → `-logue` (catalog → catalogue, dialog → dialogue)
   - `-led`/`-ling` double consonant (canceled → cancelled, traveling → travelling)
   - `defense`/`offense` → `defence`/`offence`
   - `gray` → `grey`
2. Leave code untouched: variable/function names, package names, API fields, CLI
   flags, and third-party library terms keep their original spelling even if it's
   American (e.g. don't rename a `color` CSS property or an `initialize()` method).
3. Report each change as `original → corrected` (or apply the edit directly if the
   user asked you to fix the file), and note if a term was left alone because it's
   a code identifier rather than prose.
