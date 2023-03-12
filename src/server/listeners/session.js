const { setUserStatus, getUsers } = require("../services/userService");
const l = require("../logger");

module.exports = (io, client, user, sessionId) => {
  client.use((__, next) => {
    client.request.session.reload((err) => {
      if (err) {
        // forces the client to reconnect
        client.conn.close();
      } else {
        next();
      }
    });
  });

  // Handle disconnections
  client.on("disconnect", async () => {
    l.warn(`Connection on socket with id=${client.id} was disconnected`);

    if (!user || !sessionId) return;
    // Compute number of sockets connected to user session (therefore, how many tabs the user has)
    const clients = io.sockets.adapter.rooms.get(sessionId);

    const numClients = clients ? clients.size : 0;

    // If no more sessions for user, set offline
    if (numClients == 0) {
      await setUserStatus(user, "offline");

      const users = await getUsers();
      await io.emit("ui:user_list", users);
    }
  });
};
