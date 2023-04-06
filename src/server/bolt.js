const { App } = require("@slack/bolt");
const Engine = require("./engine/engine");
const { attachHandler } = require("./engine/slack");
const l = require("./logger");

const { getUser } = require("./services/userService");
const { getWorldState, getRenderer, getSave, isCooldownActive, setCooldown, deleteSave } = require("./services/gameService");

const { PLAYER } = require("./engine/characters");
const { Subject } = require("rxjs");

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

const createSlackApp = () => {
  const slackAppToken = process.env.SLACK_APP_TOKEN;
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackSigningKey = process.env.SLACK_SIGNING_KEY;

  const app = new App({
    token: slackBotToken,
    signingKey: slackSigningKey,
    appToken: slackAppToken,
    socketMode: !!slackAppToken,
  });

  const user = { name: { givenName: "ZRP" }, id: "slack-bot" };

  const engine = Engine.createEngine(user);

  const render$ = new Subject();

  engine.onUpdate((message) => {
    add2world(message, true);
  });

  app.message(new RegExp(/.*/gi), async ({ message, say: render }) => {
    if (message.channel !== "C052QJ2FQF2") return;

    const { text: prompt } = { text: null, ...message };

    if (text == "RESTART_GAME_NOW") {
      return;
    }

    l.debug(`Called prompt on server`);

    if (cb) cb("SYN_SERVER_PROMPT");

    // Check for cooldown
    const isCooldown = await isCooldownActive(user, "prompt");

    if (isCooldown) {
      l.debug(`Cooldown is active, action will be ignored`);
      setError({ message: "Você não pode mandar tantas mensagens assim 👀" });
      return;
    }

    await setCooldown(user, "prompt", 1);

    await engine.next(prompt);

    attachHandler(render, null, user, "slack");
  });

  return {
    start: () => {
      l.info("⚡️ Bolt app is running!");
      app.start();
    },
  };
};

module.exports = {
  createSlackApp,
};
