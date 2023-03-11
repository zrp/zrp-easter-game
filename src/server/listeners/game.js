const l = require("../logger");

const { getWorldState, getResponder, isCooldownActive, setCooldown } = require("../services/gameService");
const { getUser } = require("../services/userService");
const { getIntent } = require("../services/nlpService");

const GameEngine = require("../engine/main");
const Characters = require("../engine/characters");

module.exports = async (io, client, { id: userId }, sessionId) => {
  l.info(`Registering listeners for game`);

  const user = await getUser(userId);
  const world = await getWorldState(user);

  client.emit("game:loaded", { user, world });

  l.debug(`Loaded user ${user.id} from storage`);
  l.debug(`Loaded world associated with ${user.id}, world length is ${world.length}`);

  // Creates a "responder" for this client
  // This functions sends game:responses to client and ack that the client received the response
  const responder = getResponder(io, sessionId, user);

  // Load last state
  const lastState = world[world.length - 1];

  l.debug(`Loaded lastState for user: ${JSON.stringify(lastState, null, 2)}`);

  const engine = GameEngine(user, responder);

  const game = engine(lastState?.fsm?.state, null);

  game.start();

  if (world.length === 0) {
    game.send("startGame");
  }

  l.info(`⚡ Game started!`);

  // Register a prompt handler to manipulate the fsm
  client.on("prompt", async ({ prompt }, cb) => {
    if (cb) {
      l.info(`Calling ack on server`);
      cb("SYN_SERVER");
    }

    const isCooldown = await isCooldownActive(user, "prompt");

    if (isCooldown) {
      responder(
        {
          error: { message: "Você não pode mandar tantas mensagens assim 👀" },
        },
        false,
      );
      return;
    }

    await setCooldown(user, "prompt");

    const saveUserPrompt = true;

    responder(
      {
        worldAdd: {
          interactive: false,
          animate: false,
          prompt,
          who: Characters.PLAYER,
        },
      },
      saveUserPrompt,
    );

    l.debug(`Sending prompt ${prompt} to GameEngine...`);

    game.send("speak", { prompt });
  });
};
