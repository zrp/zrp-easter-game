const { createMachine, interpret, assign } = require('xstate');

const Characters = require('./characters');
const moment = require('moment');
const l = require('../logger');

const STATES = {
  HOME: 'home',
  NORTH_FLOREST_01: 'north-florest-01'
}

const characterToToken = (character) => {
  const id = character.id;
  const name = character.name;

  return `$[${name}](ui:who_is,${id})$`
}

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
  return (initialState, context) => {
    const initial = initialState ?? 'home';
    const ctx = context ?? { steps: 0 };

    // const increaseSteps = assign({ steps: (context) => context.steps + 1 })

    const states = {
      [STATES.HOME]: {
        on: {
          'startGame': {
            target: [STATES.HOME],
            actions: ['startGame']
          },
          'action.help': {
            target: [STATES.HOME],
            actions: ['help'],
          },
          'action.mui': {
            target: [STATES.HOME],
            actions: ['talkAboutMuiGuild'],
          },
          'action.basketOfEggs': {
            target: [STATES.HOME],
            actions: ['talkAboutBasketOfEggs'],
          },
          'action.monsterName': {
            target: [STATES.HOME],
            actions: ['talkAboutMonsterName'],
          },
          'action.monsterFace': {
            target: [STATES.HOME],
            actions: ['talkAboutMonsterFace'],
          },
          'action.goNorth': {
            target: [STATES.NORTH_FLOREST_01],
            actions: ['goNorthFlorest']
          },
        }
      },
      [STATES.NORTH_FLOREST_01]: {
        // entry: [increaseSteps],
        on: {
          'action.goSouth': [STATES.HOME],
          // actions: [increaseSteps]
        }
      }
    }

    const actions = {
      help: async () => {
        responder({
          worldAdd: {
            prompt: `Ajuda? Claro!`,
            who: Characters.BUN,
            interactive: true,
            animate: true,
          }
        });

        responder({
          worldAdd: {
            prompt: `Você sempre pode me pedir ajuda. Para falar comigo, digite abaixo. Eu sou bem esperto, se eu souber te responder, responderei com prazer. Tente dizer, por exemplo, "o que é a cidade de Mui?".`,
            who: Characters.BUN,
            interactive: true,
            animate: true,
          }
        })
      },
      startGame: async (context, event) => {
        const name = user.name?.givenName;
        const now = new Date();

        let day = now.getHours() <= 12 ? "Nesta manhã" : now.getHours() <= 18 ? "Nesta tarde" : "Nesta noite";

        responder({
          worldAdd: {
            prompt: `Olá, $[${name}](ui:who_is,99-user)$, me chamo ${characterToToken(Characters.BUN)}`,
            who: Characters.BUN,
            interactive: true,
            animate: true,
          }
        })

        responder({
          worldAdd: {
            prompt: `${day}, uma força terrível causou espanto nos moradores de uma pequena cidade ao leste de $[Mui](ui:tip,city-mui)$, de onde sou. Um monstro roubou minha $[cesta de ovos](ui:tip,egg-basket)$, e nem tive tempo de ir atrás dele. A última coisa que me lembro é de vê-lo indo em $[direção ao norte](ui:tip,directions-north)$.`,
            who: Characters.BUN,
            animate: true,
            interactive: true,
          }
        });

      },
      talkAboutMuiGuild: async () => {
        responder({
          worldAdd: {
            prompt: `A cidade de Mui é uma cidade relativamente nova, e é onde eu moro atualmente. Ela é extremamente bem estruturada, e de fácil acesso. Talvez você deva passar por ela, ela fica indo em direção ao sul, após sair do pântano de Java.`,
            who: Characters.BUN,
            animate: true,
            interactive: true,
            fsm: {
              id: 'L01_DUNGEON',
              state: STATES.HOME,
            },
          }
        });
      },
      talkAboutBasketOfEggs: async () => {
        responder({
          worldAdd: {
            prompt: `Aaaah, minha cesta de ovos. Eu iria distribuí-los até a páscoa, mas ${moment().isBefore(moment('2023-04-09')) ? 'ainda há tempo. Se você encontrá-la, talvez eu possa te recompensar com um desses ovos.' : 'não há mais tempo!'}`,
            who: Characters.BUN,
            animate: true,
            interactive: true,
            fsm: {
              id: 'L01_DUNGEON',
              state: STATES.HOME,
            },
          }
        });
      },
      talkAboutMonsterName: async () => {
        responder({
          worldAdd: {
            prompt: `Seu nome? Desconhecido. Relatos vieram de todas as direções, guerreiros bravos da guilda $[Vercelida](ui:tip,guilds)$ e da $[Red Ruby](ui:tip,guilds)$ foram vistos lutando contra a besta, sabendo de seu imenso poder.`,
            who: Characters.BUN,
            animate: true,
            interactive: true,
            fsm: {
              id: 'L01_DUNGEON',
              state: STATES.HOME,
            },
          },
        });
      },
      talkAboutMonsterFace: async () => {
        responder({
          worldAdd: {
            prompt: `Eu não vi o seu rosto, ele parecia grande e feio, talvez um herói de outrora. Nunca se sabe os inimigos que encontraremos, não é mesmo? A única coisa que me lembro, antes de desmaiar, foi de ver seu rabo curto balançando.`,
            who: Characters.BUN,
            animate: true,
            interactive: true,
            fsm: {
              id: 'L01_DUNGEON',
              state: STATES.HOME,
            },
          }
        });
      },
      goNorthFlorest: async (context, event) => {
        responder({
          worldAdd: {
            prompt: `Você foi para o norte, você vê uma floresta branca e ouve barulhos. Os animais correm para uma clareira branca, ao leste, e você vê um objeto brilhante no chão.`,
            interactive: true,
            animate: true,
            fsm: {
              id: 'L01_DUNGEON',
              state: STATES.NORTH_FLOREST_01,
            },
            context,
          }
        });
      },
    }

    const fsm = createMachine(
      {
        preserveActionOrder: true,
        predictableActionArguments: true,
        id: 'MAIN',
        context: ctx,
        initial,
        states,
      },
      {
        actions
      },
    );

    // Transitions
    return interpret(fsm)
      .onTransition(state => l.debug(`FSM transitioned to ${state.value} with context ${JSON.stringify(context, null, 2)}`));
  }
};
