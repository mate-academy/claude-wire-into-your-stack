---
name: add-api-endpoint
description: Use when adding or changing an HTTP endpoint or resource in this Express API (a new route file under routes/, a new GET/POST/PUT/PATCH/DELETE handler, or a new resource like /posts or /products). Covers the route file, db/store.js helpers, mounting in server.js, tests in tests/, and docs/api.md. Not for config, CI, or non-route refactors.
---

# Adding an endpoint to the Course API

Follow these steps every time a route is added or changed. They match the conventions in `CLAUDE.md`.

## 1. Data goes through `db/store.js`
- Routes never keep state. Add a plain function to `db/store.js` for each data operation (e.g. `listPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`).
- Seed new collections inside `seed()` so `store.reset()` restores them for tests.
- Export the new functions in `module.exports`.
- Return `undefined` when a record is missing — the route decides the status code.

## 2. One route file per resource
- New resource → new file `routes/<resource>.js` exporting an `express.Router()`.
- Mount it in `server.js`: `app.use('/<resource>', <resource>Router);`
- Put a one-line comment above each handler: `// METHOD /path — what it does.`

Handler shape:

```js
// POST /posts — create a post. Requires title.
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const post = store.createPost({ title });
  return res.status(201).json(post);
});
```

## 3. Status codes and errors
- Validate input in the route. Bad input → `400`.
- Record not found → `404` with `{ error: '<Resource> not found' }`.
- Create → `201` with the created record. Delete → `204` with no body.
- Every error body is exactly `{ "error": "message" }` — no other shape.
- Convert `:id` params with `Number(req.params.id)`.

## 4. Tests in `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest`; import `app` from `../server` and `store` from `../db/store`.
- Start with `test.beforeEach(() => store.reset());`
- Cover the happy path plus each `400` and `404` branch.

## 5. Docs
- Add the endpoint to `docs/api.md` in the same style: heading `### METHOD /path`, one or two sentences, and the status codes it returns.

## 6. Verify
Run `npm run lint` and `npm test`; both must pass before you finish.
