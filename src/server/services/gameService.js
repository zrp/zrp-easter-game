const redisClient = require("../database");
const _ = require("lodash");
const l = require("../logger");
const { default: Queue } = require("queue");
const Characters = require("../engine/characters");

const ACK_TIMEOUT = 30000;

const push = async (user, state) => {
  await redisClient.rPush(`users:game:${user.id}`, JSON.stringify({ animate: false, interactive: true, ...state }));
};

async function getWorldState(user) {
  const data = await redisClient.lRange(`users:game:${user.id}`, 0, -1);

  return data.map(JSON.parse).map((data) => ({ ...data, animate: false }));
}

async function getSave(user) {
  try {
    const data = await redisClient.get(`users:save:${user.id}`);

    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function deleteSave(user) {
  await redisClient.del(`users:save:${user.id}`);
  await redisClient.del(`users:game:${user.id}`);
}

function createSaver(user) {
  return async (save) => {
    const data = JSON.stringify(save);

    await redisClient.set(`users:save:${user.id}`, data);
  };
}

async function isCooldownActive(user, action) {
  return await redisClient.exists(`users:cooldown:${user.id}:${action}`);
}

async function setCooldown(user, action, ttl = 3) {
  await redisClient.set(`users:cooldown:${user.id}:${action}`, 1);
  await redisClient.expire(`users:cooldown:${user.id}:${action}`, ttl);
}

function getRenderer(io, sessionId, user) {
  const render = (eventName, data, save = true) =>
    io
      .to(sessionId)
      .timeout(ACK_TIMEOUT)
      .emit(eventName, data, (err, response) => {
        if (err) {
          l.error(`Some clients did not ack the game:response in time`);
          return;
        }

        l.debug(`Received ack from client: ${response}`);

        if (save && data) {
          if (_.isArray(data)) {
            data.map((d) => push(user, d?.worldAdd));
          } else {
            push(user, data.worldAdd);
          }
          return;
        }
      });

  return {
    changeLocation: (location) => {
      render("game:location-change", location, false);
    },
    sendChallenge: (question) => {
      render("game:challenge", question, false);
    },
    add2world: (worldAdd, save = true) => {
      if (_.isArray(worldAdd)) {
        render(
          "game:response",
          worldAdd.map((data) => ({ worldAdd: { interactive: true, animate: true, who: Characters.NARRATOR, ...data } })),
          save,
        );
      } else {
        render("game:response", { worldAdd: { interactive: true, animate: true, who: Characters.NARRATOR, ...worldAdd } }, save);
      }
    },
    setError: (error) => {
      render("game:error", { error }, false);
    },
  };
}

module.exports = {
  getWorldState,
  getSave,
  createSaver,
  push,
  isCooldownActive,
  setCooldown,
  getRenderer,
  deleteSave,
  // pushPrompt: addNewState,
  // getNextStateFn
};
