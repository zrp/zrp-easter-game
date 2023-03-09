const socketIO = require('socket.io');

const { sessionMiddleware } = require('./auth');
const { upsertUser, setUserStatus, getUsers } = require('./services/userService');

const l = require('./logger');
const { getResponder } = require('./services/gameService');
const { default: Queue } = require('queue');

/**
 * Creates a SocketIO server to manage the game
 * state and transfer state between client and server.
 * 
 * It also handles authentication / authorization at
 * the socket level, using the same session middleware
 * exported by the auth layer.
 * 
 * @param {*} httpServer 
 */
const createSocketIoServer = (httpServer) => {
  // Create server
  const io = socketIO(httpServer);

  // Middleware for authentication
  io.engine.use(sessionMiddleware);

  // Middleware for user
  io.use((client, next) => {
    const session = client.request.session;
    const sessionId = session.id;
    const user = session?.passport?.user;

    if (sessionId && user) {
      next();
    } else {
      next(new Error('unauthorized'));
    }
  });


  // Add a connection handler to set listeners for client
  io.on('connection', async (client) => {
    l.info(`New connection on socket with id=${client.id}`);

    const session = client.request.session;
    const sessionId = session.id;
    const user = session.passport.user;

    require('./listeners/session')(io, client, user, sessionId);

    if (!user || !sessionId) {
      l.error(`Connection does not belong to an user`);
      l.warn('Skipping listeners registration!');
      return;
    };

    // Join own session
    client.join(sessionId);

    // Add user to database
    await upsertUser(user)

    // Register listeners
    require('./listeners/ui')(io, client, user, sessionId);
    require('./listeners/game')(io, client, user, sessionId);

    // Set user as online
    await setUserStatus(user, 'online');

    // Get all users and update everyone about current users
    l.info(`Updating everyone about current online users`)
    io.emit('ui:user_list', await getUsers());
  });

}

module.exports = {
  createSocketIoServer,
}
