const moment = require("moment");

const { NARRATOR, PLAYER } = require("../characters");
const { createModel, txt2front, txt2input, txt2output } = require(".");
const Characters = require("../characters");

module.exports = createModel(NARRATOR, (manager) => {
  // Directions
  manager.addNamedEntityText("direction", "north", ["pt"], ["norte"]);
  manager.addNamedEntityText("direction", "south", ["pt"], ["sul"]);
  manager.addNamedEntityText("direction", "east", ["pt"], ["leste"]);
  manager.addNamedEntityText("direction", "west", ["pt"], ["oeste"]);
  manager.addNamedEntityText("direction", "northwest", ["pt"], ["noroeste"]);
  manager.addNamedEntityText("direction", "northeast", ["pt"], ["nordeste"]);
  manager.addNamedEntityText("direction", "southwest", ["pt"], ["sudoeste"]);
  manager.addNamedEntityText("direction", "southeast", ["pt"], ["sudeste"]);

  // Answers for riddles
  manager.addNamedEntityText("answer", "rails", ["pt"], ["rails", "ruby on rails"]);
  manager.addNamedEntityText("answer", "map", ["pt"], ["mapa", "planta", "carta geográfica"]);
  manager.addNamedEntityText("answer", "ada", ["pt"], ["ada lovelace", "lovelace"]);

  // npcs
  manager.addNamedEntityText("npc", Characters.BUN.id, ["pt"], ["coelho", "bun", "coelho branco", Characters.BUN.fullName, Characters.BUN.name]);

  // Locations
  manager.addNamedEntityText("location", "house", ["pt"], ["casa", "casa branca"]);

  // Items
  manager.addNamedEntityText("item", "note", ["pt"], ["nota", "leaflet"]);
  manager.addNamedEntityText("item", "diary", ["pt"], ["diário", "caderno do bun", "caderno do coelho", "diário do coelho"]);
  manager.addNamedEntityText("item", "table", ["pt"], ["mesa", "escrivaninha"]);
  manager.addNamedEntityText("item", "mailbox", ["pt"], ["caixa de correio", "correio"]);
  manager.addNamedEntityText("item", "machine", ["pt"], ["máquina", "teletransportador"]);
  manager.addNamedEntityText("lock", "window", ["pt"], ["janela", "janela entreaberta"]);
  manager.addNamedEntityText("lock", "door", ["pt"], ["porta"]);

  // Go direction
  manager.addDocument("pt", "ir para %direction%", "goDirection");
  manager.addDocument("pt", "ir pro %direction%", "goDirection");
  manager.addDocument("pt", "vai pro %direction%", "goDirection");
  manager.addDocument("pt", "%direction%", "goDirection");

  // Turn on
  manager.addDocument("pt", "ligar a %item%", "turnOn");
  manager.addDocument("pt", "ligar o %item%", "turnOn");

  // Turn off
  manager.addDocument("pt", "desligar a %item%", "turnOff");
  manager.addDocument("pt", "desligar o %item%", "turnOff");

  // Enter location
  manager.addDocument("pt", "entrar na %location%", "enterLocation");
  manager.addDocument("pt", "entrar em %location%", "enterLocation");

  // Type
  manager.addDocument("pt", "digitar %answer%", "type");
  manager.addDocument("pt", 'digitar "%answer%"', "type");
  manager.addDocument("pt", 'inputar "%answer%"', "type");
  manager.addDocument("pt", "inputar %answer%", "type");
  manager.addDocument("pt", "escrever %answer%", "type");
  manager.addDocument("pt", 'escrever "%answer%"', "type");

  // Speak to
  manager.addDocument("pt", "falar com %npc%", "speakTo");
  manager.addDocument("pt", "oi %npc%", "speakTo");
  manager.addDocument("pt", "interagir com %npc%", "speakTo");

  // Read
  manager.addDocument("pt", "ler %item%", "readItem");

  // Look around
  manager.addDocument("pt", "olhar em volta", "lookAround");
  manager.addDocument("pt", "olhar ao redor", "lookAround");
  manager.addDocument("pt", "onde estou?", "lookAround");

  // Aprove
  manager.addDocument("pt", "bora", "approve");
  manager.addDocument("pt", "sim", "approve");
  manager.addDocument("pt", "let's", "approve");
  manager.addDocument("pt", "partiu", "approve");
  manager.addDocument("pt", "yes", "approve");
  manager.addDocument("pt", "claro", "approve");
  manager.addDocument("pt", "mas é claro", "approve");

  // Reject
  manager.addDocument("pt", "refuse", "refuse");
  manager.addDocument("pt", "não", "refuse");
  manager.addDocument("pt", "jamais", "refuse");
  manager.addDocument("pt", "nope", "refuse");
  manager.addDocument("pt", "claro que não", "refuse");
  manager.addDocument("pt", "não estou", "refuse");

  // Open item
  manager.addDocument("pt", "abrir %item%", "openItem");
  manager.addDocument("pt", "abrir o %item%", "openItem");
  manager.addDocument("pt", "abrir a %item%", "openItem");

  // Grab item
  manager.addDocument("pt", "pegar a %item%", "grabItem");
  manager.addDocument("pt", "segurar a %item%", "grabItem");
  manager.addDocument("pt", "roubar o %item%", "grabItem");

  // See item
  manager.addDocument("pt", "ver o %item%", "seeItem");
  manager.addDocument("pt", "ver a %item%", "seeItem");
  manager.addDocument("pt", "visualizar a %item%", "seeItem");
  manager.addDocument("pt", "olhar o %item%", "seeItem");
  manager.addDocument("pt", "olhar a %item%", "seeItem");
  manager.addDocument("pt", "olhar %item%", "seeItem");

  // Drop item
  manager.addDocument("pt", "dropar %item%", "dropItem");
  manager.addDocument("pt", "largar %item%", "dropItem");
  manager.addDocument("pt", "descartar %item%", "dropItem");

  // Hello
  manager.addDocument("pt", "oi", "hello");
  manager.addDocument("pt", "oie", "hello");
  manager.addDocument("pt", "olá", "hello");
  manager.addDocument("pt", "alô", "hello");
  manager.addDocument("pt", "fala", "hello");
  manager.addDocument("pt", "e aí?", "hello");
  manager.addDocument("pt", "coé", "hello");
  manager.addDocument("pt", "opa", "hello");
  manager.addDocument("pt", "bom dia", "hello");
  manager.addDocument("pt", "boa tarde", "hello");
  manager.addDocument("pt", "boa noite", "hello");

  manager.addAnswer("pt", "hello", `Olá!`);
  manager.addAnswer("pt", "hello", `E aí?!`);
  manager.addAnswer("pt", "hello", `Coé?!`);
  manager.addAnswer("pt", "hello", `Opa!`);

  // Questions for who is the narrator
  manager.addDocument("pt", "quem é você?", "whoAreYou");
  manager.addDocument("pt", "o que é você?", "whoAreYou");

  manager.addAnswer(
    "pt",
    `whoAreYou`,
    "Na minha língua nativa:\n\"Teen le jach sáasil yéetel oochel, éter yéetel yo'olal, Tene' u ts'o'okol tuláakal yéetel le principio tuláakal, Tene' narrador le k'ajláayo', ka teech le jugador, teech ti' leti'\"",
  );
});
