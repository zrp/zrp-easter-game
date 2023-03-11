const { createMachine, interpret, assign } = require("xstate");

const Characters = require("./characters");
const moment = require("moment");
const l = require("../logger");
const { getSpeakFunction } = require("./models/bun");

const STATES = {
  WITH_BUN: "with-bun",
  WITHOUT_BUN: "without-bun",
  NORTH_FLOREST_01: "north-florest-01",
};

/**
 *
 * @param {*} user - The current user
 * @param {*} responder - A function that responds to clients
 * @returns
 */
module.exports = (user, responder) => {
  /**
   * A function of the initialState and context
   */
  return (initialState, ctx = {}) => {
    const initial = initialState ?? STATES.WITH_BUN;
    const context = { ...ctx, name: user?.name?.givenName };

    // const increaseSteps = assign({ steps: (context) => context.steps + 1 })

    const states = {
      [STATES.WITH_BUN]: {
        entry: assign({ speakTo: (context) => getSpeakFunction(context) }),
        on: {
          // WITH BUN
          startGame: {
            target: [STATES.WITH_BUN],
            actions: ["startGame"],
          },
          speak: {
            target: [STATES.WITH_BUN],
            actions: async (context, { prompt }) => {
              const { intent, answer } = await context.speakTo?.(prompt);

              if (intent == "None") {
                responder(
                  {
                    worldAdd: {
                      interactive: true,
                      animate: true,
                      prompt: "Não entendi o que você quis dizer. Precisa de $[ajuda](ui:help)$?",
                      who: Characters.BUN,
                    },
                  },
                  false,
                );
                return;
              } else {
                responder(
                  {
                    worldAdd: {
                      interactive: true,
                      animate: true,
                      prompt: answer,
                      who: Characters.BUN,
                    },
                  },
                  false,
                );
              }
            },
          },
          // GO TO FLOREST
          "action.goNorth": {
            target: [STATES.NORTH_FLOREST_01],
            actions: ["goNorthFlorest"],
          },
        },
      },
      [STATES.WITHOUT_BUN]: {
        "action.goNorth": {
          target: [STATES.NORTH_FLOREST_01],
          actions: ["goNorthFlorest"],
        },
        "action.apologize": {
          target: [STATES.WITHOUT_BUN],
          actions: ["apologize"],
        },
      },
      [STATES.NORTH_FLOREST_01]: {
        // entry: [increaseSteps],
        on: {
          "action.goSouth": [STATES.WITH_BUN],
          // actions: [increaseSteps]
        },
      },
    };

    const actions = {
      tail: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Sim, um rabo longo com fios pretos na ponta, mas como te disse, não vi muita coisa, posso estar enganado.`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      apologize: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Você voltou para se desculpar com ${characterToToken(
        //       Characters.BUN,
        //     )}, mas ele não estava mais lá! Você se lembra vagamente que ele comentou algo sobre ir para o norte.`,
        //     who: null,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      curse: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Vá você, e não fale mais comigo.`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
        // responder({
        //   worldAdd: {
        //     prompt: `${characterToToken(Characters.BUN)} sai irritado e apressado, te xingando para a cidade toda.`,
        //     who: null,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      complaining: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `${user?.givenName?.name}, não se irrite! Eu posso te ajudar. Tente me perguntar, por exemplo, "o que é a cidade de Mui?"`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      help: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Ajuda? Claro!`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
        // responder({
        //   worldAdd: {
        //     prompt: `Você sempre pode me pedir ajuda. Para falar comigo, digite abaixo. Eu sou bem esperto, se eu souber te responder, responderei com prazer. Tente dizer, por exemplo, "o que é a cidade de Mui?".`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      hello: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Olá, viajante, você poderia me ajudar?!`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      ofCourse: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Aaaah, muito obrigado! Se quiser eu posso te falar sobre como era o monstro, ou sobre a cidade da qual eu sou.`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      nope: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Então vá @* !%#@*! E não fale mais comigo`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      howAreYou: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Bem não estou, claramente! 😠`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      niceToMeetYou: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `O prazer de te conhecer é meu, ${user?.givenName?.name}! Algo em que possa ajudá-lo?`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      bye: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Até logo!`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
        // responder({
        //   worldAdd: {
        //     prompt: `Você vê ${characterToToken(Characters.BUN)} indo embora!`,
        //     who: null,
        //     interactive: true,
        //     animate: true,
        //   },
        // });
      },
      startGame: async (context, event) => {
        const name = user.name?.givenName;
        const now = new Date();

        let day = now.getHours() <= 12 ? "Nesta manhã" : now.getHours() <= 18 ? "Nesta tarde" : "Nesta noite";

        // responder({
        //   worldAdd: {
        //     prompt: `Olá, $[${name}](ui:who_is,${Characters.PLAYER.id})$, me chamo ${characterToToken(Characters.BUN)}`,
        //     who: Characters.BUN,
        //     interactive: true,
        //     animate: true,
        //   },
        // });

        // responder({
        //   worldAdd: {
        //     prompt: `${day} eu estava em uma pequena cidade ao leste de $[Mui](ui:tip,city-mui)$, de onde sou, quando um monstro roubou minha $[cesta de ovos](ui:tip,egg-basket)$, e nem tive tempo de ir atrás dele. A última coisa que me lembro é de vê-lo indo em $[direção ao norte](ui:tip,directions-north)$. Será que você consegue me ajudar?`,
        //     who: Characters.BUN,
        //     animate: true,
        //     interactive: true,
        //   },
        // });
      },
      talkAboutMuiGuild: () => {
        responder({
          worldAdd: {
            prompt: `A cidade de Mui é uma cidade relativamente nova, e é onde eu moro atualmente. Ela é extremamente bem estruturada, e de fácil acesso. Talvez você deva passar por ela, ela fica indo em direção ao sul, após sair do pântano de Java.`,
            who: Characters.BUN,
            animate: true,
            interactive: true,
            fsm: {
              id: "L01_DUNGEON",
              state: STATES.WITH_BUN,
            },
          },
        });
      },
      talkAboutBasketOfEggs: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Aaaah, minha cesta de ovos. Eu iria distribuí-los até a páscoa, mas ${
        //       moment().isBefore(moment("2023-04-09"))
        //         ? "ainda há tempo. Se você encontrá-la, talvez eu possa te recompensar com um desses ovos."
        //         : "não há mais tempo!"
        //     }`,
        //     who: Characters.BUN,
        //     animate: true,
        //     interactive: true,
        //     fsm: {
        //       id: "L01_DUNGEON",
        //       state: STATES.WITH_BUN,
        //     },
        //   },
        // });
      },
      talkAboutMonsterName: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Seu nome? Desconhecido. Relatos vieram de todas as direções, guerreiros bravos da guilda $[Vercelida](ui:tip,guilds)$ e da $[Red Ruby](ui:tip,guilds)$ foram vistos lutando contra a besta, sabendo de seu imenso poder.`,
        //     who: Characters.BUN,
        //     animate: true,
        //     interactive: true,
        //     fsm: {
        //       id: "L01_DUNGEON",
        //       state: STATES.WITH_BUN,
        //     },
        //   },
        // });
      },
      talkAboutMonsterFace: () => {
        // responder({
        //   worldAdd: {
        //     prompt: `Eu não vi o seu rosto, ele parecia grande e feio, talvez um herói de outrora. Nunca se sabe os inimigos que encontraremos, não é mesmo? A única coisa que me lembro, antes de desmaiar, foi de ver seu rabo longo balançando.`,
        //     who: Characters.BUN,
        //     animate: true,
        //     interactive: true,
        //     fsm: {
        //       id: "L01_DUNGEON",
        //       state: STATES.WITH_BUN,
        //     },
        //   },
        // });
      },
      goNorthFlorest: async (context, event) => {
        responder({
          worldAdd: {
            prompt: `Você foi para o norte, você vê uma floresta branca e ouve barulhos. Os animais correm para uma clareira branca, ao leste, e você vê um objeto brilhante no chão.`,
            interactive: true,
            animate: true,
            fsm: {
              id: "L01_DUNGEON",
              state: STATES.NORTH_FLOREST_01,
            },
            context,
          },
        });
      },
    };

    const fsm = createMachine(
      {
        preserveActionOrder: true,
        predictableActionArguments: true,
        id: "main",
        context,
        initial,
        states,
      },
      {
        actions,
      },
    );

    // Transitions
    return interpret(fsm).onTransition((state) => l.debug(`FSM transitioned to ${state.value} with context ${JSON.stringify(state.context, null, 2)}`));
  };
};
