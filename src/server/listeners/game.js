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
    cb?.("SYN_SERVER");

    const isCooldown = await isCooldownActive(user, "prompt");

    // Chill-out dude!
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

    const intent = await getIntent(prompt);

    l.debug(`Prompt ${prompt} generated intent ${intent}`);

    const saveUserPrompt = intent != "None";

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

    if (intent == "None") {
      responder(
        {
          worldAdd: {
            interactive: true,
            animate: true,
            prompt: "Não entendi o que você quis dizer. Precisa de $[ajuda](ui:help)$?",
            who: null,
          },
        },
        false,
      );
      return;
    }

    l.debug(`Testing ${intent} against GameEngine...`);

    game.send(intent);
  });
};
