const l = require("../logger");

const GameEngine = require("../engine/main");

module.exports = async (io, client, { id: userId }, sessionId) => {
  l.info(`Registering listeners for game`);

  const { send } = await GameEngine.createEngine(io, sessionId, userId);

  client.on("prompt", async ({ prompt }, cb) => {
    if (cb) {
      l.debug(`Calling ack on server`);
      cb("SYN_SERVER");
    }

    l.debug(`Sending prompt ${prompt} to GameEngine...`);

    send("prompt", prompt);
  });
};
