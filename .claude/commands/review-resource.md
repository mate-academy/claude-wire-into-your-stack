Review the route file and its test for $ARGUMENTS against this project's conventions. Read the relevant files first, then check each item below and report: PASS, FAIL, or N/A.

## Route file checklist

- [ ] Lives in `routes/<resource>.js`
- [ ] Requires only `express` and `../db/store` — no other imports
- [ ] Uses `express.Router()`
- [ ] Each route has a one-line comment: `// METHOD /path — description.`
- [ ] Every early-exit handler uses `return res.status(...).json(...)`
- [ ] `:id` params are parsed with `Number(req.params.id)`
- [ ] Body fields are destructured at the top of the handler, not inline
- [ ] POST returns 201 on success
- [ ] Missing record returns `{ "error": "<Resource> not found" }` with 404
- [ ] Missing required fields return `{ "error": "..." }` with 400
- [ ] `module.exports = router`

## Store checklist

- [ ] All four helpers exist: `list<Resource>s`, `get<Resource>`, `create<Resource>`, `update<Resource>`
- [ ] `get<Resource>` returns `undefined` (not null) when not found
- [ ] `update<Resource>` returns `undefined` when the record is missing
- [ ] New functions are added to `module.exports`
- [ ] At least one seed record exists for this resource

## `server.js` checklist

- [ ] Router is required alongside the other requires
- [ ] Mounted with `app.use('/<resource>', <resource>Router)`

## Test file checklist

- [ ] Lives in `tests/<resource>.test.js`
- [ ] Uses `node:test` and `node:assert` — not Jest, Mocha, or Chai
- [ ] Uses `supertest` against the imported `app`
- [ ] Calls `store.reset()` in `test.beforeEach`
- [ ] No `describe` blocks — flat `test()` calls only
- [ ] Covers: list (200), get missing (404), create (201 + body), update (200 + body), update missing (404)

## Output format

For each section, list only the FAILs with a one-line explanation of what's wrong. If everything passes, say so. End with whether `npm test` passes.
