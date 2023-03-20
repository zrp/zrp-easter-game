const Characters = require("./characters");
const bun = require("./models/bun");

const npcs = {
  [Characters.BUN.id]: bun,
};

module.exports = npcs;
