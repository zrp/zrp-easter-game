const { createLevel } = require("./");
const { assign } = require("xstate");

const Characters = require("../characters");
const l = require("../../logger");

const { getSpeakFunction: bun } = require("../models/bun");
const { getSpeakFunction: narrator } = require("../models/narrator");

const STATES = {
  S01: "with-bun",
  S02: "without-bun",
  S03: "north-florest-01",
};

module.exports = (add2world, setError) => {
  const talk2npc = async (context, { prompt }) => {
    const { npc, who } = context;
    let { intent, answer, ...args } = (await npc(prompt)) ?? { intent: "None", answer: null };
    answer = intent == "None" ? "Não entendi o que você quis dizer. Precisa de $[ajuda](ui:help)$?" : answer;

    if (!answer || answer == "") {
      l.debug(`Empty answer found, set intent ${intent} to fsm`);
      return;
    }
    add2world({
      prompt: answer,
      who,
    });
  };

  return {
    id: "l01",
    initial: [STATES.S02],
    states: {
      [STATES.S01]: {
        exit: ["countSteps", assign({ npc: null })],
        on: {
          prompt: {
            target: [STATES.S01],
            actions: [
              assign({
                npc: bun,
                who: Characters.BUN,
              }),
              talk2npc,
            ],
          },
          // GO TO FLOREST
          // "action.goNorth": {
          //   target: [STATES.S03],
          //   // actions: ["goNorthFlorest"],
          // },
        },
      },
      [STATES.S02]: {
        entry: assign({ npc: narrator }),
        exit: ["countSteps"],
        on: {
          prompt: {
            target: [STATES.S01],
            actions: [
              assign({
                npc: narrator,
                who: Characters.NARRATOR,
              }),
              talk2npc,
            ],
          },
          startGame: {
            actions: async ({ name }, event) => {
              const now = new Date();

              let day = now.getHours() <= 12 ? "manhã" : now.getHours() <= 18 ? "tarde" : "noite";

              add2world({
                prompt: `bem-vindo, ${name}, nesta ${day}, como de costume, você segue o seu caminhar pela estrada norte-sul do reino de Nodeville`,
                who: Characters.NARRATOR,
              });

              add2world({
                prompt: `você começa a ouvir uma voz triste e espalhafatosa por perto, e fica curioso para entender de onde vem essa voz`,
                who: Characters.NARRATOR,
              });
            },
          },
        },
      },
      // [STATES.S03]: {
      //   exit: ["countSteps"],
      //   on: {
      //     "action.goSouth": [STATES.S01],
      //   },
      // },
    },
  };
};
