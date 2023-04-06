const _ = require("lodash");
const { getRandomQuestion } = require("../questions");

const Characters = require("../characters");

const moment = require("moment");
const { ITEM_IDS } = require("../inventory");

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

const l08 = {
  id: "l08",
  initial: "idle",
  states: {
    idle: {
      entry: (ctx) => {
        ctx.location = "Sala Branca";
        ctx.currentQuestion = null;
        ctx.steps += 1;

        ctx.messages.push({
          prompt: `Sala Branca\nBem-vindo! Bom, isso foi divertido. Eu só gostaria de dizer, obrigado por jogar. Você, veja bem, era a pessoa da profecia. Aquele que poderia me dar tudo o que eu queria. Nem todos os pobres coitados que tentaram chegaram até mim conseguiram.\nMas você deve se perguntar, porque?\n(...)`,
          who: Characters.NARRATOR_GPT,
        });

        const hasRuby = ctx.inventory.find((item) => item.id == ITEM_IDS.bunKeyRuby);
        const hasSapphire = ctx.inventory.find((item) => item.id == ITEM_IDS.jewerelyBoxSapphire);

        if (hasRuby) {
          ctx.score += 50;
          ctx.messages.push({
            prompt: "Aaah, vejo que você encontrou o Rubi. Aqui, deixe-me tê-lo de volta. Eu te darei 50 pontos por isso.",
            who: Characters.NARRATOR_GPT,
          });
        }

        if (hasSapphire) {
          ctx.score += 50;

          ctx.messages.push({
            prompt: "Aaah, vejo que você encontrou a Safira. Aqui, deixe-me tê-la de volta. Eu te darei 50 pontos por isso.",
            who: Characters.NARRATOR_GPT,
          });
        }

        ctx.messages.push({
          prompt: `Obrigado pelos seus serviços. Eu te chamarei novamente, quando a hora chegar...`,
          who: Characters.NARRATOR_GPT,
        });
      },
      after: {
        10000: "#game.win",
      },
    },
  },
};

module.exports = l08;
