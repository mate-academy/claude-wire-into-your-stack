---

name: express-route-conventions

description: Applies this repository's established Express route, db/store.js, validation, response, documentation, and test patterns when working on user routes. Use whenever the user asks to add, modify, fix, or review an Express user route, including related changes in routes/users.js, user helpers in db/store.js, relevant user-route tests, or docs/api.md.

---



# Express Route Conventions



Follow this repository's existing patterns rather than introducing generic Express conventions.



When necessary, inspect `routes/users.js`, `db/store.js`, the relevant user-route tests, and `docs/api.md` before making changes.



## Route structure



- Keep one router file per resource under `routes/`.

- Create the router with `express.Router()`.

- Export the router with `module.exports = router;`.

- Mount a new resource router in `server.js` under its base path when required.

- Paths inside a router are relative to its mount point, such as `/` and `/:id`.

- Keep route handlers inline and synchronous unless the existing project pattern requires otherwise.

- Use arrow-function handlers such as `(req, res) => { ... }`.

- Put a short one-line comment above each route describing the method, path, purpose, and any important constraint.

- Use early returns for validation and error conditions.

- Use `return res...` for every response path, including successful responses.



## Data access



- Route files access application data through:



&#x20; `const store = require('../db/store');`



- Do not maintain application state directly inside route files.

- When a new data operation is needed, add a named synchronous helper to `db/store.js`.

- Export new store helpers through `module.exports`.

- Store lookup helpers return `undefined` when a record is not found.

- Convert a missing store result into a `404` response in the route.

- Keep request validation in the route rather than in the store.

- Update helpers should modify only fields whose values are not `undefined`.



## Validation



- Validate request input in the route before calling the store.

- Convert route IDs with:



&#x20; `Number(req.params.id)`



- Destructure expected request-body fields before validating them.

- For create operations, verify required fields are present.

- For partial updates, distinguish between a missing field and a field whose value is otherwise falsy by checking against `undefined`.

- Reject an update request when none of the supported updatable fields are provided.

- Do not introduce a validation library or a new validation framework unless the user explicitly asks for one or the repository has adopted one.


## Responses and status codes



Follow the response patterns already used by this repository.



- Return successful data directly as JSON with `res.json(...)`; do not introduce a response envelope unless the project already uses one.

- Use `200` for successful reads and updates.

- Use `201` for successful resource creation.

- Use `400` for invalid or missing request input.

- Validation errors should use the project's existing error-body format:



&#x20; `{ error: 'message' }`



- Keep validation messages concise and lowercase where that matches the existing routes, for example:



&#x20; `{ error: 'name and email are required' }`



- Use `404` when a requested user does not exist.

- For a missing user, follow the existing pattern:



&#x20; `{ error: 'User not found' }`



- Do not introduce a different error-response structure unless the project requirements explicitly change.



## Coding style



Match the repository's existing JavaScript style.



- Use CommonJS: `require` and `module.exports`.

- Use 2-space indentation.

- Use single quotes.

- Use semicolons.

- Prefer `const` unless reassignment is required.

- Match the repository's existing trailing-comma style.

- Keep comments short and focused on intent or constraints.

- Do not copy temporary course-history comments such as references to a previous project or lesson into production code.



## Tests



When a route is added or changed:



- Follow the existing user-route test files and patterns already present in `tests/`.

- Use `node:test`, `node:assert`, and `supertest` when those are the existing project tools.

- Test against `require('../server')`.

- Preserve the existing `test.beforeEach(...)` reset/setup pattern.

- Prefer the project's existing flat `test(...)` structure rather than introducing `describe` blocks if the current suite does not use them.

- Keep each test focused on one behavior.

- Assert the HTTP status and the important response-body fields.

- Follow existing fixture conventions for missing records, including the project's established missing-user ID if one is already used.

- Cover the successful path and the relevant validation or missing-record paths for the route being changed.

- Do not rewrite unrelated tests.


## Documentation



For a new or changed API route:



- Update `docs/api.md` when the repository uses it to document endpoints.

- Document the HTTP method and path.

- Briefly describe the request body or parameters when applicable.

- Document the successful response.

- Mention important validation and error responses when consistent with the existing documentation style.



## When reviewing a route



Check the implementation against the conventions above.



In particular, look for:



- direct state manipulation inside a route instead of using `db/store.js`;

- missing request validation;

- incorrect ID conversion;

- missing early `return`;

- incorrect HTTP status codes;

- an error body that does not match `{ error: 'message' }`;

- response structures inconsistent with neighboring routes;

- missing or inconsistent store helpers;

- missing relevant tests;

- missing API documentation updates; and

- style inconsistent with the rest of the repository.



Report concrete deviations rather than recommending unrelated architectural changes.



## Before finishing



Before considering route work complete:



1. Review the changed route against neighboring routes in `routes/users.js`.

2. Review related helpers in `db/store.js`.

3. Check the relevant tests.

4. Check whether `docs/api.md` needs an update.

5. Run:



&#x20;  `npm test`



6. Run:



&#x20;  `npm run lint`



7. Report whether both commands passed, and clearly mention any failure that remains.

