const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit } = require("../context");
const { ITEMS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

const { getRandomQuestion } = require("../questions");

const l05 = {
  id: "l05",
  initial: "idle",
  states: {
    idle: {
      after: {
        5000: "battle",
      },
    },
    gg: {
      after: {
        2000: "#game.game-over",
      },
    },
    battle: {
      entry: (ctx) => {
        ctx.currentQuestion = getRandomQuestion([...ctx.questions, ...ctx.questions2]);
        ctx.questions.push(ctx.currentQuestion.id);
        ctx.questions2.push(ctx.currentQuestion.id);
      },
      on: {
        testAnswer: [
          {
            target: "#l06",
            actions: (ctx, event) => {
              if (ctx.currentQuestion.answer === event.answer) {
                ctx.messages.push({ prompt: "Correto!", who: Characters.BUN });
                ctx.score += 9;
              } else {
                ctx.messages.push({ prompt: "Errrrrrrou!", who: Characters.BUN });
              }

              ctx.currentQuestion = null;
              ctx.messages.push({ prompt: "Mas ok, você me provou conhecer o bastante! Eu confio em você.", who: Characters.BUN });
            },
            cond: (ctx) => ctx.questions2.length >= 5 && ctx.score >= 90,
          },
          {
            target: "gg",
            actions: (ctx, event) => {
              if (ctx.currentQuestion.answer === event.answer) {
                ctx.messages.push({ prompt: "Correto!", who: Characters.BUN });
                ctx.score += 9;
              } else {
                ctx.messages.push({ prompt: "Errrrrrrou!", who: Characters.BUN });
              }

              ctx.messages.push({ prompt: "Com esses resultados eu não posso confiar em você!", who: Characters.BUN });
            },
            cond: (ctx) => ctx.questions2.length >= 5 && ctx.score < 90,
          },
          {
            target: "battle",
            actions: (ctx, event) => {
              if (ctx.currentQuestion.answer === event.answer) {
                ctx.messages.push({ prompt: "Correto!", who: Characters.BUN });
                ctx.score += 9;
              } else {
                ctx.messages.push({ prompt: "Errrrrrrou!", who: Characters.BUN });
              }
            },
          },
        ],
      },
    },
  },
};

module.exports = l05;
