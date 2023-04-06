const { App } = require("@slack/bolt");
const Engine = require("./engine/engine");
const l = require("./logger");

const _ = require("lodash");

const { getUser } = require("./services/userService");
const { getWorldState, getRenderer, getSave, isCooldownActive, setCooldown, deleteSave } = require("./services/gameService");

const { PLAYER } = require("./engine/characters");
const { Subject } = require("rxjs");

const createGame = async (user) => {
  l.debug(`Attaching slack listeners for game`);

  const { savegame } = await loadGame(user);

  const engine = Engine.createEngine(user, true);

  engine.start(savegame);

  return engine;
};

const loadGame = async (user) => {
  const savegame = await getSave(user);

  l.debug(`Loaded last savegame associated with ${user.id}, save is ${savegame ? "at " + JSON.stringify(savegame?.value) : "empty"}`);

  return { savegame };
};

const createSlackApp = async () => {
  const slackAppToken = process.env.SLACK_APP_TOKEN;
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackSigningKey = process.env.SLACK_SIGNING_KEY;

  const app = new App({
    token: slackBotToken,
    signingKey: slackSigningKey,
    appToken: slackAppToken,
    socketMode: !!slackAppToken,
  });

  const client = app.client;

  const user = { name: { givenName: "ZRP" }, emails: [{ value: "none" }], id: "slack-bot" };

  const engine = await createGame(user);

  let slackSayFn = null;

  const render = async (message) => {
    console.log(message);
    const { who, prompt } = message;

    const before = (who?.name ?? ">") + (who?.showName ? ":" : "");

    await app.client.chat.postMessage({
      channel: "C052QJ2FQF2",
      mrkdwn: false,
      username: who?.name ?? "ZRP",
      text: `${before} ${prompt}`,
    });
  };

  engine.onUpdate(async (messages) => {
    const m = _.reverse(messages);

    for (const message of m) {
      await render(message);
    }
  });

  app.message(new RegExp(/.*/gi), async ({ message }) => {
    if (message.channel !== "C052QJ2FQF2") return;

    const { text: prompt } = { text: null, ...message };

    if (prompt == "RESTART_GAME_NOW") {
      engine._fsm.send("restart");
      await app.client.chat.postMessage({
        channel: "C052QJ2FQF2",
        mrkdwn: false,
        text: "Reiniciando...",
      });
      return;
    }

    // Check for cooldown
    const isCooldown = await isCooldownActive(user, "prompt");

    if (isCooldown) {
      l.debug(`Cooldown is active, action will be ignored`);
      say("Você não pode mandar tantas mensagens assim 👀");
      return;
    }

    await setCooldown(user, "prompt", 1);

    await engine.next(prompt, true);
  });

  return {
    start: () => {
      l.info("⚡️ Bolt app is running!");
      engine.start();
      app.start();
    },
  };
};

module.exports = {
  createSlackApp,
};
