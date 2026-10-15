# NOTES — Wire Claude into your stack

## Servidor MCP

Conecté `@modelcontextprotocol/server-filesystem` a nivel de proyecto (`.mcp.json`),
apuntado solo a `./docs`, con el nombre `docs-fs`. Es credential-free y sirve para
que Claude pueda consultar `docs/api.md` (la referencia de la API) sin tener que
adivinar el contrato de las rutas cuando trabaja en este repo — útil sobre todo a
medida que crezcan los docs más allá de un solo archivo. La regla de permiso en
`.claude/settings.json` solo habilita `mcp__docs-fs__read_text_file` y
`mcp__docs-fs__list_directory` (lectura), no el resto de tools del servidor
(`write_file`, `edit_file`, `move_file`, etc.), así que Claude puede leer la
carpeta pero nunca escribir en ella a través de este servidor. Lo probé en modo
headless (`claude -p`) pidiéndole que listara `docs/` y resumiera `api.md`, y
respondió correctamente usando las dos tools permitidas.

## Skill de proyecto

El skill `.claude/skills/new-route/SKILL.md` encapsula la forma en que este
repo añade endpoints: acceso a datos solo a través de `db/store.js`, validación
en la ruta (`400` en input inválido, `404` en registro faltante), forma de error
`{ "error": "message" }`, un archivo por recurso montado en `server.js`, tests
con `node:test` + `supertest` siguiendo el patrón de `tests/users.test.js`, y
actualización de `docs/api.md`. La descripción está acotada a "añadir un nuevo
endpoint REST / nuevo método HTTP" y explícitamente excluye cambios no
relacionados, para que no dispare en tareas como editar el README o la CI.
Lo confirmé pidiéndole en una sesión headless nueva "necesito añadir un
endpoint para borrar un usuario" (sin mencionar el skill) y el plan que devolvió
siguió exactamente los pasos del skill, incluida la frase de alcance ("no
añadir auth/paginación fuera de lo que ya tiene el recurso").

## Comando

Añadí `/pr-check` (`.claude/commands/pr-check.md`), que acepta opcionalmente
la rama base como `$1` (por defecto `main`). Corre `npm test` y `npm run lint`,
saca el diff contra la base, y lo revisa contra el checklist de convenciones de
CLAUDE.md (validación, formato de error, `db/store.js`, montaje en
`server.js`, docs y tests). Es el tipo de repaso que haría a mano antes de cada
PR en este repo, así que vale la pena tenerlo como comando fijo. Lo corrí una
vez contra `main` y reportó correctamente que el diff estaba vacío en ese
momento (antes de este commit) y que `npm test`/`npm run lint` no pudieron
ejecutarse por falta de permiso — coincide con lo que documento abajo sobre
por qué elegí una tarea de solo lectura para el punto 5.

## Hook

El hook es de tipo **reactivo** (`PostToolUse`), con matcher `Edit|Write`, que
ejecuta `node .claude/hooks/lint-fix.js`. El script lee el JSON de stdin, toma
`tool_input.file_path`, y si es un `.js` corre `npx eslint --fix` sobre ese
archivo — así el código que Claude toca queda formateado según
`eslint.config.js` sin que nadie tenga que acordarse de correr lint antes de
commitear. Elegí reaccionar (no bloquear) porque un lint-fix nunca debería
impedir que una edición se guarde. Al probarlo, tuve que resolver un detalle de
Windows: `execFileSync('npx', ...)` sin `shell: true` falla con `ENOENT`/`EINVAL`
porque `npx` se resuelve como `npx.cmd`, que Node no puede spawnear
directamente sin shell — quedó documentado como comentario en el script.
Verifiqué el hook introduciendo a propósito una violación auto-corregible
(`no-extra-boolean-cast`, la única regla fixable dentro de `eslint:recommended`
en este proyecto) y confirmando que el hook la corrigió.

## Tarea headless

Corrí, sin supervisión, una auditoría de solo lectura: pedirle a Claude que
comparara `routes/users.js`, `routes/health.js` y `db/store.js` contra
`docs/api.md` y reportara cualquier discrepancia, sin modificar nada. La
lancé con `claude -p` y `--allowedTools "Read,Grep"` — nada de `Bash`, `Edit`
ni `Write`, porque la tarea es puramente de lectura y no necesita más.
(De paso noté que `npm test`/`npm run lint` piden confirmación incluso con una
regla `Bash(npm test)` explícita en `--allowedTools` — parece un guardrail que
no se puede levantar solo con la allowlist — así que evité depender de esos
comandos para esta tarea headless y usé algo que no necesita `Bash` en
absoluto.) El resultado: no encontró discrepancias entre el código y la
documentación.
