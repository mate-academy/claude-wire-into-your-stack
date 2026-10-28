# NOTES

**Servidor.** Conecté `docs` (`@modelcontextprotocol/server-filesystem@2.0.1`, sin credenciales) a nivel proyecto en `.mcp.json`, con raíz en `./docs`. Sirve para que Claude consulte `docs/api.md` (el contrato de la API) sin acceso al resto del disco. La regla en `permissions.allow` solo permite lectura: `read_text_file`, `list_directory` y `search_files`; no hay `write_file`, `edit_file` ni `move_file`. Lo usé en una tarea real: listar los endpoints documentados (headless).

**Skill.** `add-api-route` captura cómo se agrega un endpoint aquí: helper en `db/store.js` → router en `routes/` → `400/404` con `{ "error": "..." }` → montar en `server.js` → tests con `store.reset()` → actualizar `docs/api.md` → lint y test. La descripción nombra los archivos y verbos concretos (routes/, db/store.js, server.js, GET/POST/PUT/DELETE) y excluye refactors y preguntas generales. Probé pidiendo "Agrega un endpoint DELETE /users/:id" sin nombrar la skill y se disparó sola.

**Comando.** `/review-changes [rama-base]` revisa el diff contra el checklist del proyecto (store, validación, formato de error, montaje, tests, docs, secretos) y corre lint y tests. Vale la pena porque es la misma revisión antes de cada PR, y `$1` permite cambiar la rama base.

**Hook.** `PostToolUse` con matcher `Edit|Write`: reacciona (no previene). Corre `.claude/hooks/lint-edited.sh`, que aplica `eslint --fix` al `.js` editado; si quedan errores sale con código 2 y Claude los recibe para corregirlos. Lo probé con un archivo con error de sintaxis (exit 2) y con uno limpio (exit 0).

**Headless.** `claude -p` para listar endpoints usando solo `mcp__docs__read_text_file`, `list_directory` y `search_files`, con `--permission-mode dontAsk` y `--max-turns 6`. Bloqueado: escritura, Bash y cualquier otra herramienta. Aparte, probé el disparo de la skill en una copia desechable con `Read Edit Write Glob Grep` y solo `Bash(npm test)` y `Bash(npm run lint)`.
