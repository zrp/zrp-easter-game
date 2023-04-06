require("dotenv").config();

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
  } else {
    const { IncomingWebhook } = require("@slack/webhook");

    const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

    await webhook.send({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "Algo de estranho ocorreu! :eyes:",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Parece que algo mudou! Mas não sabemos o que. Será que isso foi um sonho?! Você ouve um chamado distante, mas quem é essa voz que conversa com você? Ela parece familiar, mas diferente.`,
            emoji: true,
          },
        },
      ],
    });
  }

  await trainAll();

  const PORT = process.env.PORT ?? 3000;

  server.listen(PORT, () => l.info(`⚡ Server is listening on port ${PORT}...`));

  // slack.start();
})();
