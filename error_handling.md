# Error Handling

## Standard

Every function in this codebase wraps its body in a `try/catch`. When an error is caught, it is written to `error.log` (project root) via the shared logger in `utils/logger.js`, then re-thrown or converted to a 500 response depending on context.

## Log format

```
[<ISO timestamp>] [<function name>] <error message>
```

Example:

```
[2026-07-25T14:03:22.451Z] [createUser] Cannot read properties of undefined (reading 'push')
```

## Logger

`utils/logger.js` exports a single function:

```js
logError(fnName, err)
```

It appends one line to `error.log` using `fs.appendFileSync`, so no async coordination is needed and entries are never interleaved.

## Behavior by layer

| Layer | On error |
|---|---|
| `db/store.js` functions | Log, then re-throw so the caller handles the response |
| Route handlers (`routes/*.js`) | Log, then return `500 { "error": "Internal server error" }` |
| Helper functions (`parseId`, `sendNotFound`) | Log, then re-throw so the enclosing route handler catches it |

If a helper re-throws into a route handler that also catches, both log entries are written. This is intentional — each entry names the function where the error was observed, giving a lightweight call-path trace without a full stack dump in the log file.

## error.log

- Written to the project root.
- Excluded from git via `.gitignore`.
- Lines are appended; the file is never truncated by the application. Rotate or clear it manually as needed.
