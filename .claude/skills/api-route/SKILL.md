---
name: api-route
description: Use when adding, modifying, or debugging an Express API route in this repository. Follow the existing route structure, validation, error responses, and testing conventions.
---

# Ajouter ou modifier une route Express

## Avant de commencer
1. Lire `CLAUDE.md`, `server.js`, `routes/users.js` (modèle de référence) et `db/store.js`.
2. Si la ressource demandée n'est pas claire (nom, champs), la demander avant de coder.

## Structure
- Une ressource = un fichier dans `routes/`, qui exporte un `express.Router()`.
- Monter le routeur dans `server.js` : `app.use('/<ressource>', <ressource>Router)`.
- Aucun état dans les routes : tout passe par des helpers de `db/store.js`
  (`listX`, `getX`, `createX`, `updateX`), exportés dans `module.exports`.
- Si le store a des données seed, les ajouter dans `seed()` pour que `reset()` les restaure.

## Validation et erreurs
- Convertir l'id avec `Number(req.params.id)`.
- Entrée invalide → `400`. Ressource absente → `404`.
- Les erreurs sont toujours du JSON : `{ "error": "message" }`.
- Succès : `200` (lecture, mise à jour), `201` (création).
- Mettre un commentaire d'une ligne au-dessus de chaque route : `// GET /users/:id — ...`.

## Tests
- Ajouter les tests dans `tests/<ressource>.test.js` (`node:test` + `supertest`).
- Commencer par `test.beforeEach(() => store.reset())`.
- Couvrir au minimum : le cas nominal, le `404` et le `400` si applicable.

## Vérification
- Lancer `npm test` et `npm run lint`, et corriger les échecs avant de conclure.
- Mettre à jour `docs/api.md` avec la nouvelle route.