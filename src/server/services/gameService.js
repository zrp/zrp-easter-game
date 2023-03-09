const redisClient = require('../database');
const _ = require('lodash');
const l = require('../logger');
const { default: Queue } = require('queue');

const queues = {

};

const ACK_TIMEOUT = 15000;

const push = async (user, state) => {
  await redisClient.rPush(`users:game:${user.id}`, JSON.stringify({ animate: false, interactive: true, ...state }));
};

async function getWorldState(user) {
  const data = await redisClient.lRange(`users:game:${user.id}`, 0, -1);

  return data.map(JSON.parse).map(data => ({ ...data, animate: false }));
}

async function isCooldownActive(user, action) {
  return await redisClient.exists(`users:cooldown:${user.id}:${action}`);
}

async function setCooldown(user, action) {
  await redisClient.set(`users:cooldown:${user.id}:${action}`, 1);
  await redisClient.expire(`users:cooldown:${user.id}:${action}`, 5);
}

function getResponder(io, sessionId, user) {
  const responder = (data, save = true) => {
    return new Promise((resolve, reject) => io.to(sessionId).timeout(ACK_TIMEOUT).emit("game:response", data, async (err, response) => {
      if (err) {
        l.error(`Some clients did not ack the game:response in time`);
        reject(err);
      } else {
        l.debug(`Received ack from client: ${response}`);
        if (save && data?.worldAdd) await push(user, data?.worldAdd);
        resolve();
      }
    }));
  };

  if (!queues[user.id]) {
    queues[user.id] = new Queue({ concurrency: 1, autostart: true, results: [], timeout: ACK_TIMEOUT })
  }

  return (data, save = true) => {
    const queue = queues[user.id];
    queue.push(async () => await responder(data, save));
  };
}

module.exports = {
  getWorldState,
  push,
  isCooldownActive,
  setCooldown,
  getResponder,
  // pushPrompt: addNewState,
  // getNextStateFn
}
