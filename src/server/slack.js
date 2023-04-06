require("dotenv").config();

// Local imports
const { createSlackApp } = require("./bolt");
const { trainAll } = require("./engine/models");

// Create base express server

// Start listening
(async () => {
  await trainAll();
  const app = await createSlackApp();

  app.start();
})();
