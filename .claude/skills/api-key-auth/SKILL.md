---
name: api-key-auth
description: Añade a esta API Express un middleware de autenticación que protege una o varias rutas exigiendo una cabecera `x-api-key` que coincida con la variable de entorno `API_KEY` (401 si falta o no coincide). Úsalo solo cuando el usuario pida explícitamente autenticación por API key o la cabecera `x-api-key` en una ruta o endpoint (por ejemplo "exige una API key en /users", "pon x-api-key a la ruta X"). No lo uses para JWT, sesiones, OAuth, login con contraseña ni otros mecanismos de autenticación.
---

# Middleware de autenticación por API key

Añade (o reutiliza) un middleware que bloquea las peticiones sin una API key válida y lo coloca **antes** de las rutas que hay que proteger.

## Comportamiento (obligatorio)

- La clave esperada se lee de `process.env.API_KEY`. **Nunca** la escribas en el código ni en archivos del repo.
- Si `API_KEY` **no está definida**, responde `500` con `{ "error": "API key is not configured" }`. Nunca dejes pasar la petición en ese caso.
- Lee la cabecera `x-api-key` con `req.get('x-api-key')`, que no distingue mayúsculas de minúsculas.
- Si la cabecera **falta** o está **vacía** (solo espacios), responde `401` con `{ "error": "API key is required" }`.
- Si **no coincide** con `API_KEY`, responde `401` con `{ "error": "Invalid API key" }`. Compara con `crypto.timingSafeEqual`, como hace la plantilla.
- Si coincide, llama a `next()`.
- El middleware no guarda estado y no usa `db/store.js`.

## Argumentos

El usuario indica qué proteger, por ejemplo `/users` o `POST /users`. Si no lo indica, pregúntale qué ruta quiere proteger antes de cambiar nada. **No** protejas `/health` salvo que lo pida explícitamente, porque se usa como comprobación de que la API está viva.

## Pasos

1. **Crea el middleware** en `middleware/apiKey.js` copiando `apiKey.js` (en la misma carpeta que este skill). Si el archivo ya existe, reutilízalo y no lo dupliques.
2. **Aplícalo antes de la ruta**, según lo que pida el usuario:
   - **Todo un recurso:** en `server.js`, `app.use('/users', requireApiKey, usersRouter);`
   - **Un solo endpoint:** en el archivo del router, `router.post('/', requireApiKey, (req, res) => { ... });`
   - Importa con `const requireApiKey = require('./middleware/apiKey');` desde `server.js` o `require('../middleware/apiKey')` desde `routes/`.
3. **Lint:** si el script `lint` de `package.json` no incluye `middleware`, añádelo (por ejemplo `eslint server.js routes db middleware tests`).
4. **Tests** (en `tests/`, con `node:test` + `supertest`, igual que `tests/users.test.js`):
   - Al inicio de cada archivo de test que toque rutas protegidas, define `process.env.API_KEY = 'test-key'`.
   - Crea `tests/apiKey.test.js` con al menos:
     - sin cabecera → `401` con `{ error: 'API key is required' }`;
     - cabecera vacía → `401`;
     - clave incorrecta (`'wrong-key'`) → `401` con `{ error: 'Invalid API key' }`;
     - `'test-key'` → pasa a la ruta;
     - sin `API_KEY` (bórrala con `delete process.env.API_KEY` en ese test y restáurala después) → `500`.
   - Actualiza los tests existentes de las rutas protegidas para que envíen `.set('x-api-key', 'test-key')`. Si no, empezarán a fallar con `401`.
5. **Docs:** si existe `docs/api.md`, indica qué rutas exigen la cabecera `x-api-key` y que el servidor necesita la variable `API_KEY`.
6. **Verifica** ejecutando `npm test` y `npm run lint`. Ambos deben pasar.
7. Explica al usuario qué rutas quedaron protegidas y cómo probarlo, por ejemplo:
   ```
   API_KEY=mi-clave npm run dev
   curl -i http://localhost:3000/users                              # 401 (sin cabecera)
   curl -i -H "x-api-key: otra" http://localhost:3000/users         # 401 (clave incorrecta)
   curl -i -H "x-api-key: mi-clave" http://localhost:3000/users     # 200
   ```

## Convenciones del repo

Sigue `CLAUDE.md`: errores en JSON con la forma `{ "error": "message" }` y estilo CommonJS (`require` / `module.exports`).
