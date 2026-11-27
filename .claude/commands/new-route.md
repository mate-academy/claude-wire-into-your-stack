---
description: Crea una nueva ruta (recurso) en la API, opcionalmente protegida con API key
argument-hint: <nombre-ruta> <proteger: true|false>
---

Crea un nuevo recurso en esta API Express.

Argumentos recibidos: `$ARGUMENTS`

Sepáralos por espacios:

- **`NOMBRE`** (primera palabra): nombre de la ruta.
- **`PROTEGER`** (segunda palabra): si se protege con API key (`true` o `false`).

## 1. Valida los argumentos antes de cambiar nada

- `NOMBRE` es obligatorio. Normalízalo: quita la `/` inicial y pásalo a minúsculas. Solo puede tener letras minúsculas, números y guiones (`^[a-z][a-z0-9-]*$`). Si no cumple, detente y explica por qué.
- `PROTEGER` debe ser `true` o `false` (acepta también `sí`/`si`/`yes` como `true` y `no` como `false`). Si falta o no es válido, detente y pide al usuario que lo indique. **No** asumas un valor por defecto.
- Si ya existe `routes/<nombre>.js` o `server.js` ya monta `/<nombre>`, detente y avisa al usuario. No sobrescribas nada.
- No uses `health` ni `users`, porque ya existen.

En los pasos siguientes se usan estos nombres. Los guiones **nunca** aparecen en identificadores de JavaScript:

| Marcador | Uso | `products` | `order-items` |
|---|---|---|---|
| `<nombre>` | URL, nombre de archivo (`routes/`, `tests/`) | `products` | `order-items` |
| `<ident>` | camelCase: array en `db/store.js` y variable del router | `products` | `orderItems` |
| `<Ident>` | PascalCase: nombres de funciones y título en docs | `Products` | `OrderItems` |
| `<Singular>` | PascalCase singular: `get<Singular>ById` y mensaje de error | `Product` | `OrderItem` |

## 2. Capa de datos: `db/store.js`

Sigue la convención de `CLAUDE.md`: los datos solo se leen y escriben a través de `db/store.js`.

- Añade un array en memoria `<ident>` (vacío). No añadas un contador de ids salvo que también crees una función para dar de alta registros; si no, ESLint lo marcará como variable sin usar.
- Añade las funciones `list<Ident>()` y `get<Singular>ById(id)`, con el mismo estilo que `listUsers` y `getUser`.
- Dentro de `seed()`, reinicia el array a `[]`, para que `reset()` también lo limpie en los tests.
- Exporta las nuevas funciones en `module.exports`.

## 3. Router: `routes/<nombre>.js`

Copia la estructura de `routes/users.js` (CommonJS, `express.Router()`), con dos endpoints:

- `GET /`: devuelve `store.list<Ident>()`.
- `GET /:id`: devuelve el registro, o `404` con `{ "error": "<Singular> not found" }` si no existe.

No añadas POST, PUT ni DELETE salvo que el usuario lo pida.

## 4. Monta la ruta en `server.js`

- Importa el router: `const <ident>Router = require('./routes/<nombre>');` (por ejemplo, `const orderItemsRouter = require('./routes/order-items');`).
- Si `PROTEGER` es **true**: `app.use('/<nombre>', requireApiKey, <ident>Router);`. El middleware está en `middleware/apiKey.js`. Si no existe, créalo siguiendo el skill `api-key-auth` (`.claude/skills/api-key-auth/`) y añade `middleware` al script `lint` de `package.json`.
- Si `PROTEGER` es **false**: `app.use('/<nombre>', <ident>Router);`.

## 5. Tests: `tests/<nombre>.test.js`

Usa `node:test` + `supertest`, como en `tests/users.test.js`, con `store.reset()` en `beforeEach`. Incluye al menos:

- `GET /<nombre>` → `200` con un array.
- `GET /<nombre>/999` → `404` con `{ error: '<Singular> not found' }`.
- Si está protegida: define `process.env.API_KEY = 'test-key'` al inicio del archivo, añade `.set('x-api-key', 'test-key')` a los tests anteriores y dos tests más: sin cabecera → `401` con `{ error: 'API key is required' }`; con una clave incorrecta → `401` con `{ error: 'Invalid API key' }`.

## 6. Documentación

En `docs/api.md`, añade una sección `## <Ident>` con sus endpoints. Si está protegida, indica que requiere la cabecera `x-api-key`. Actualiza también la sección **Architecture** de `CLAUDE.md`, donde aparece la lista de archivos de `routes/`.

## 7. Verifica y resume

1. Ejecuta `npm test` y `npm run lint`. Ambos deben pasar. Si algo falla, corrígelo.
2. Resume al usuario, de forma breve:
   - los archivos creados y modificados,
   - si la ruta quedó protegida o no,
   - un ejemplo `curl` para probarla (si está protegida: arrancar con `API_KEY=mi-clave npm run dev` y usar `-H "x-api-key: mi-clave"`).
3. No hagas commit.
