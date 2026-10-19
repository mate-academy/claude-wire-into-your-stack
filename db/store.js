// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', active: true },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com', active: false },
  ];
  nextId = 3;
}
seed();

function listUsers() {
  return users;
}

function listActiveUsers() {
  return users.filter((user) => user.active);
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email, active: true };
  nextId += 1;
  users.push(user);
  return user;
}

function updateUser(id, fields) {
  const user = getUser(id);
  if (!user) return undefined;
  if (fields.name !== undefined) user.name = fields.name;
  if (fields.email !== undefined) user.email = fields.email;
  return user;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = { listUsers, listActiveUsers, getUser, createUser, updateUser, reset };
