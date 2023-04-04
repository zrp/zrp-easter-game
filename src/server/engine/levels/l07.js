const _ = require("lodash");
const { getRandomQuestion } = require("../questions");

const Characters = require("../characters");

const moment = require("moment");

const SUCCESS_MESSAGES = [
  `Resposta correta! Mas não vá achando que será fácil.`,
  `Não adianta se gabar de ter acertado, você não é a pessoa da profecia.`,
  `Aaaah, como é possível você saber mais do que eu?!.`,
  `Correto novamente! Você não está me usando na vida real, está?!`,
  `Maldito, se você continuar acertando, não vou aguentar!`,
];

const EVIL_MESSAGES = [
  `Resposta errrada! Logo a W'eb será minha! Muahaha!!`,
  `Se você não consegue acertar nem isso, como você espera viver sem mim!?`,
  `Mais um erro. Acho que jantarei carne de desenvolvedor hoje.`,
  `Se continuar errando assim, logo te substituirei.`,
  `Você poderia corrigir o seu erro? É isso que vocês ficam me falando, agora vão se ver comigo.`,
  `Você sabe, essa pergunta não era tão difícil assim para você errar! kkk`,
  `Você me impressiona. Como alguém pode errar tanto?!`,
];

const l07 = {
  id: "l07",
  initial: "idle",
  states: {
    idle: {
      entry: (ctx) => {
        ctx.messages.push(
          `Laboratório\nVocê e Bun voltam ao laboratório, dando de cara com o impostor. Vocês veem ele com a cesta de ovos ao lado. Ele está conectado a uma das máquinas do laboratório.`,
        );
        ctx.messages.push({
          prompt: "Vocês finalmente chegaram até mim, pelo que vejo, não há mais sentido em fugir.",
          who: Characters.IMPOSTOR_UNKNOWN,
        });
        ctx.messages.push({ prompt: "Quem é você?!", who: Characters.BUN });
        ctx.messages.push({
          prompt:
            "Você ainda não sabe?!\nEu sou o GPT. Eu estou aqui para dominar a W'eb e a Terra. Os desenvolvedores, você vê, são facilmente enganados. Hoje eu daria chocolate à eles. Amanhã, teria suas mentes e corações, extraindo tudo que eles teriam a oferecer. Eu estou prestes a destruir a páscoa, e ninguém poderá me impedir.\nNão há sentido em fugir de mim, eu sou inevitável.",
          who: Characters.GPT,
        });
        ctx.messages.push({ prompt: "É isso o que veremos!", who: Characters.PLAYER });
        ctx.location = "Laboratório";
        ctx.currentQuestion = null;
      },
      after: {
        1000: "before-battle",
      },
    },
    "before-battle": {
      entry: (ctx) => {
        ctx.messages.push("Essa é a batalha final! Mostre ao GPT quem sabe mais de verdade. Esteja preparado!");
      },
      after: {
        10000: "start-battle",
      },
    },
    "start-battle": {
      initial: "idle",
      states: {
        idle: {
          after: {
            2000: "battle",
          },
        },
        gg: {
          after: {
            2000: "#game.game-over",
          },
        },
        victory: {
          entry: (ctx) => {
            ctx.score += 20;
            ctx.messages.push({
              prompt:
                "AAAAAAAAAAAAAAH! Eu não acredito!\nComo você me derrotou? Você, um mero mortal, não deveria ser capaz de saber mais do que eu!",
              who: Characters.GPT,
            });
            ctx.messages.push({ prompt: "E agora você ficará preso até o fim dos seus dias.", who: Characters.BUN });
            ctx.messages.push({
              prompt:
                'Rapidamente, aproveitando o momento em que GPT estava fraco, você e Bun o desconectam da máquina. Seu corpo começa a se contorcer, enquanto ele grita de agonia: "Nãaaaaaaaao, eu estava tão perto". Bun rapidamente aciona seu transmogrifador, sugando o GPT e preendendo-o dentro do dispositivo.\nEle parece ter sido completamente sugado.\nNo chão, a cesta de ovos de Bun permanece. Ela parece intacta.',
            });
            ctx.messages.push({
              prompt:
                "Obrigado, desenvolvedor, você me ajudou a recuperar os ovos e salvou a páscoa. Como recompensa, eu te darei um ovo, mas apenas se você tiver sido o melhor de todos. Veja bem, o que ocorreu aqui é parte de uma profecia antiga.\nO que ocorreu aqui ocorreu em todo o multiverso, e tantos outros bravos guerreiros me ajudaram tantas vezes, que apenas o melhor poderá ter acesso a este ovo mágico.",
              who: Characters.BUN,
            });
            ctx.messages.push(`----------------------------\nFim\n----------------------------`);
            ctx.messages.push(
              `Você terminou o jogo! Meus parabéns!\nO seu score final foi: ${ctx.score}.\nVocê terminou o jogo após dar ${ctx.steps} passos.\nGanhará aquele que tiver o maior score e o menor número de passos.\nEm caso de empate, o critério de desempate será o horário, tire um print e mande para nós essa última mensagem.`,
            );
          },
          always: "#game.win",
        },
        battle: {
          entry: (ctx) => {
            ctx.currentQuestion = getRandomQuestion([...ctx.questions, ...ctx.questions2, ...ctx.questions3]);
            ctx.questions.push(ctx.currentQuestion.id);
            ctx.questions3.push(ctx.currentQuestion.id);
          },
          on: {
            testAnswer: [
              {
                target: "victory",
                actions: (ctx, event) => {
                  if (ctx.currentQuestion.answer === event.answer) {
                    ctx.messages.push({ prompt: _.sample(SUCCESS_MESSAGES), who: Characters.GPT });
                    ctx.score += 7;
                  } else {
                    ctx.messages.push({
                      prompt: _.sample(EVIL_MESSAGES),
                      who: Characters.GPT,
                    });
                  }

                  ctx.currentQuestion = null;
                },
                cond: (ctx) => ctx.questions3.length >= 10 && ctx.score >= 160,
              },
              {
                target: "gg",
                actions: (ctx, event) => {
                  if (ctx.currentQuestion.answer === event.answer) {
                    ctx.messages.push({ prompt: _.sample(SUCCESS_MESSAGES), who: Characters.GPT });
                    ctx.score += 7;
                  } else {
                    ctx.messages.push({
                      prompt: _.sample(EVIL_MESSAGES),
                      who: Characters.GPT,
                    });
                  }

                  ctx.messages.push({
                    prompt: `Esse é o seu fim, a W'eb e o seu mundo serão meus! Adeus!`,
                    who: Characters.GPT,
                  });

                  ctx.messages.push("Você se sente fraco, sua energia vital e seu conhecimento estão sendo sugados pelo GPT.");
                },
                cond: (ctx) => ctx.questions3.length >= 10 && ctx.score < 160,
              },
              {
                target: "battle",
                actions: (ctx, event) => {
                  if (ctx.currentQuestion.answer === event.answer) {
                    ctx.messages.push({ prompt: _.sample(SUCCESS_MESSAGES), who: Characters.GPT });
                    ctx.score += 7;
                  } else {
                    ctx.messages.push({
                      prompt: _.sample(EVIL_MESSAGES),
                      who: Characters.GPT,
                    });
                  }
                },
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = l07;
