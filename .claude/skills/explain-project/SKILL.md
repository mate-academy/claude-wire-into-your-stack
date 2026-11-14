---
name: explain-project
description: Use when the user asks to explain how something in this project works — how an endpoint behaves, what a route/store helper/server setup does, which commands run or check it, or what the tests cover (e.g. "how does PUT /users work?", "explain the health check", "what's tested for users?"). Not for writing or changing code, fixing bugs, or reviewing a diff.
---

# Explaining how something works in this project

Read the relevant code before answering — never explain from memory:
- the route handler in `routes/<resource>.js` and how it is mounted in `server.js`
- any helpers it calls in `db/store.js`
- the matching tests in `tests/<resource>.test.js`
- `docs/api.md` if it documents the endpoint
- `package.json` scripts for the commands

Then answer in exactly this format:

## Topic
What was asked about, in one line, then how it works step by step:
- request → route (file:line) → validation → `db/store.js` helper → response
- status codes it can return (`200`/`201`/`400`/`404`) and when
- error shape (`{ "error": "message" }`) where relevant

## Commands
Commands to see or verify it, each with a one-line purpose:
- `npm run dev` — start the API on port 3000
- a `curl` example that exercises the endpoint (e.g. `curl -i localhost:3000/users/1`)
- `npm test` — run the test suite (`node --test`); add `--test-name-pattern="<name>"` to run only the related tests
- `npm run lint` — lint the code

Only list commands that apply to the topic.

## Tests
A list of the existing tests that cover this topic, quoted by their test name with file:line, and what each asserts.
Then a short **Not covered** list naming behaviour from the Topic section that no test checks (e.g. a `400` branch with no test).
If nothing is tested, say so plainly.
