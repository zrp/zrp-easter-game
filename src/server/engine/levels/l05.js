const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit } = require("../context");
const { ITEMS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

const l05 = {
  id: "l05",
  initial: "stairs",
  states: {
    stairs: {},
  },
};

module.exports = l05;
