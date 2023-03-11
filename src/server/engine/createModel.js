const fs = require("fs");
const path = require("path");
const { NlpManager, ConversationContext } = require("node-nlp");

const l = require("../logger");

const THRESHOLD = 0.5;

const createSpeakFunction = (manager, ctx) => {
  return async (query) => {
    const r = await manager.process("pt", query, ctx);

    console.log(r);

    return {
      score: r.score,
      intent: r.intent,
      answer: r.intent === "None" ? null : r.answer,
      sentiment: r.sentiment?.score ?? 0 != 0 ? (r.sentiment.score > 0 ? "Positive" : "Negative") : "Neutral",
    };
  };
};

/**
 *
 * @param {*} model
 * @param {*} dataset
 * @returns
 */
module.exports = function createModel(model, addTrainingData = (manager) => {}, addAnswers = (manager) => {}) {
  const manager = new NlpManager({
    languages: ["pt"],
  });

  const filepath = path.join(__dirname, "models", `${model}.nlp`);

  // Load data
  if (fs.existsSync(filepath)) manager.load(filepath);

  // Add answers
  l.info(`Adding answers to ${model}, please wait..`);

  addAnswers?.(manager);

  l.info(`Answers added! Saving model...`);

  l.info(`${model} is saved!`);

  return {
    manager,
    getSpeakFunction: (context = {}) => createSpeakFunction(manager, new ConversationContext(context)),
    train: async () => {
      addTrainingData?.(manager);

      l.info(`Training ${model}, please wait..`);

      const hrstart = process.hrtime();
      await manager.train();
      const hrend = process.hrtime(hrstart);

      l.info(`Trained ${model} (hr): ${hrend[0]}s ${hrend[1] / 1000000}ms`);

      await manager.save(filepath, true);
    },
  };
};
