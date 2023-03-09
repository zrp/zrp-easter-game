const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const helmet = require('helmet');
const moment = require('moment');

morgan.token('sessionid', function (req, res, param) {
  return req.sessionID;
});

morgan.token('timestamp', () => {
  return moment().format('H:mm:ss A');
})

const { addAuth } = require('./auth');

const createExpressServer = () => {
  const app = express();

  // Add middleware
  app.use(cors());

  if (process.env.NODE_ENV === 'production') {
    // app.use(helmet());
  }

  app.use(bodyParser.json());
  app.use(morgan('\x1B[2m:timestamp\x1b[0m \x1B[1m\x1B[36m[server]\x1b[0m :remote-addr - :remote-user \x1b[1m\x1b[35m:method\x1b[0m \x1b[1m\x1b[35m:url\x1b[0m \x1b[1m\x1b[35mHTTP/:http-version\x1b[0m \x1b[1m\x1b[32m:status\x1b[0m - :sessionid'));
  addAuth(app);

  return app;
}

module.exports = {
  createExpressServer,
}

