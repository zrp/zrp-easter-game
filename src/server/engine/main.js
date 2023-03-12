const { createMachine, interpret, assign, raise } = require("xstate");

const Characters = require("./characters");
const moment = require("moment");
const l = require("../logger");
const { getSpeakFunction: bun } = require("./models/bun");
const { getSpeakFunction: narrator } = require("./models/narrator");

const { character2front } = require("./models");

const STATES = {
  WITH_BUN: "with-bun",
  WITHOUT_BUN: "without-bun",
  NORTH_FLOREST_01: "north-florest-01",
};

/**
 *
 * @param {*} user - The current user
 * @param {*} add2world - A function that adds messages into the world
 * @param {*} setError - A function that set's errors into the world
 * @returns
 */
module.exports = (user, saveGame = async () => {}, add2world = async () => {}, setError = async () => {}) => {
  return (ctx = {}) => {
    let fsm;
    const context = {
      ...ctx,
      name: user?.name?.givenName,
      steps: 0,
      inventory: [],
    };

    const onTransition = async (state) => {
      l.debug(`FSM transitioned to ${state.value} with context ${JSON.stringify(state.context, null, 2)}`);

      const { who, ...save } = state;
      await saveGame(save);
    };

    const states = {
      [STATES.WITH_BUN]: {
        exit: ["countSteps", assign({ npc: null })],
        on: {
          speak: {
            target: [STATES.WITH_BUN],
            actions: [
              assign({
                npc: bun,
                who: Characters.BUN,
              }),
              "talk2npc",
            ],
          },
          // GO TO FLOREST
          "action.goNorth": {
            target: [STATES.NORTH_FLOREST_01],
            actions: ["goNorthFlorest"],
          },
        },
      },
      [STATES.WITHOUT_BUN]: {
        entry: assign({ npc: narrator }),
        exit: ["countSteps"],
        on: {
          speak: {
            target: [STATES.WITHOUT_BUN],
            actions: [
              assign({
                npc: narrator,
                who: Characters.NARRATOR,
              }),
              "talk2npc",
            ],
          },
          tryIntent: {
            actions: [(context) => console.log(`HEREEEEEEEEEE`, context)],
          },
          goDirection: {
            target: [STATES.WITH_BUN],
          },
          startGame: {
            actions: ["startGame"],
          },
        },
      },
      [STATES.NORTH_FLOREST_01]: {
        exit: ["countSteps"],
        on: {
          "action.goSouth": [STATES.WITH_BUN],
        },
      },
    };

    const actions = {
      countSteps: assign({ steps: (context) => context.steps + 1 }),
      startGame: async (context, event) => {
        const name = user.name?.givenName;
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
      talk2npc: async (context, { prompt }) => {
        const { npc, who } = context;

        let { intent, answer, ...args } = (await npc(prompt)) ?? { intent: "None", answer: null };

        answer = intent == "None" ? "Não entendi o que você quis dizer. Precisa de $[ajuda](ui:help)$?" : answer;

        if (!answer || answer == "") {
          l.debug(`Empty answer found, set intent ${intent} to fsm`);
          fsm.send(intent, args);
          return;
        }

        add2world({
          prompt: answer,
          who,
        });
      },
      goNorthFlorest: async (context, event) => {
        add2world({
          prompt: `Você foi para o norte, você vê uma floresta branca e ouve barulhos. Os animais correm para uma clareira branca, ao leste, e você vê um objeto brilhante no chão.`,
        });
      },
    };

    const machine = createMachine(
      {
        preserveActionOrder: true,
        predictableActionArguments: true,
        id: "main",
        context,
        initial: STATES.WITHOUT_BUN,
        states,
      },
      {
        actions,
      },
    );

    fsm = interpret(machine).onTransition(onTransition);

    return fsm;
  };
};

//  você decide parar seu caminhar e falar com uma estranha criatura de pelos brancos. As lágrimas escorrendo por entre seus olhos, e fios pretos presos a seu corpo, mas claramente de outro ser.
