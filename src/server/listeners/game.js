const l = require("../logger");

const { getWorldState, getRenderer, isCooldownActive, setCooldown, getSave, saveGame } = require("../services/gameService");
const { getUser } = require("../services/userService");
const { getIntent } = require("../services/nlpService");

const GameEngine = require("../engine/main");
const Characters = require("../engine/characters");

module.exports = async (io, client, { id: userId }, sessionId) => {
  l.info(`Registering listeners for game`);

  const user = await getUser(userId);
  const world = await getWorldState(user);
  const save = await getSave(user);

  client.emit("game:loaded", { user, world });

  l.debug(`Loaded user ${user.id} from storage`);
  l.debug(`Loaded world associated with ${user.id}, world length is ${world.length}`);
  l.debug(`Loaded last save game associated with ${user.id}, save is ${JSON.stringify(save, null, 2)}`);

  const { add2world, setError } = getRenderer(io, sessionId, user);

  const saveUserGame = (save) => saveGame(user, save);

  const engine = GameEngine(user, saveUserGame, add2world, setError);

  const game = engine(save?.context);

  game.start(save?.value);

  if (world.length === 0) game.send("startGame");

  l.info(`⚡ Game started!`);

  // Register a prompt handler to manipulate the fsm
  client.on("prompt", async ({ prompt }, cb) => {
    if (cb) {
      l.info(`Calling ack on server`);
      cb("SYN_SERVER");
    }

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
      who: Characters.PLAYER,
    });

    l.debug(`Sending prompt ${prompt} to GameEngine...`);

    game.send("speak", { prompt });
  });
};
