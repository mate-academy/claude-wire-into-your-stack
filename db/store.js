// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}
seed();

function listUsers() {
  return users;
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
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

let products = [];
let nextProductId = 1;

function seedProducts() {
  products = [
    { id: 1, name: 'Widget', price: 9.99 },
    { id: 2, name: 'Gadget', price: 24.99 },
  ];
  nextProductId = 3;
}
seedProducts();

function listProducts() {
  return products;
}

function getProduct(id) {
  return products.find((p) => p.id === id);
}

function createProduct({ name, price }) {
  const product = { id: nextProductId, name, price };
  nextProductId += 1;
  products.push(product);
  return product;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
  seedProducts();
}

module.exports = { listUsers, getUser, createUser, updateUser, listProducts, getProduct, createProduct, reset };
