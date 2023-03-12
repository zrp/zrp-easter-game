// add2world({
//   prompt: `Olá, me chamo ${character2front(Characters.BUN)}`,
//   who: Characters.BUN,
// });

// add2world({
//   prompt: `${day} eu estava em uma pequena cidade ao leste de $[Mui](ui:tip,city-mui)$, de onde sou, quando um monstro roubou minha $[cesta de ovos](ui:tip,egg-basket)$, e nem tive tempo de ir atrás dele. A última coisa que me lembro é de vê-lo indo em $[direção ao norte](ui:tip,directions-north)$. Será que você consegue me ajudar?`,
//   who: Characters.BUN,
// });

const moment = require("moment");

const { BUN, PLAYER } = require("../characters");
const { createModel, txt2front, txt2input, txt2output } = require("./");

module.exports = createModel(
  BUN.id,
  // Utterances / Data
  (manager) => {
    manager.addDocument("pt", "de que cidade você é?", "aboutMui");
    manager.addDocument("pt", "conte mais da sua cidade?", "aboutMui");
    manager.addDocument("pt", "aonde fica mui?", "aboutMui");
    manager.addDocument("pt", "cidade de mui", "aboutMui");
    manager.addDocument("pt", "de que cidade você é?", "aboutMui");
    manager.addDocument("pt", "cesta de ovos", "action.basketOfEggs");
    manager.addDocument("pt", "o que é a cesta de ovos", "action.basketOfEggs");
    manager.addDocument("pt", "aonde estão seus ovos", "action.basketOfEggs");
    manager.addDocument("pt", "qual o nome da criatura?", "action.monsterName");
    manager.addDocument("pt", "qual o nome do monstro?", "action.monsterName");
    manager.addDocument("pt", "quem é o monstro?", "action.monsterName");
    manager.addDocument("pt", "você sabe quem é?", "action.monsterName");
    manager.addDocument("pt", "você viu o monstro?", "action.monsterFace");
    manager.addDocument("pt", "como o monstro é?", "action.monsterFace");
    manager.addDocument("pt", "e como era seu rosto?", "action.monsterFace");
    manager.addDocument("pt", "e como ele era?", "action.monsterFace");
    manager.addDocument("pt", "o que eu faço", "ask4help");
    manager.addDocument("pt", "me ajuda", "ask4help");
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
    manager.addDocument("pt", "não", "action.nope");
    manager.addDocument("pt", "jamais", "action.nope");
    manager.addDocument("pt", "nope", "action.nope");
    manager.addDocument("pt", "no", "action.nope");
    manager.addDocument("pt", "rabo", "action.tail");
    manager.addDocument("pt", "que rabo?", "action.tail");
    manager.addDocument("pt", "como era o rabo?", "action.tail");
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
    manager.addDocument("pt", "caralho", "action.complaining");
    manager.addDocument("pt", "foda", "action.complaining");
    manager.addDocument("pt", "porra", "action.complaining");
    manager.addDocument("pt", "claro", "acceptMission");
    manager.addDocument("pt", "é pra já", "acceptMission");
    manager.addDocument("pt", "sim", "acceptMission");
    manager.addDocument("pt", "bora", "acceptMission");
    manager.addDocument("pt", "desculpa", "action.apologize");
    manager.addDocument("pt", "foi mal", "action.apologize");
    manager.addDocument("pt", "era brincadeira", "action.apologize");
    manager.addDocument("pt", "foi sem querer", "action.apologize");
    manager.addDocument("pt", "oi, tudo bom?", "howAreYou");
    manager.addDocument("pt", "tudo bem?", "howAreYou");
    manager.addDocument("pt", "prazer em te conhecer", "action.niceToMeetYou");
    manager.addDocument("pt", "foi um prazer te conhecer", "action.niceToMeetYou");
    manager.addDocument("pt", "feliz em te conhecer", "action.niceToMeetYou");
    manager.addDocument("pt", "bom te conhecer", "action.niceToMeetYou");
    manager.addDocument("pt", "legal te conhecer", "action.niceToMeetYou");
    manager.addDocument("pt", "tchau", "action.bye");
    manager.addDocument("pt", "vlw, flw", "action.bye");
    manager.addDocument("pt", "falou", "action.bye");
    manager.addDocument("pt", "até mais", "action.bye");
    manager.addDocument("pt", "até já", "action.bye");
    manager.addDocument("pt", "abraço", "action.bye");
    manager.addDocument("pt", "aonde estamos?", "whereAreWe");

    manager.addAnswer(
      "pt",
      "ask4help",
      `Você sempre pode me pedir ajuda. Para falar comigo, digite abaixo. Eu sou bem esperto, se eu souber te responder, responderei com prazer. Tente dizer, por exemplo, "o que é a cidade de Mui?".`,
    );
    manager.addAnswer("pt", "action.hello", `Olá, ${txt2output("name")}, você poderia me ajudar?!`);
    manager.addAnswer("pt", "acceptMission", "Aaaah, muito obrigado! Se quiser eu posso te falar sobre como era o monstro, ou sobre a cidade da qual eu sou.");
    manager.addAnswer("pt", "howAreYou", `Bem não estou, claramente! 😠`);
    manager.addAnswer(
      "pt",
      "whereAreWe",
      "Agora estamos no meio da estrada norte-sul. Ao norte fica a floresta branca, uma floresta relativamente calma e sem perigos conhecidos. Ao sul fica a entrada para o pântano de Java, saindo do pântano de Java, continuando para o leste, você chegará em Mui.",
    );
    manager.addAnswer(
      "pt",
      "aboutMui",
      "A cidade de Mui é uma cidade relativamente nova, e é onde eu moro atualmente. Ela é extremamente bem estruturada, e de fácil acesso. Talvez você deva passar por ela, ela fica indo em direção ao sul, após sair do pântano de Java.",
    );
    manager.addAnswer(
      "pt",
      "action.basketOfEggs",
      `Aaaah, minha cesta de ovos. Eu iria distribuí-los até a páscoa, mas ${
        moment().isBefore(moment("2023-04-09"))
          ? "ainda há tempo. Se você encontrá-la, talvez eu possa te recompensar com um desses ovos."
          : "não há mais tempo!"
      }`,
    );
    manager.addAnswer(
      "pt",
      "action.monsterName",
      "Seu nome? Desconhecido. Relatos vieram de todas as direções, guerreiros bravos da guilda $[Vercelida](ui:tip,guilds)$ e da $[Red Ruby](ui:tip,guilds)$ foram vistos lutando contra a besta, sabendo de seu imenso poder.",
    );
    manager.addAnswer(
      "pt",
      "action.monsterFace",
      "Eu não vi o seu rosto, ele parecia grande e feio, talvez um herói de outrora. Nunca se sabe os inimigos que encontraremos, não é mesmo? A única coisa que me lembro, antes de desmaiar, foi de ver seu rabo longo balançando.",
    );
    manager.addAnswer(
      "pt",
      "action.complaining",
      `${txt2front(
        txt2output("name"),
        "ui:who_is",
        PLAYER.id,
      )}, não se irrite! Eu posso te ajudar. Tente me perguntar, por exemplo, "o que é a cidade de Mui?"`,
    );
    manager.addAnswer("pt", "action.tail", `Sim, um rabo longo, com longos fios na ponta, mas como te disse, não vi muita coisa, posso estar enganado.`);
    manager.addAnswer("pt", "action.niceToMeetYou", `O prazer de te conhecer é meu, {{name}}! Algo em que possa ajudá-lo?`);
    manager.addAnswer("pt", "action.nope", "Aaaah, tudo bem, outros provavelmente terão interesse em me ajudar.");
    manager.addAnswer("pt", "action.curse", "Vá @* !%#@*! E não fale mais comigo!! 🤬");
    manager.addAnswer("pt", "action.bye", "Até logo");
  },
);
