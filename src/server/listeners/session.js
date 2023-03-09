const { setUserStatus, getUsers } = require('../services/userService');
const l = require('../logger');

const SESSION_RELOAD_INTERVAL = 30 * 1000;

module.exports = (io, client, user, sessionId) => {
  // Reload session from time to time
  const timer = setInterval(() => {
    client.request.session.reload(async (err) => {
      l.warn(`Reloading session from socket id ${client.id}`);
      if (err) { client.conn.close() }
    });
  }, SESSION_RELOAD_INTERVAL);


  // Handle disconnections
  client.on("disconnect", async () => {
    l.warn(`Connection on socket with id=${client.id} was disconnected`);
    clearInterval(timer);

    if (!user || !sessionId) return;
    // Compute number of sockets connect to user session (therefore, how many tabs the user has)
    const clients = io.sockets.adapter.rooms.get(sessionId);

    const numClients = clients ? clients.size : 0;

    // If no more sessions for user, set offline
    if (numClients == 0) {
      await setUserStatus(user, 'offline');

      const users = await getUsers();
      await io.emit('ui:user_list', users);
    }
  });
}
