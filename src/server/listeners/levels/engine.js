const { createMachine, interpret, assign } = require('xstate');

const Characters = require('./characters');
const { push } = require('../services/gameService');

const l = require('../logger');

const STATES = {
  HOME: 'home',
  NORTH_FLOREST_01: 'north-florest-01'
}

module.exports = (user) => {
  return (initialState, context) => {
    const initial = initialState ?? 'home';
    const ctx = context ?? { steps: 0 };

    const increaseSteps = assign({ steps: (context) => context.steps + 1 })

    const states = {
      [STATES.HOME]: {
        on: {
          'startGame': {
            target: STATES.HOME,
            actions: ['startGame']
          },
          'action.goNorth': {
            target: STATES.NORTH_FLOREST_01,
            actions: ['goNorthFlorest']
          },
        }
      },
      [STATES.NORTH_FLOREST_01]: {
        entry: [increaseSteps],
        // on: {
        //   'action.goSouth': [STATES.HOME],
        //   actions: [increaseSteps]
        // }
      }
    }

    const actions = {
      startGame: async (context, event) => {
        if (context.steps > 0) return;

        const name = user.name?.givenName;
        const now = new Date();


        let day = now.getHours() < 12 ? "Nesta manhã" : now.getHours() < 18 ? "Nesta tarde" : "Nesta noite";

        await push({
          prompt: `Olá, $[${name}](ui:who_is,99-user)$, me chamo ${Characters.BUN.name}`,
          who: Characters.BUN,
        })

        await push({
          prompt: `${day} forças ocultas começaram a se espalhar pelo mundo.`,
          who: Characters.BUN,
        })

        await push({
          prompt: `Uma força terrível causou espanto nos moradores de uma pequena cidade ao leste de Mui, de onde sou. Um monstro roubou minha cesta de ovos, e nem tive tempo de ir atrás dele. A última coisa que me lembro é de vê-lo indo em direção ao norte.`,
          who: Characters.BUN,
          fsm: {
            id: 'L01_DUNGEON',
            state: STATES.HOME,
          },
          context,
        });

        `Seu nome? Desconhecido.\nRelatos vieram de todas as direções, guerreiros bravos da guilda Vercelida e da guilda Stripers foram vistos lutando contra a besta, sabendo de seu imenso poder.`
      },
      goNorthFlorest: async (context, event) => {
        await push({
          prompt: `Você foi para o norte, você vê uma floresta branca e ouve barulhos. Os animais correm para uma clareira branca, ao leste, e você vê um objeto brilhante no chão.`,
          interactive: true,
          animate: true,
          fsm: {
            id: 'L01_DUNGEON',
            state: STATES.NORTH_FLOREST_01,
          },
          context,
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
