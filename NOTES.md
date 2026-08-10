# NOTES

## 1. MCP

Me conecté al servidor **`@modelcontextprotocol/server-filesystem`**, configurado en `.mcp.json` con **alcance de proyecto**. Es útil porque expone el sistema de archivos del repo como herramientas MCP explícitas y auditable, en lugar de depender solo de las herramientas nativas del harness.

Mi regla de permisos (`.claude/settings.json` / `settings.local.json`) autoriza automáticamente solo lectura:

- `mcp__filesystem__list_allowed_directories`
- `mcp__filesystem__list_directory`
- `mcp__filesystem__read_text_file`

No se autorizó ninguna herramienta MCP de escritura (`write_file`, `edit_file`, `move_file`, `create_directory`, etc.), así que el servidor no puede modificar nada sin aprobación manual. Verifiqué la conexión leyendo `docs/api.md` a través de MCP.

## 2. Skill

La skill **`express-route`** (`.claude/skills/express-route/SKILL.md`) captura el patrón repetitivo de crear o modificar rutas Express en este repo: un archivo por recurso en `routes/`, sin estado propio, acceso a datos solo vía `db/store.js`, validación antes de tocar el store, códigos de estado (`400`/`404`/`201`/`200`), el shape de error `{ "error": "message" }`, tests en `tests/` con `node:test` y actualización de `docs/api.md` cuando cambia la API pública.

La `description` la redacté enumerando explícitamente los disparadores esperados —"creating, adding, modifying, or extending Express API routes or endpoints... including request validation, db/store.js access, error responses, tests, and API documentation"— para que se activara ante pedidos concretos sobre endpoints, no ante cualquier tarea del repo.

Confirmé la activación con una solicitud de **`DELETE /users/:id`** (activó la skill) y confirmé que **no** se activó ante una solicitud de edición del README.

## 3. Command

Agregué **`/check-project`** (`.claude/commands/check-project.md`), que ejecuta en orden: `git status`, `git diff --stat`, `git diff`, `npm run lint` y `npm test`, y entrega un resumen (archivos modificados, resultado de lint, resultado de tests, problemas encontrados, listo para entregar). No hace cambios, commits ni push.

Vale la pena como atajo porque agrupa una secuencia de verificación pre-entrega que de otro modo requeriría escribir/repetir varios comandos manualmente cada vez, reduciendo el riesgo de saltarse un chequeo antes de entregar cambios.

## 4. Hook

Configuré un hook **`PostToolUse`** en `.claude/settings.json`, con `matcher: "Edit|Write"` y `command: "npm run lint"`.

Es **reactivo**: no previene la edición, sino que se dispara *después* de que Claude edita o escribe un archivo, validando automáticamente que el código siga pasando lint. Lo verifiqué haciendo una edición real y dejando un marcador temporal (`.claudehook-proof.txt`) para confirmar que el hook se ejecutó; luego revertí esa configuración temporal.

## 5. Headless

Ejecuté en modo headless:

```
claude -p "Revisa routes/users.js y tests/users.test.js y dime si los tests cubren correctamente los endpoints actuales. No modifiques archivos." --allowedTools "Read"
```

Solo autoricé **`Read`** sin supervisión. Quedaron bloqueadas implícitamente **`Edit`**, **`Write`**, **`Bash`**, **`Git`**, **`npm install`** y cualquier otra herramienta no incluida en `--allowedTools`. La tarea se completó (análisis de cobertura de tests) sin modificar ningún archivo.
