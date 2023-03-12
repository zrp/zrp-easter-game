const moment = require("moment");

const { NARRATOR, PLAYER } = require("../characters");
const { createModel, txt2front, txt2input, txt2output } = require(".");

module.exports = createModel(NARRATOR.id, (manager) => {
  manager.addNamedEntityText("direction", "north", ["pt"], ["norte"]);
  manager.addNamedEntityText("direction", "south", ["pt"], ["sul"]);
  manager.addNamedEntityText("direction", "east", ["pt"], ["leste"]);
  manager.addNamedEntityText("direction", "west", ["pt"], ["oeste"]);

  manager.addDocument("pt", "ir para %direction%", "goDirection");
});
