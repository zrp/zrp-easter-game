const redisClient = require('../database');

const l = require('../logger');
const { generateNickname, getNicknameDescription } = require('./nicknameService');

const predictor = async (name) => {
  const result = 'male';

  return result == 'female' ? 'F' : 'M';
};

async function upsertUser(user) {
  l.info(`Upserting user ${user.id}`);
  const exists = await redisClient.hExists(`users:data`, user.id);

  let next = { ...user };

  if (exists) {
    l.warn(`Found existing record, updating ${user.id} with new data`);

    const prev = JSON.parse(await redisClient.hGet(`users:data`, user.id));
    next = { ...prev, ...user };
  } else {
    await redisClient.hSet(`users:nickname`, user.id, generateNickname(await predictor(user.name.givenName)));
  }

  await redisClient.hSet(`users:data`, user.id, JSON.stringify(next));

  l.info(`User with id ${user.id} created or updated`);
}

async function setUserStatus(user, status = "online") {
  l.info(`Updating user ${user.id} status to ${status}`);
  await redisClient.hSet(`users:status`, user.id, status);
  l.info(`User ${user.id} status updated to ${status}`);
}

async function getUser(id) {
  const data = JSON.parse(await redisClient.hGet(`users:data`, id));
  const status = await redisClient.hGet(`users:status`, id);
  const nickname = await redisClient.hGet(`users:nickname`, id);
  const gender = await predictor(data.name.givenName);
  const description = `${data.name?.givenName}, ${nickname}, ${getNicknameDescription(nickname, gender)}`;

  return {
    ...data,
    status,
    gender,
    nickname,
    description,
  }
}

async function getUsers() {
  let users = Object.values((await redisClient.hGetAll(`users:data`))).map(JSON.parse);
  const status = (await redisClient.hGetAll(`users:status`));

  users = users.map(user => ({
    ...user,
    status: status[user.id]
  }));

  return {
    users,
    online: users.filter(u => u.status == 'online').length,
    total: users.length,
  };
}

module.exports = {
  upsertUser,
  getUsers,
  getUser,
  setUserStatus,
}
