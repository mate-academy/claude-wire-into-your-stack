const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('listUsers returns the seeded 2 users', () => {
  const users = store.listUsers();
  assert.ok(Array.isArray(users));
  assert.equal(users.length, 2);
  assert.deepEqual(users[0], { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.deepEqual(users[1], { id: 2, name: 'Alan Turing', email: 'alan@example.com' });
});

test('getUser returns the matching user', () => {
  const user = store.getUser(1);
  assert.deepEqual(user, { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
});

test('getUser returns undefined for a missing id', () => {
  const user = store.getUser(999);
  assert.equal(user, undefined);
});

test('createUser assigns an incrementing id and appends to the list', () => {
  const created = store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(created.id, 3);
  assert.equal(created.name, 'Grace Hopper');
  assert.equal(created.email, 'grace@example.com');

  const users = store.listUsers();
  assert.equal(users.length, 3);
  assert.deepEqual(users[2], created);

  const second = store.createUser({ name: 'Margaret Hamilton', email: 'margaret@example.com' });
  assert.equal(second.id, 4);
  assert.equal(store.listUsers().length, 4);
});

test('updateUser updates only the provided fields and leaves others untouched', () => {
  const updated = store.updateUser(1, { name: 'Ada L.' });
  assert.equal(updated.name, 'Ada L.');
  assert.equal(updated.email, 'ada@example.com');

  const updatedEmail = store.updateUser(2, { email: 'alan.turing@example.com' });
  assert.equal(updatedEmail.name, 'Alan Turing');
  assert.equal(updatedEmail.email, 'alan.turing@example.com');
});

test('updateUser returns undefined for a missing id', () => {
  const result = store.updateUser(999, { name: 'Nobody' });
  assert.equal(result, undefined);
});

test('reset restores the original seed data after mutations', () => {
  store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  store.updateUser(1, { name: 'Changed Name' });
  assert.equal(store.listUsers().length, 3);

  store.reset();

  const users = store.listUsers();
  assert.equal(users.length, 2);
  assert.deepEqual(users[0], { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.deepEqual(users[1], { id: 2, name: 'Alan Turing', email: 'alan@example.com' });

  const created = store.createUser({ name: 'New After Reset', email: 'new@example.com' });
  assert.equal(created.id, 3);
});
