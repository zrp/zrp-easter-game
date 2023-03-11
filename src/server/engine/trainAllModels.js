const fs = require("fs");
const path = require("path");

const l = require("../logger");

module.exports = async () => {
  const dirpath = path.join(__dirname, "models");

  l.debug(`Reading contents inside ${dirpath}`);

  const dir = fs.readdirSync(dirpath).filter((file) => file.match(/.*(\.js)/)?.length);

  for (const file of dir) {
    const module = require(path.join(__dirname, "models", file));

    await module.train();
  }
};
