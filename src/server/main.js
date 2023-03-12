require("dotenv").config();

const ViteExpress = require("vite-express");
const { createServer } = require("http");

// Local imports
const { createExpressServer } = require("./server");
const { createSocketIoServer } = require("./socket");
const l = require("./logger");
const { trainAll } = require("./engine/models");

// Create base express server
const app = createExpressServer();
const server = createServer(app);
createSocketIoServer(server);

// Start listening
(async () => {
  if (process.env.NODE_ENV !== "production") {
    ViteExpress.bind(app, server);

    await trainAll();
  }

  const PORT = process.env.PORT ?? 3000;

  server.listen(PORT, () => l.info(`⚡ Server is listening on port ${PORT}...`));
})();
