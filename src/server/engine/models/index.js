const fs = require("fs");
const path = require("path");

const { NlpManager, ConversationContext } = require("node-nlp");

const l = require("../../logger");

const THRESHOLD = 0.4;

/**
 *
 * @param {*} manager
 * @param {*} ctx
 * @returns
 */
function createProcessFn(manager) {
  return async (query) => {
    const r = await manager.process("pt", query, {});

    return r.score > THRESHOLD
      ? {
          ...r,
          value: r.intent == "detachItem" ? r.entities.map((e) => e.option) : r.entities?.[0]?.option,
        }
      : {};
  };
}

const txt2input = (label) => `%${label}%`;
const txt2output = (label) => `{{${label}}}`;

const txt2front = (text, action, data = "") => {
  return `$[${text}](${action}${data != "" ? "," + data : ""})$`;
};

const character2front = (character) => {
  const text = character.name;
  const action = "ui:who_is";
  const data = character.id;

  return txt2front(text, action, data);
};

/**
 *
 * @param {*} model
 * @param {*} dataset
 * @returns
 */
function createModel(char, addTrainingData = (manager) => {}) {
  const model = char.id;
  const filepath = path.join(__dirname, `${model}.nlp`);

  const manager = new NlpManager({
    languages: ["pt"],
    forceNER: true,
    nlu: { log: false },
    modelFileName: filepath,
    autoSave: false,
  });

  return {
    manager,
    char,
    say: createProcessFn(manager),
    train: async ({ force } = { force: false }) => {
      // Load data if exists or train (or force train)
      if (fs.existsSync(filepath) && !force) {
        manager.load(filepath);
        return;
      }

      l.info(`Add training data to ${model}`);

      addTrainingData?.(manager);

      l.info(`Training ${model}, please wait..`);

      const hrstart = process.hrtime();
      await manager.train();
      const hrend = process.hrtime(hrstart);

      l.info(`Trained ${model} (hr): ${hrend[0]}s ${hrend[1] / 1000000}ms`);

      await manager.save(filepath, true);
    },
  };
}

async function trainAll() {
  const dirpath = path.join(__dirname, "./");

  l.debug(`Reading contents inside ${dirpath}`);

  const contents = fs.readdirSync(dirpath).filter((path) => path !== "index.js");

  const models = contents.filter((file) => file.match(/.*(\.nlp)/)?.length).map((file) => path.join(__dirname, file));

  const modules = contents
    .filter((file) => file.match(/.*(\.js)/)?.length)
    .map((file) => {
      return require(path.join(__dirname, file));
    });

  for (const model of models) {
    fs.rmSync(model);
  }

  for (const module of modules) {
    await module.train({ force: process.env.NODE_ENV !== "production" });
  }
}

function loadAll() {
  const dirpath = path.join(__dirname, "./");

  l.debug(`Reading contents inside ${dirpath}`);

  const contents = fs.readdirSync(dirpath).filter((path) => path === "main.js");

  const models = contents.filter((file) => file.match(/.*(\.nlp)/)?.length).map((file) => path.join(__dirname, file));

  const modules = contents
    .filter((file) => file.match(/.*(\.js)/)?.length)
    .map((file) => {
      return require(path.join(__dirname, file));
    });

  for (const module of modules) {
    module.load();
  }
}

module.exports = {
  trainAll,
  loadAll,
  createModel,
  character2front,
  txt2front,
  txt2input,
  txt2output,
};
