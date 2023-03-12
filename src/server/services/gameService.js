const redisClient = require("../database");
const _ = require("lodash");
const l = require("../logger");
const { default: Queue } = require("queue");
const Characters = require("../engine/characters");

const queues = {};

const ACK_TIMEOUT = 15000;

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

async function saveGame(user, save = {}) {
  const data = JSON.stringify(save);

  await redisClient.set(`users:save:${user.id}`, data);
}

async function isCooldownActive(user, action) {
  return await redisClient.exists(`users:cooldown:${user.id}:${action}`);
}

async function setCooldown(user, action, ttl = 3) {
  await redisClient.set(`users:cooldown:${user.id}:${action}`, 1);
  await redisClient.expire(`users:cooldown:${user.id}:${action}`, ttl);
}

function getRenderer(io, sessionId, user) {
  const renderer = async (eventName, data, save = true) => {
    return new Promise((resolve, reject) =>
      io
        .to(sessionId)
        .timeout(ACK_TIMEOUT)
        .emit(eventName, data, async (err, response) => {
          if (err) {
            l.error(`Some clients did not ack the game:response in time`);
            reject(err);
          } else {
            l.debug(`Received ack from client: ${response}`);
            if (save && data?.worldAdd) await push(user, data?.worldAdd);

            resolve();
          }
        }),
    );
  };

  if (!queues[user.id]) {
    queues[user.id] = {
      error: new Queue({ concurrency: 1, autostart: true, results: [], timeout: ACK_TIMEOUT - 5000 }),
      response: new Queue({ concurrency: 1, autostart: true, results: [], timeout: ACK_TIMEOUT - 5000 }),
    };
  }

  return {
    add2world: (worldAdd, save = true) => {
      const queue = queues[user.id]?.response;
      queue.push(async () => await renderer("game:response", { worldAdd: { interactive: true, animate: true, who: Characters.NARRATOR, ...worldAdd } }, save));
    },
    setError: (error) => {
      const queue = queues[user.id]?.error;
      queue.push(async () => await renderer("game:error", { error }, false));
    },
  };
}

module.exports = {
  getWorldState,
  getSave,
  saveGame,
  push,
  isCooldownActive,
  setCooldown,
  getRenderer,
  // pushPrompt: addNewState,
  // getNextStateFn
};
