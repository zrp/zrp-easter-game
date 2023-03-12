const socketIO = require("socket.io");

const { session } = require("./auth");
const { upsertUser, setUserStatus, getUsers } = require("./services/userService");

const l = require("./logger");

/**
 * Creates a SocketIO server to manage the game
 * state and transfer state between client and server.
 *
 * It also handles authentication / authorization at
 * the socket level, using the same session middleware
 * exported by the auth layer.
 *
 */
const createSocketIoServer = (httpServer) => {
  // Create server
  const io = socketIO(httpServer);

  // Middleware for authentication
  io.use((client, next) => session(client.request, {}, next));

  // Add a connection handler to set listeners for client
  io.on("connection", async (client) => {
    l.info(`New connection on socket with id=${client.id}`);

    const sessionId = client.request?.session?.id;
    const user = client.request?.session?.passport?.user;

    if (!user || !sessionId) {
      l.warn(`Unauthorized user tried to establish a socket, skipping listeners`);
      return;
    }

    // Join own session
    client.join(sessionId);

    // Add user to database
    await upsertUser(user);

    // Register listeners
    require("./listeners/session")(io, client, user, sessionId);
    require("./listeners/ui")(io, client, user, sessionId);
    require("./listeners/game")(io, client, user, sessionId);

    // Set user online
    await setUserStatus(user, "online");

    // update everyone about current users
    l.info(`Updating everyone about current online users`);
    io.emit("ui:user_list", await getUsers());
  });

  return io;
};

module.exports = {
  createSocketIoServer,
};
