require("dotenv").config();

const { IncomingWebhook } = require("@slack/webhook");
const ViteExpress = require("vite-express");
const { createServer } = require("http");
const { inspect } = require("@xstate/inspect");

// Local imports
const { createExpressServer } = require("./server");
const { createSocketIoServer } = require("./socket");
const { createSlackApp } = require("./bolt");
const l = require("./logger");
const { trainAll } = require("./engine/models");

// Create base express server
const app = createExpressServer();
// const slack = createSlackApp();
const server = createServer(app);
createSocketIoServer(server);

// Start listening
(async () => {
  if (process.env.NODE_ENV !== "production") {
    ViteExpress.bind(app, server);
  }

  await trainAll();

  const PORT = process.env.PORT ?? 3000;

  server.listen(PORT, () => l.warn(`⚡ Server is listening on port ${PORT}...`));
})();
