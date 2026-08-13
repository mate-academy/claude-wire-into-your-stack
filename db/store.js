// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

let categories = [];
let nextCategoryId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;

  categories = [
    { id: 1, name: 'Engineering', description: 'Software and infrastructure work' },
    { id: 2, name: 'Design', description: 'Visual and product design work' },
  ];
  nextCategoryId = 3;
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

function listCategories() {
  return categories;
}

function getCategory(id) {
  return categories.find((category) => category.id === id);
}

function createCategory({ name, description }) {
  const category = { id: nextCategoryId, name, description };
  nextCategoryId += 1;
  categories.push(category);
  return category;
}

function updateCategory(id, fields) {
  const category = getCategory(id);
  if (!category) return undefined;
  if (fields.name !== undefined) category.name = fields.name;
  if (fields.description !== undefined) category.description = fields.description;
  return category;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  reset,
};
