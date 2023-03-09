const ViteExpress = require('vite-express');

require('dotenv').config();

const { createServer } = require('http');

const { createExpressServer } = require('./server');
const { createSocketIoServer } = require('./socket');
const l = require('./logger');

// Create base express server
const app = createExpressServer();
const server = createServer(app);

// Extend with binding for ViteExpress
ViteExpress.bind(app, server)

// Extend with socket.io
createSocketIoServer(server);

// Start listening
const PORT = process.env.PORT ?? 3000;

server.listen(PORT, () => l.info(`Server is listening on port ${PORT}...`));

