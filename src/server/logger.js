const { createLogger, transports, format } = require("winston");

const { combine, colorize, timestamp, printf } = format;

const logger = createLogger({
  level: 0,
  defaultMeta: {
    service: 'server',
  },
  format: combine(
    timestamp({ format: "H:mm:ss A" }),
    colorize({ all: true }),
    printf(info => `\x1B[2m${info.timestamp}\x1b[0m \x1B[1m\x1B[36m[${info.service}]\x1b[0m ${info.message}` + (info.splat !== undefined ? `${info.splat}` : " ")),
  ),
  transports: [
    new transports.Console()
  ]
});

module.exports = logger;
