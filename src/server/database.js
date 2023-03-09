const redis = require('redis');
const l = require('./logger');

const redisClient = redis.createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379/0" });

redisClient.connect().then(
  function () {
    l.info('Connected to redis successfully');
  }
).catch(
  function (err) {
    l.error('Could not establish a connection with redis. ' + err);
    l.warn('Process will exit with status 1');
    process.exit(1);
  }
);

module.exports = redisClient;
