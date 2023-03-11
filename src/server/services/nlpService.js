const { NlpManager } = require("node-nlp");

const path = require("path");

const manager = new NlpManager({
  languages: ["pt"],
  forceNER: true,
  nlu: { log: process.env.NODE_ENV !== "production" },
});

// goNorth
manager.addDocument("pt", "ir para o norte", "action.goNorth");
manager.addDocument("pt", "vá para o norte", "action.goNorth");

// goSouth
manager.addDocument("pt", "ir para o sul", "action.goSouth");
manager.addDocument("pt", "vá para o sul", "action.goSouth");

// goEast
manager.addDocument("pt", "ir para o leste", "action.goEast");
manager.addDocument("pt", "vá para o leste", "action.goEast");

// goWest
manager.addDocument("pt", "ir para o oeste", "action.goWest");
manager.addDocument("pt", "vá para o oeste", "action.goWest");

// mui
manager.addDocument("pt", "de que cidade você é?", "action.mui");
manager.addDocument("pt", "aonde fica mui?", "action.mui");
manager.addDocument("pt", "cidade de mui", "action.mui");
manager.addDocument("pt", "mui", "action.mui");
manager.addDocument("pt", "de que cidade você é?", "action.mui");

// basketOfEggs
manager.addDocument("pt", "cesta de ovos", "action.basketOfEggs");
manager.addDocument("pt", "o que é a cesta de ovos", "action.basketOfEggs");
manager.addDocument("pt", "aonde estão seus ovos", "action.basketOfEggs");

// monsterName
manager.addDocument("pt", "qual o nome da criatura?", "action.monsterName");
manager.addDocument("pt", "qual o nome do monstro?", "action.monsterName");
manager.addDocument("pt", "quem é o monstro?", "action.monsterName");
manager.addDocument("pt", "você sabe quem é?", "action.monsterName");

// monsterFace
manager.addDocument("pt", "você viu o monstro?", "action.monsterFace");
manager.addDocument("pt", "como o monstro é?", "action.monsterFace");
manager.addDocument("pt", "e como era seu rosto?", "action.monsterFace");
manager.addDocument("pt", "e como ele era?", "action.monsterFace");

// what should i do
manager.addDocument("pt", "o que eu faço", "action.help");
manager.addDocument("pt", "me ajuda", "action.help");

// hi
manager.addDocument("pt", "oi", "action.hello");
manager.addDocument("pt", "olá", "action.hello");
manager.addDocument("pt", "alô", "action.hello");
manager.addDocument("pt", "fala", "action.hello");
manager.addDocument("pt", "e aí?", "action.hello");
manager.addDocument("pt", "coé", "action.hello");
manager.addDocument("pt", "opa", "action.hello");
manager.addDocument("pt", "bom dia", "action.hello");
manager.addDocument("pt", "boa tarde", "action.hello");
manager.addDocument("pt", "boa noite", "action.hello");

// nope
manager.addDocument("pt", "não", "action.nope");
manager.addDocument("pt", "jamais", "action.nope");
manager.addDocument("pt", "nope", "action.nope");
manager.addDocument("pt", "no", "action.nope");

// tail
manager.addDocument("pt", "rabo", "action.tail");
manager.addDocument("pt", "que rabo?", "action.tail");
manager.addDocument("pt", "como era o rabo?", "action.tail");

// curse
manager.addDocument("pt", "vai se fuder", "action.curse");
manager.addDocument("pt", "vá se fuder", "action.curse");
manager.addDocument("pt", "vsf", "action.curse");
manager.addDocument("pt", "otário", "action.curse");
manager.addDocument("pt", "pau no cu", "action.curse");
manager.addDocument("pt", "pnc", "action.curse");
manager.addDocument("pt", "vtnc", "action.curse");
manager.addDocument("pt", "vai toma no cu", "action.curse");
manager.addDocument("pt", "arrombado", "action.curse");
manager.addDocument("pt", "filho da puta", "action.curse");

// complaining
manager.addDocument("pt", "caralho", "action.complaining");
manager.addDocument("pt", "foda", "action.complaining");
manager.addDocument("pt", "porra", "action.complaining");

// of course
manager.addDocument("pt", "claro", "action.ofCourse");
manager.addDocument("pt", "é pra já", "action.ofCourse");
manager.addDocument("pt", "sim", "action.ofCourse");
manager.addDocument("pt", "bora", "action.ofCourse");

// apologize
manager.addDocument("pt", "desculpa", "action.apologize");
manager.addDocument("pt", "foi mal", "action.apologize");
manager.addDocument("pt", "era brincadeira", "action.apologize");
manager.addDocument("pt", "foi sem querer", "action.apologize");

// how are you
manager.addDocument("pt", "oi, tudo bom?", "action.howAreYou");
manager.addDocument("pt", "tudo bem?", "action.howAreYou");

// nice to meet you
manager.addDocument("pt", "prazer em te conhecer", "action.niceToMeetYou");
manager.addDocument("pt", "foi um prazer te conhecer", "action.niceToMeetYou");
manager.addDocument("pt", "feliz em te conhecer", "action.niceToMeetYou");
manager.addDocument("pt", "bom te conhecer", "action.niceToMeetYou");
manager.addDocument("pt", "legal te conhecer", "action.niceToMeetYou");

// bye bye
manager.addDocument("pt", "tchau", "action.bye");
manager.addDocument("pt", "vlw, flw", "action.bye");
manager.addDocument("pt", "falou", "action.bye");
manager.addDocument("pt", "até mais", "action.bye");
manager.addDocument("pt", "até já", "action.bye");
manager.addDocument("pt", "abraço", "action.bye");

// where are we
manager.addDocument("pt", "aonde estamos?", "action.whereAreWe");

const getIntent = async (sentence) => {
  const response = await manager.process("pt", sentence);

  return response.intent;
};

const train = async () => {
  await manager.train();
  manager.save();
};

module.exports = {
  getIntent,
  train,
};
