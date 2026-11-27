# NOTES

## 1. Servidor MCP
Conecté **fetch** (`uvx mcp-server-fetch`) en `.mcp.json`, a nivel de proyecto y sin credenciales. Le permite a Claude leer documentación externa (Express, supertest, ESLint) mientras trabaja en esta API.
La regla de `.claude/settings.json` en `permissions.allow` permite **solo** `mcp__fetch__fetch`, una herramienta de lectura. No da acceso libre a todo el servidor.
**Uso real:** con `claude -p "Usa la herramienta fetch para leer https://expressjs.com/en/guide/routing.html y resume cómo se usa express.Router()" --allowedTools "mcp__fetch__fetch"`, Claude leyó la guía y la relacionó con cómo `server.js` monta los routers de `routes/`.

## 2. Skill: `api-key-auth`
Captura cómo se protege una ruta con API key en este repo:
- un middleware en `middleware/apiKey.js`, montado antes del router, que compara la cabecera `x-api-key` con la variable de entorno `API_KEY` (con `timingSafeEqual`);
- `401` con `{ "error": "API key is required" }` si falta la cabecera y `401` con `{ "error": "Invalid API key" }` si no coincide;
- `500` si `API_KEY` no está configurada, para que nunca acepte una clave por accidente;
- tests con `node:test` + `supertest`, con `process.env.API_KEY = 'test-key'` y `.set('x-api-key', 'test-key')` en las rutas protegidas.

Incluye la plantilla `apiKey.js` en la carpeta del skill, así que funciona en un clon nuevo.
La descripción solo se activa cuando se pide **explícitamente** una API key o la cabecera `x-api-key`. Además, excluye JWT, sesiones, OAuth y login, para que no se dispare con cualquier pedido de "autenticación".
**Prueba:** pedí "Quiero exigir la cabecera x-api-key en la ruta /users" sin nombrar el skill. Claude abrió `.claude/skills/api-key-auth/SKILL.md` y siguió sus pasos.

## 3. Comando: `/new-route`
`/new-route <nombre> <true|false>` (recibe los argumentos con `$ARGUMENTS`) crea un recurso completo siguiendo las convenciones de `CLAUDE.md`:
- funciones en `db/store.js`;
- el router en `routes/`;
- el montaje en `server.js`, con `requireApiKey` opcional;
- los tests y la documentación.

Termina ejecutando `npm test` y `npm run lint`. Vale la pena porque crear un recurso toca siempre los mismos 5 o 6 archivos, y es fácil olvidar alguno.
Los nombres con guion se usan tal cual en la URL y en los nombres de archivo, y en camelCase o PascalCase en el código. Por ejemplo, `order-items` → `orderItems`, `listOrderItems()`, `getOrderItemById()`.
**Prueba:** ejecuté `claude -p "/new-route order-items true"`. Creó `routes/order-items.js`, `middleware/apiKey.js` y los tests, usó los identificadores `orderItems` y `listOrderItems`, y pasaron 14/14 tests y el lint. Después descarté esos cambios porque este PR no cambia la app.

## 4. Hook: bloquear push a ramas protegidas
Es un hook **PreToolUse** (previene) con matcher **`Bash`**, registrado en `.claude/settings.json`. Ejecuta `.claude/hooks/block-protected-push.sh`, que sale con código 2 y bloquea cualquier `git push` hacia `main`, `release` o `maintenance` (también `--all` y `--mirror`). Reconoce también las opciones globales de git antes de `push`, como `-c k=v`, `-C dir`, `--git-dir[=]dir` y `--work-tree dir`. Usa un solo patrón (`GIT_GLOBAL_OPTS`) compartido por todos los matchers.
**Prueba:** Claude intentó `git push --dry-run origin main` y el hook lo bloqueó con este mensaje: "Bloqueado por hook: no se permite hacer push a la rama protegida 'main'…". Además, pasé 14 casos al script por stdin: 10 pushes a ramas protegidas, todos bloqueados (código 2), y 4 comandos permitidos (código 0).

## 5. Ejecución headless
```
claude -p "Ejecuta los tests del proyecto y resume el resultado en 2 líneas" --allowedTools "Bash(npm test)" "Read"
```
Solo permití `Bash(npm test)`, que ejecuta exactamente ese comando y ningún otro de Bash, y `Read`, para leer los tests si hace falta. No puede editar, borrar ni hacer push. Resultado: 5/5 tests pasaron.
