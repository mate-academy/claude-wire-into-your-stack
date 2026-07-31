const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('listUsers returns the seeded users', () => {
  const users = store.listUsers();
  assert.ok(Array.isArray(users));
  assert.equal(users.length, 2);
  assert.deepEqual(users[0], { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.deepEqual(users[1], { id: 2, name: 'Alan Turing', email: 'alan@example.com' });
});

test('getUser returns the matching user for a valid id', () => {
  const user = store.getUser(1);
  assert.equal(user.id, 1);
  assert.equal(user.name, 'Ada Lovelace');
});

test('getUser returns undefined for a missing id', () => {
  const user = store.getUser(999);
  assert.equal(user, undefined);
});

test('createUser adds a new user with an incrementing id', () => {
  const user = store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(user.id, 3);
  assert.equal(user.name, 'Grace Hopper');
  assert.equal(user.email, 'grace@example.com');
  assert.equal(store.listUsers().length, 3);
  assert.ok(store.listUsers().some((u) => u.id === 3));
});

test('updateUser updates only the provided fields', () => {
  const nameOnly = store.updateUser(1, { name: 'Ada L.' });
  assert.equal(nameOnly.name, 'Ada L.');
  assert.equal(nameOnly.email, 'ada@example.com');

  const emailOnly = store.updateUser(2, { email: 'turing@example.com' });
  assert.equal(emailOnly.name, 'Alan Turing');
  assert.equal(emailOnly.email, 'turing@example.com');

  const both = store.updateUser(1, { name: 'Ada Byron', email: 'ada.byron@example.com' });
  assert.equal(both.name, 'Ada Byron');
  assert.equal(both.email, 'ada.byron@example.com');
});

test('updateUser returns undefined for a missing id', () => {
  const user = store.updateUser(999, { name: 'Nobody' });
  assert.equal(user, undefined);
});

test('reset restores the seed data after mutations', () => {
  store.createUser({ name: 'Grace Hopper', email: 'grace@example.com' });
  store.reset();

  const users = store.listUsers();
  assert.equal(users.length, 2);
  assert.deepEqual(users[0], { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.deepEqual(users[1], { id: 2, name: 'Alan Turing', email: 'alan@example.com' });

  const user = store.createUser({ name: 'Katherine Johnson', email: 'katherine@example.com' });
  assert.equal(user.id, 3);
});
