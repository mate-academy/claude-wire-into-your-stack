// Parse a route :id param string into a positive integer.
// Returns null for anything that is not a whole number ≥ 1
// (NaN, floats, zero, negatives, non-numeric strings).
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

module.exports = parseId;
