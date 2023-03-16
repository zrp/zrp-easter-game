const { trainAll } = require("../src/server/engine/models");
const vite = require("vite");

(async () => {
  await trainAll();

  await vite.build();
})();
