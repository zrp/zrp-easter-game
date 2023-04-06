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
  manager.addNamedEntityText("answer", "steps", ["pt"], ["passos", "pegadas"]);

  // npcs
  manager.addNamedEntityText("npc", Characters.BUN.id, ["pt"], ["coelho", "coelho branco"]);

  // Locations
  manager.addNamedEntityText("location", "house", ["pt"], ["casa", "casa branca"]);
  manager.addNamedEntityText("location", "hill", ["pt"], ["encosta", "desfiladeiro"]);
  manager.addNamedEntityText("item", "ruins", ["pt"], ["ruínas", "excavação"]);

  // Items
  manager.addNamedEntityText("item", "note", ["pt"], ["nota", "leaflet"]);
  manager.addNamedEntityText("item", "safe", ["pt"], ["cofre"]);
  manager.addNamedEntityText("item", "sapphire", ["pt"], ["safira"]);
  manager.addNamedEntityText("item", "jewerelyBox", ["pt"], ["caixa de jóias"]);
  manager.addNamedEntityText("item", "quicknote", ["pt"], ["bilhete"]);
  manager.addNamedEntityText("item", "countertop", ["pt"], ["bancada"]);
  manager.addNamedEntityText("item", "diary", ["pt"], ["diário", "caderno do bun", "caderno do coelho", "diário do coelho"]);
  manager.addNamedEntityText("item", "table", ["pt"], ["mesa", "escrivaninha", "papéis"]);
  manager.addNamedEntityText("item", "mailbox", ["pt"], ["caixa de correio", "correio", "caixa"]);
  manager.addNamedEntityText("item", "painting", ["pt"], ["quadros", "quadro"]);
  manager.addNamedEntityText("item", "machine", ["pt"], ["máquina", "teletransportador"]);
  manager.addNamedEntityText("item", "window", ["pt"], ["janela", "janela entreaberta"]);
  manager.addNamedEntityText("item", "door", ["pt"], ["porta"]);
  manager.addNamedEntityText("item", "key", ["pt"], ["chave do bun", "chave"]);
  manager.addNamedEntityText("item", "ruby", ["pt"], ["rubi", "pedra", "gema"]);
  manager.addNamedEntityText("item", "trapdoor", ["pt"], ["alçapão"]);
  manager.addNamedEntityText("item", "body", ["pt"], ["corpo"]);
  manager.addNamedEntityText("item", "book", ["pt"], ["livro"]);

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
  manager.addDocument("pt", "ir a %location%", "goDirection");
  manager.addDocument("pt", "ir para %direction%", "goDirection");
  manager.addDocument("pt", "ir para %item%", "goDirection");
  manager.addDocument("pt", "ir pro %direction%", "goDirection");
  manager.addDocument("pt", "ir pro %item%", "goDirection");
  manager.addDocument("pt", "vai pro %direction%", "goDirection");
  manager.addDocument("pt", "vai pro %item%", "goDirection");
  manager.addDocument("pt", "%direction%", "goDirection");

  // Go down or go up
  manager.addDocument("pt", "descer o alçapão", "goDown");
  manager.addDocument("pt", "descer as escadas", "goDown");
  manager.addDocument("pt", "subir o alçapão", "goUp");
  manager.addDocument("pt", "subir as escadas", "goUp");
  manager.addDocument("pt", "subir a encosta", "goUp");
  manager.addDocument("pt", "subir o desfiladeiro", "goUp");

  // Help
  manager.addDocument("pt", "ajuda", "help");
  manager.addDocument("pt", "me ajuda", "help");
  manager.addDocument("pt", "socorro", "help");
  manager.addDocument("pt", "sos", "help");
  manager.addDocument("pt", "tá foda", "help");
  manager.addDocument("pt", "do you speak english?", "speakEnglish");

  // Push or Pull
  manager.addDocument("pt", "puxar o %item%", "pull");
  manager.addDocument("pt", "puxe o %item%", "pull");
  manager.addDocument("pt", "puxa o %item%", "pull");
  manager.addDocument("pt", "tirar o %item%", "pull");
  manager.addDocument("pt", "tire o %item%", "pull");
  manager.addDocument("pt", "tira o %item%", "pull");
  manager.addDocument("pt", "empurrar o %item%", "push");
  manager.addDocument("pt", "empurre o %item%", "push");
  manager.addDocument("pt", "empurra o %item%", "push");
  manager.addDocument("pt", "afastar o %item%", "push");
  manager.addDocument("pt", "afaste o %item%", "push");
  manager.addDocument("pt", "afasta o %item%", "push");

  // Turn on
  manager.addDocument("pt", "ligar a %item%", "turnOn");
  manager.addDocument("pt", "ligar o %item%", "turnOn");
  manager.addDocument("pt", "ligue o %item%", "turnOn");
  manager.addDocument("pt", "liga a %item%", "turnOn");

  // Turn off
  manager.addDocument("pt", "desligar a %item%", "turnOff");
  manager.addDocument("pt", "desligar o %item%", "turnOff");
  manager.addDocument("pt", "desligue o %item%", "turnOff");
  manager.addDocument("pt", "desliga o %item%", "turnOff");

  // Put
  manager.addDocument("pt", "colocar o %item%", "putItem");
  manager.addDocument("pt", "coloque o %item%", "putItem");
  manager.addDocument("pt", "coloque a %item%", "putItem");
  manager.addDocument("pt", "colocar a %item%", "putItem");
  manager.addDocument("pt", "botar o %item%", "putItem");
  manager.addDocument("pt", "botar a %item%", "putItem");
  manager.addDocument("pt", "bote a %item%", "putItem");
  manager.addDocument("pt", "bote o %item%", "putItem");
  manager.addDocument("pt", "inserir o %item%", "putItem");
  manager.addDocument("pt", "inserir a %item%", "putItem");
  manager.addDocument("pt", "insira a %item%", "putItem");
  manager.addDocument("pt", "insira o %item%", "putItem");

  // Enter location
  manager.addDocument("pt", "entrar na %location%", "enterLocation");
  manager.addDocument("pt", "entrar pela %item%", "enterLocation");
  manager.addDocument("pt", "entre na %location%", "enterLocation");
  manager.addDocument("pt", "entre no %location%", "enterLocation");
  manager.addDocument("pt", "entre pela %location%", "enterLocation");
  manager.addDocument("pt", "entre na %item%", "enterLocation");
  manager.addDocument("pt", "entre no %item%", "enterLocation");
  manager.addDocument("pt", "entre pela %item%", "enterLocation");

  // Type
  manager.addDocument("pt", "digitar", "type");
  manager.addDocument("pt", "digite", "type");
  manager.addDocument("pt", "escrever", "type");
  manager.addDocument("pt", "escreva", "type");
  manager.addDocument("pt", "inputar", "type");
  manager.addDocument("pt", "inpute", "type");
  manager.addDocument("pt", "digitar %answer%", "type");
  manager.addDocument("pt", "digite %answer%", "type");
  manager.addDocument("pt", 'digitar "%answer%"', "type");
  manager.addDocument("pt", 'digita "%answer%"', "type");
  manager.addDocument("pt", 'inputar "%answer%"', "type");
  manager.addDocument("pt", 'inpute "%answer%"', "type");
  manager.addDocument("pt", "inputar %answer%", "type");
  manager.addDocument("pt", "escrever %answer%", "type");
  manager.addDocument("pt", "escreva %answer%", "type");
  manager.addDocument("pt", 'escrever "%answer%"', "type");
  manager.addDocument("pt", 'escreve "%answer%"', "type");

  // Speak to
  manager.addDocument("pt", "falar com %npc%", "speakTo");
  manager.addDocument("pt", "oi %npc%", "speakTo");
  manager.addDocument("pt", "interagir com %npc%", "speakTo");
  manager.addDocument("pt", "fale com %npc%", "speakTo");
  manager.addDocument("pt", "ir até o %npc%", "speakTo");

  // Read
  manager.addDocument("pt", "ler %item%", "readItem");

  // Look around
  manager.addDocument("pt", "olhar em volta", "lookAround");
  manager.addDocument("pt", "olhar ao redor", "lookAround");
  manager.addDocument("pt", "onde estou?", "lookAround");
  manager.addDocument("pt", "cadê eu?", "lookAround");
  manager.addDocument("pt", "onde eu tô?", "lookAround");

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
  manager.addDocument("pt", "abra %item%", "openItem");
  manager.addDocument("pt", "abre %item%", "openItem");
  manager.addDocument("pt", "abrir o %item%", "openItem");
  manager.addDocument("pt", "abrir a %item%", "openItem");

  // Detach item
  manager.addDocument("pt", "remove o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "remova o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "remover o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "destacar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "destaque o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "destaca o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "separa o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "separar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "retirar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "retira o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "tirar o %item_1% da %item_2%", "detachItem");
  manager.addDocument("pt", "tira o %item_1% da %item_2%", "detachItem");

  manager.slotManager.addSlot("detachItem", "item_1", true, { pt: "De onde retirar o {{ item_1 }}?" });
  manager.slotManager.addSlot("detachItem", "item_2", true, { pt: "Separar o {{ item_1 }} do que?" });

  // Grab item
  manager.addDocument("pt", "pegar a %item%", "grabItem");
  manager.addDocument("pt", "pega a %item%", "grabItem");
  manager.addDocument("pt", "pegue a %item%", "grabItem");
  manager.addDocument("pt", "segurar a %item%", "grabItem");
  manager.addDocument("pt", "segura a %item%", "grabItem");
  manager.addDocument("pt", "segure a %item%", "grabItem");
  manager.addDocument("pt", "roubar o %item%", "grabItem");
  manager.addDocument("pt", "roube o %item%", "grabItem");

  // Fix item
  manager.addDocument("pt", "consertar o %item%", "fixItem");
  manager.addDocument("pt", "consertar a %item%", "fixItem");
  manager.addDocument("pt", "conserte a %item%", "fixItem");
  manager.addDocument("pt", "conserta o %item%", "fixItem");

  // See item
  manager.addDocument("pt", "ver o %item%", "seeItem");
  manager.addDocument("pt", "veja o %item%", "seeItem");
  manager.addDocument("pt", "ver a %item%", "seeItem");
  manager.addDocument("pt", "visualizar a %item%", "seeItem");
  manager.addDocument("pt", "olhar o %item%", "seeItem");
  manager.addDocument("pt", "olhar a %item%", "seeItem");
  manager.addDocument("pt", "olhar %item%", "seeItem");
  manager.addDocument("pt", "olhe %item%", "seeItem");

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
  manager.addDocument("pt", "quem você é?", "whoAreYou");
  manager.addDocument("pt", "o que você é?", "whoAreYou");

  manager.addDocument("pt", "vai se fuder", "curse");
  manager.addDocument("pt", "vá se fuder", "curse");
  manager.addDocument("pt", "vsf", "curse");
  manager.addDocument("pt", "otário", "curse");
  manager.addDocument("pt", "pau no cu", "curse");
  manager.addDocument("pt", "pnc", "curse");
  manager.addDocument("pt", "vtnc", "curse");
  manager.addDocument("pt", "vai toma no cu", "curse");
  manager.addDocument("pt", "arrombado", "curse");
  manager.addDocument("pt", "filho da puta", "curse");

  manager.addDocument("pt", "desculpa", "apologize");
  manager.addDocument("pt", "foi mal", "apologize");
  manager.addDocument("pt", "era brincadeira", "apologize");
  manager.addDocument("pt", "foi sem querer", "apologize");

  manager.addAnswer(
    "pt",
    `whoAreYou`,
    'Na sua língua nativa:\n"Eu sou o éter e o tempo, sou o espaço e o momento. Eu sou aquilo que você não vê, aquilo que movimenta o ser. Eu sou o que você gostaria de ter. Eu sou você."\nEu estou aqui para te ajudar a realizar a profecia. Nada mais, nada menos.',
  );

  manager.addAnswer("pt", "speakEnglish", "No, solo hablo español.");
  manager.addAnswer("pt", "speakEnglish", "Não, só falo português.");
  manager.addAnswer("pt", "speakEnglish", "No, parlo solo italiano.");

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

  manager.addAnswer("pt", "curse", "Você me xingar não vai te ajudar em nada.");
  manager.addAnswer("pt", "curse", "Não gostou mermão?!");
  manager.addAnswer("pt", "curse", "Se você continuar, serei obrigado a te kickar!!");

  manager.addAnswer("pt", "apologize", "Tudo bem, está perdoado.");
  manager.addAnswer("pt", "apologize", "Não tem problema.");
  manager.addAnswer("pt", "apologize", "Ok, mas espero que não se repita, tá bom?");

  manager.addAnswer("pt", `help`, "Já tentou ver um item? Você pode ver os itens que está carregando, ou abrir o inventário.");
  manager.addAnswer(
    "pt",
    `help`,
    "Nesse jogo, para cada movimento, um passo será contabilizado (isso só inclui você trocar de sala / lugar). Conforme você resolve os desafios, você ganha pontos, que se somam e definem o seu score.",
  );
});
