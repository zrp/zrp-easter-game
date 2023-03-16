const moment = require("moment");

const { NARRATOR, PLAYER } = require("../characters");
const { createModel, txt2front, txt2input, txt2output } = require(".");

module.exports = createModel(NARRATOR.id, (manager) => {
  // Directions
  manager.addNamedEntityText("direction", "north", ["pt"], ["norte"]);
  manager.addNamedEntityText("direction", "south", ["pt"], ["sul"]);
  manager.addNamedEntityText("direction", "east", ["pt"], ["leste"]);
  manager.addNamedEntityText("direction", "west", ["pt"], ["oeste"]);
  manager.addNamedEntityText("direction", "northwest", ["pt"], ["noroeste"]);
  manager.addNamedEntityText("direction", "northeast", ["pt"], ["nordeste"]);
  manager.addNamedEntityText("direction", "southwest", ["pt"], ["sudoeste"]);
  manager.addNamedEntityText("direction", "southeast", ["pt"], ["sudeste"]);

  // Items
  manager.addNamedEntityText("item", "note", ["pt"], ["nota", "leaflet"]);
  manager.addNamedEntityText("item", "mailbox", ["pt"], ["caixa de correio", "correio"]);
  manager.addNamedEntityText("lock", "window", ["pt"], ["janela", "janela entreaberta"]);

  manager.addDocument("pt", "ir para %direction%", "goDirection");
  manager.addDocument("pt", "ir pro %direction%", "goDirection");
  manager.addDocument("pt", "vai pro %direction%", "goDirection");
  manager.addDocument("pt", "%direction%", "goDirection");

  manager.addDocument("pt", "ler %item%", "readItem");
  manager.addDocument("pt", "olhar %item%", "seeItem");

  manager.addDocument("pt", "olhar em volta", "lookAround");
  manager.addDocument("pt", "olhar ao redor", "lookAround");

  manager.addDocument("pt", "bora", "approve");
  manager.addDocument("pt", "sim", "approve");
  manager.addDocument("pt", "let's", "approve");
  manager.addDocument("pt", "partiu", "approve");
  manager.addDocument("pt", "yes", "approve");
  manager.addDocument("pt", "claro", "approve");
  manager.addDocument("pt", "mas é claro", "approve");
  manager.addDocument("pt", "refuse", "refuse");
  manager.addDocument("pt", "não", "refuse");
  manager.addDocument("pt", "jamais", "refuse");
  manager.addDocument("pt", "nope", "refuse");
  manager.addDocument("pt", "claro que não", "refuse");
  manager.addDocument("pt", "não estou", "refuse");

  manager.addDocument("pt", "abrir %item%", "openItem");
  manager.addDocument("pt", "abrir o %item%", "openItem");
  manager.addDocument("pt", "abrir a %item%", "openItem");

  manager.addDocument("pt", "pegar a %item%", "grabItem");
  manager.addDocument("pt", "segurar a %item%", "grabItem");
  manager.addDocument("pt", "roubar o %item%", "grabItem");

  manager.addDocument("pt", "ver o %item%", "grabItem");

  manager.addDocument("pt", "dropar %item%", "dropItem");
  manager.addDocument("pt", "largar %item%", "dropItem");
  manager.addDocument("pt", "descartar %item%", "dropItem");
});
