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
  manager.addNamedEntityText("direction", "up", ["pt"], ["cima"]);
  manager.addNamedEntityText("direction", "down", ["pt"], ["baixo"]);

  // Answers for riddles
  manager.addNamedEntityText("answer", "rails", ["pt"], ["rails", "ruby on rails"]);
  manager.addNamedEntityText("answer", "map", ["pt"], ["mapa", "planta", "carta geográfica"]);
  manager.addNamedEntityText("answer", "ada", ["pt"], ["ada lovelace", "lovelace"]);

  // npcs
  manager.addNamedEntityText("npc", Characters.BUN.id, ["pt"], ["coelho", "coelho branco"]);

  // Locations
  manager.addNamedEntityText("location", "house", ["pt"], ["casa", "casa branca"]);
  manager.addNamedEntityText("item", "ruins", ["pt"], ["ruínas", "excavação"]);

  // Items
  manager.addNamedEntityText("item", "note", ["pt"], ["nota", "leaflet"]);
  manager.addNamedEntityText("item", "diary", ["pt"], ["diário", "caderno do bun", "caderno do coelho", "diário do coelho"]);
  manager.addNamedEntityText("item", "table", ["pt"], ["mesa", "escrivaninha", "papéis"]);
  manager.addNamedEntityText("item", "mailbox", ["pt"], ["caixa de correio", "correio", "caixa"]);
  manager.addNamedEntityText("item", "machine", ["pt"], ["máquina", "teletransportador"]);
  manager.addNamedEntityText("item", "window", ["pt"], ["janela", "janela entreaberta"]);
  manager.addNamedEntityText("item", "door", ["pt"], ["porta"]);
  manager.addNamedEntityText("item", "key", ["pt"], ["chave do bun", "chave"]);
  manager.addNamedEntityText("item", "ruby", ["pt"], ["rubi", "pedra", "gema"]);
  manager.addNamedEntityText("item", "trapdoor", ["pt"], ["alçapão"]);

  // l04
  manager.addNamedEntityText("item", "board", ["pt"], ["lousa", "lousa imensa"]);
  manager.addNamedEntityText("item", "battery", ["pt"], ["bateria"]);
  manager.addNamedEntityText("item", "wall", ["pt"], ["parede"]);
  manager.addNamedEntityText("item", "rug", ["pt"], ["tapete"]);
  manager.addNamedEntityText("item", "lights", ["pt"], ["luzes", "luz"]);
  manager.addNamedEntityText("item", "switch", ["pt"], ["interruptor", "alavanca"]);
  manager.addNamedEntityText("item", "cuttingTool", ["pt"], ["ferramenta de corte", "cortador", "ferramenta"]);
  manager.addNamedEntityText("item", "coil", ["pt"], ["bobina", "bobina de cristal"]);
  manager.addNamedEntityText("item", "generator", ["pt"], ["gerador"]);
  manager.addNamedEntityText("item", "locker", ["pt"], ["armário"]);

  // Go direction
  manager.addDocument("pt", "ir para %direction%", "goDirection");
  manager.addDocument("pt", "ir pro %direction%", "goDirection");
  manager.addDocument("pt", "vai pro %direction%", "goDirection");
  manager.addDocument("pt", "%direction%", "goDirection");

  // Go down or go up
  manager.addDocument("pt", "descer o alçapão", "goDown");
  manager.addDocument("pt", "descer as escadas", "goDown");
  manager.addDocument("pt", "subir o alçapão", "goUp");
  manager.addDocument("pt", "subir as escadas", "goUp");

  // Help
  manager.addDocument("pt", "ajuda", "help");
  manager.addDocument("pt", "me ajuda", "help");
  manager.addDocument("pt", "socorro", "help");
  manager.addDocument("pt", "sos", "help");

  // Push or Pull
  manager.addDocument("pt", "puxar o %item%", "pull");
  manager.addDocument("pt", "tirar o %item%", "pull");
  manager.addDocument("pt", "empurrar o %item%", "push");
  manager.addDocument("pt", "afastar o %item%", "push");

  // Turn on
  manager.addDocument("pt", "ligar a %item%", "turnOn");
  manager.addDocument("pt", "ligar o %item%", "turnOn");

  // Turn off
  manager.addDocument("pt", "desligar a %item%", "turnOff");
  manager.addDocument("pt", "desligar o %item%", "turnOff");

  // Put
  manager.addDocument("pt", "colocar o %item%", "putItem");
  manager.addDocument("pt", "colocar a %item%", "putItem");
  manager.addDocument("pt", "botar o %item%", "putItem");
  manager.addDocument("pt", "botar a %item%", "putItem");
  manager.addDocument("pt", "inserir o %item%", "putItem");
  manager.addDocument("pt", "inserir a %item%", "putItem");

  // Enter location
  manager.addDocument("pt", "entrar na %location%", "enterLocation");
  manager.addDocument("pt", "entrar pela %item%", "enterLocation");

  // Type
  manager.addDocument("pt", "digitar", "type");
  manager.addDocument("pt", "escrever", "type");
  manager.addDocument("pt", "inputar", "type");
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
  manager.addDocument("pt", "nasci pronto", "approve");
  manager.addDocument("pt", "pronto", "approve");

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

  // Detach item
  manager.addDocument("pt", "remover o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "destacar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "separar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "retirar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "tirar o %item_1% da %item_2%", "detachItem");

  manager.slotManager.addSlot("detachItem", "item_1", true, { pt: "De onde retirar o {{ item_1 }}?" });
  manager.slotManager.addSlot("detachItem", "item_2", true, { pt: "Separar o {{ item_1 }} do que?" });

  // Grab item
  manager.addDocument("pt", "pegar a %item%", "grabItem");
  manager.addDocument("pt", "segurar a %item%", "grabItem");
  manager.addDocument("pt", "roubar o %item%", "grabItem");

  // Fix item
  manager.addDocument("pt", "consertar o %item%", "fixItem");
  manager.addDocument("pt", "consertar a %item%", "fixItem");

  // See item
  manager.addDocument("pt", "ver o %item%", "seeItem");
  manager.addDocument("pt", "ver a %item%", "seeItem");
  manager.addDocument("pt", "visualizar a %item%", "seeItem");
  manager.addDocument("pt", "olhar o %item%", "seeItem");
  manager.addDocument("pt", "olhar a %item%", "seeItem");
  manager.addDocument("pt", "olhar %item%", "seeItem");

  // Drop item
  // manager.addDocument("pt", "dropar %item%", "dropItem");
  // manager.addDocument("pt", "largar %item%", "dropItem");
  // manager.addDocument("pt", "descartar %item%", "dropItem");

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
  manager.addAnswer("pt", "hello", `Suave?`);
  manager.addAnswer("pt", "hello", `Beleza?`);
  manager.addAnswer("pt", "hello", `Eae!?`);

  // Questions for who is the narrator
  manager.addDocument("pt", "quem é você?", "whoAreYou");
  manager.addDocument("pt", "o que é você?", "whoAreYou");

  manager.addAnswer(
    "pt",
    `whoAreYou`,
    'Na sua língua nativa:\n"Eu sou o éter e o tempo, sou o espaço e o momento. Eu sou aquilo que você não vê, aquilo que movimenta o ser. Eu sou o que você gostaria de ter. Eu sou você."\nEu estou aqui para te ajudar a realizar a profecia. Nada mais, nada menos.',
  );

  manager.addAnswer(
    "pt",
    `help`,
    "Esse é um jogo iterativo. Seu objetivo é digitar comandos para o jogo, se movimentar e explorar os diversos desafios, e encontrar o segredo. Para se movimentar, digite N, S, L ou O (as outras direções também são válidas).",
  );

  manager.addAnswer(
    "pt",
    `help`,
    "Se você nunca jogou um jogo nesse estilo, eu recomendo que você dê uma olhadinha em ZORK. A ideia é a mesma.",
  );

  manager.addAnswer("pt", `help`, "Já tentou ver um item? Você pode ver os itens que está carregando, ou abrir o inventário.");
  manager.addAnswer(
    "pt",
    `help`,
    "Nesse jogo, para cada movimento, um passo será contabilizado (isso só inclui você trocar de sala / lugar). Conforme você resolve os desafios, você ganha pontos, que se somam e definem o seu score.",
  );
});
