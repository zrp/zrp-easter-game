const Engine = require("./engine");

const { getUser } = require("../services/userService");
const { getWorldState, getRenderer, getSave, isCooldownActive, setCooldown } = require("../services/gameService");

const { PLAYER } = require("./characters");
const _ = require("lodash");

const l = require("../logger");
const { empty } = require("rxjs");

const attachHandler = async (io, client, { id: userId }, sessionId) => {
  l.debug(`Attaching listeners for game`);

  const { user, world, savegame } = await loadGame(io, sessionId, userId);

  const { add2world, setError, changeLocation } = getRenderer(io, sessionId, user);

  const engine = Engine.createEngine(user);

  engine.onUpdate((message) => {
    add2world(message, true);
  });

  engine.onLocationChange((location) => {
    changeLocation(location);
  });

  // Attach handler
  client.on("prompt", async ({ prompt }, cb) => {
    l.debug(`Called prompt on server`);

    if (cb) cb("SYN_SERVER");

    // Check for cooldown
    const isCooldown = await isCooldownActive(user, "prompt");

    if (isCooldown) {
      l.debug(`Cooldown is active, action will be ignored`);
      setError({ message: "Você não pode mandar tantas mensagens assim 👀" });
      return;
    }

    await setCooldown(user, "prompt", 1);

    l.debug(`Sending user his own message back`);
    add2world({
      interactive: false,
      animate: false,
      prompt,
      who: PLAYER,
    });

    await engine.next(prompt);
  });

  engine.start(savegame);

  io.to(sessionId).emit("game:loaded", { user, world, savegame });
};

const loadGame = async (io, sessionId, userId) => {
  const user = await getUser(userId);
  const world = await getWorldState(user);
  const savegame = await getSave(user);

  l.debug(`Loaded user ${user.id} from storage`);
  l.debug(`Loaded world associated with ${user.id}, world length is ${world.length}`);
  l.debug(`Loaded last savegame associated with ${user.id}, save is ${savegame ? "at " + JSON.stringify(savegame?.value) : "empty"}`);

  return { user, world, savegame };
};

module.exports = {
  attachHandler,
  loadGame,
};

//  você decide parar seu caminhar e falar com uma estranha criatura de pelos brancos. As lágrimas escorrendo por entre seus olhos, e fios pretos presos a seu corpo, mas claramente de outro ser.
