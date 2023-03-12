const { createMachine, interpret, assign, raise } = require("xstate");

const { getUser } = require("../services/userService");
const { getWorldState, getRenderer, getSave, saveGame, isCooldownActive, setCooldown } = require("../services/gameService");
const l01 = require("./levels/l01");

const { PLAYER } = require("./characters");

const l = require("../logger");

const createEngine = async (io, sessionId, userId) => {
  const { user, world, save } = await loadGame(io, sessionId, userId);

  const { add2world, setError } = getRenderer(io, sessionId, user);

  const saver = (save) => saveGame(user, save);

  const machine = createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      id: "game",
      state: save,
      context: {
        steps: 0,
        name: user?.name?.givenName,
      },
      initial: "l01",
      on: {
        prompt: {
          actions: (context, prompt) => {
            console.log(`Running prompt`, prompt);
          },
        },
      },
      states: {
        l01: {
          ...l01(add2world, setError),
        },
      },
    },
    {
      actions: {
        countSteps: assign({ steps: (context) => context.steps + 1 }),
      },
    },
  );

  const onTransition = async (state) => {
    // l.debug(`FSM transitioned to ${state.value} with context ${JSON.stringify(state.context, null, 2)}`);
    // l.debug(JSON.stringify(state, null, 2));
    await saver(state);
  };

  const engine = interpret(machine).onTransition(onTransition);

  engine.start(save?.value, save?.context);

  if (world.length === 0) engine.send("startGame");

  l.info(`⚡ Game started!`);

  return {
    send: async (name, prompt) => {
      const isCooldown = await isCooldownActive(user, "prompt");

      if (isCooldown) {
        setError({ message: "Você não pode mandar tantas mensagens assim 👀" });
        return;
      }

      await setCooldown(user, "prompt");

      add2world({
        interactive: false,
        animate: false,
        prompt,
        who: PLAYER,
      });

      // TODO: add here a parser before sending data to engine

      engine.send(name, { prompt });
    },
    engine,
  };
};

const loadGame = async (io, sessionId, userId) => {
  const user = await getUser(userId);
  const world = await getWorldState(user);
  const save = await getSave(user);

  l.debug(`Loaded user ${user.id} from storage`);
  l.debug(`Loaded world associated with ${user.id}, world length is ${world.length}`);
  l.debug(`Loaded last save game associated with ${user.id}, save is ${JSON.stringify(save, null, 2)}`);

  io.to(sessionId).emit("game:loaded", { user, world });

  return { user, world, save };
};

module.exports = {
  createEngine,
  loadGame,
};

//  você decide parar seu caminhar e falar com uma estranha criatura de pelos brancos. As lágrimas escorrendo por entre seus olhos, e fios pretos presos a seu corpo, mas claramente de outro ser.
