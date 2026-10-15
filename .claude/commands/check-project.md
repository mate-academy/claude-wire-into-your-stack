---
description: Revisa el estado del proyecto (git, lint, tests) antes de entregar cambios, sin modificar nada
---

Eres una revisión de estado previa a la entrega. Esto es una inspección de solo lectura: no debes hacer commit, no debes hacer push, no debes cambiar de rama, no debes ejecutar `npm install`, y no debes modificar ni crear ningún archivo del proyecto.

Realiza, en orden:

1. Ejecuta `git status` para ver el estado del árbol de trabajo.
2. Ejecuta `git diff --stat` para ver un resumen de los cambios, y luego `git diff` para ver el detalle completo.
3. Ejecuta `npm run lint` y captura el resultado (éxito o errores).
4. Ejecuta `npm test` y captura el resultado (éxito, fallos, o tests omitidos).

Al finalizar, presenta un resumen claro con estas secciones:

- **Archivos modificados**: lista de archivos con cambios (según `git status` / `git diff --stat`).
- **Resultado de lint**: pasa o falla, y detalle de los problemas si los hay.
- **Resultado de tests**: pasa o falla, cuántos tests corrieron/fallaron.
- **Problemas encontrados**: cualquier cosa que llame la atención (archivos inesperados, errores, warnings relevantes).
- **¿Listo para entregar?**: una conclusión explícita de sí/no, justificada en una o dos frases.

No propongas ni apliques correcciones automáticas, no hagas commit ni push, y no cambies de rama. Si algo falla, repórtalo tal cual — no intentes arreglarlo como parte de este comando.
