const Engine = require("./engine");

const { getUser } = require("../services/userService");
const { getWorldState, getRenderer, getSave, isCooldownActive, setCooldown } = require("../services/gameService");

const { PLAYER } = require("./characters");

const l = require("../logger");

const attachHandler = async (io, client, { id: userId }, sessionId) => {
  l.debug(`Attaching listeners for game`);

  const { user, world, savegame } = await loadGame(userId);

  const { add2world, setError, changeLocation } = getRenderer(io, sessionId, user);

  const engine = Engine.createEngine(user);

  engine.onUpdate((message) => {
    add2world(message, true);
  });

  engine.onLocationChange((location) => {
    changeLocation(location);
  });

  client.on("game:update-inventory", async (cb) => {
    if (cb) cb("SYN_SERVER");

    const fsm = engine._fsm;

    const { inventory } = fsm?.state?.context ?? {};

    io.to(sessionId).emit("game:inventory-change", inventory ?? []);
  });

  client.on("game:update-progress", async (cb) => {
    if (cb) cb("SYN_SERVER");

    const fsm = engine._fsm;

    const { steps, score } = fsm?.state?.context ?? { steps: 0, score: 0 };

    io.to(sessionId).emit("game:progress-change", { steps, score });
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

  io.to(sessionId).emit("game:loaded", { user, world });
};

const loadGame = async (userId) => {
  const user = await getUser(userId);
  const w = await getWorldState(user);
  const world = w.splice(Math.max(0, w.length - 100), 100);
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
