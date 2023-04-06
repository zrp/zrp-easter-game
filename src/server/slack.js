require("dotenv").config();

// Local imports
const { createSlackApp } = require("./bolt");

// Create base express server
const app = createSlackApp();

// Start listening
app.start();
