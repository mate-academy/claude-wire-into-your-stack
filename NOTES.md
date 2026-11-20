# Notes

## Serveur MCP connecté : `filesystem`

Déclaré dans `.mcp.json` :

```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "./Dossier-autorisé"]
}
```

**À quoi il sert ici** : il donne à Claude des outils pour lire, écrire, copier, déplacer et rechercher des fichiers, mais uniquement dans le dossier `./Dossier-autorisé`. Ce dossier est le seul que le serveur peut atteindre, ce qui limite son périmètre d'action.

## Règles de `.claude/settings.json`

### Permissions (`allow`)

Ces outils sont autorisés sans demande de confirmation :

- `mcp__filesystem__read_directory` : lister le contenu d'un dossier
- `mcp__filesystem__read_file` : lire un fichier
- `mcp__filesystem__list_allowed_directories` : afficher les dossiers accessibles au serveur

Ce sont uniquement des actions de lecture. Les actions qui modifient des fichiers (écriture, déplacement, etc.) demandent toujours une validation.

## Skill `api-route`

Défini dans `.claude/skills/api-route/SKILL.md`. Il capture la méthode à suivre pour ajouter ou modifier une route Express :

1. **Contexte** : lire `CLAUDE.md`, `server.js`, `routes/users.js` (route modèle) et `db/store.js` ; demander si la ressource n'est pas claire.
2. **Structure** : un fichier par ressource dans `routes/` (un `express.Router()`), monté dans `server.js` ; aucun état dans les routes, tout passe par `db/store.js` ; données seed dans `seed()`.
3. **Validation et erreurs** : `Number(req.params.id)`, `400` si entrée invalide, `404` si absent, erreurs en JSON `{ "error": "message" }`, `200` ou `201` en succès, un commentaire d'une ligne au-dessus de chaque route.
4. **Tests** : `tests/<ressource>.test.js` (`node:test` + `supertest`), `test.beforeEach(() => store.reset())`, cas nominal + `404` + `400`.
5. **Vérification** : `npm test`, `npm run lint`, puis mise à jour de `docs/api.md`.

**Formulation de la description** : elle commence par « Use when… » (quand l'utiliser) et liste trois actions (_adding, modifying, or debugging_) sur un sujet précis (« Express API route in this repository »). Une seconde phrase résume le contenu (structure, validation, erreurs, tests).

**Limites possibles** : description en anglais alors que les demandes peuvent être en français ; elle ne mentionne ni les tests ni la documentation, donc une demande comme « ajoute des tests pour /users » pourrait ne pas déclencher le skill.

## Commande `/review-route`

Définie dans `.claude/commands/review-route.md`. Usage : `/review-route routes/users.js` (le chemin remplace `$ARGUMENTS`).

**Ce qu'elle fait** : revue en lecture seule d'une route Express. Elle vérifie la cohérence avec la structure existante, la validation des entrées, le format des réponses de succès et d'erreur, les codes HTTP, la couverture de tests et les modifications inutiles. Elle rapporte les résultats avec chemins de fichiers et numéros de ligne, et ne modifie rien sans demande explicite.

**Pourquoi un raccourci** :

- c'est la même checklist à chaque fois, seule la cible change (`$ARGUMENTS`) ;
- les revues de plusieurs routes ont la même forme et sont comparables ;
- la consigne « ne pas modifier les fichiers » est intégrée ;
- elle se lance à la demande, contrairement à un skill qui peut se déclencher seul.

**Lien avec le skill** : `api-route` sert à écrire une route, `/review-route` à la contrôler ensuite.

**Limite** : le chemin est pris tel quel. Avec un chemin inexistant comme `src/routes/users.js`, il faut retrouver le fichier à la main. Piste : ajouter une consigne pour chercher le fichier le plus proche et le signaler.

### Hook `PostToolUse`
The hook I set is the "format.js" one. It's a PostToolUse hook that formats the edited files with Prettier. It reacts edit and write event.
- **Déclencheur** : après chaque utilisation de l'outil `Edit` ou `Write`
- **Action** : exécute `.claude/hooks/format.js` (formatage avec Prettier)
- **Délai maximum** : 60 secondes
- **Message affiché** : « Formatage (Prettier)... »

Les fichiers modifiés par Claude sont ainsi formatés automatiquement.

### run headless 
I run headless the command : claude -P "list the files here by classifying them in decay order with respect to their size" --allowedTools "Read"
I locked down all the commands that edit, Write or change files. I allowed only the read command.
This is the message returned after this command : 
Files sorted by size, largest first (in bytes). I left out `node_modules/` and `.git/`.

| # | Size (B) | File |
|---|---------:|------|
| 1 | 80146 | `package-lock.json` |
| 2 | 7025 | `README.md` |
| 3 | 5069 | `NOTES.md` |
| 4 | 1643 | `.claude/skills/api-route/SKILL.md` |
| 5 | 1624 | `.claude/hooks/format.js` |
| 6 | 1319 | `routes/users.js` |
| 7 | 1314 | `tests/users.test.js` |
| 8 | 1065 | `db/store.js` |
| 9 | 922 | `CLAUDE.md` |
| 10 | 850 | `docs/api.md` |
| 11 | 584 | `server.js` |
| 12 | 538 | `.claude/settings.json` |
| 13 | 505 | `package.json` |
| 14 | 467 | `eslint.config.js` |
| 15 | 395 | `tests/health.test.js` |
| 16 | 358 | `.claude/commands/review-route.md` |
| 17 | 309 | `.github/workflows/ci.yml` |
| 18 | 243 | `routes/health.js` |
| 19 | 163 | `.mcp.json` |
| 20 | 159 | `.gitignore` |
| 21 | 54 | `.claude/settings.local.json` |

`package-lock.json` is about 80 KB, which is more than ten times the size of any other file. The actual source files (`routes/`, `db/`, `server.js`) are all small, between 243 B and 1.3 KB.
PS D:\Formations\AI\Formation Kodree\claude-wire-into-your-stack>