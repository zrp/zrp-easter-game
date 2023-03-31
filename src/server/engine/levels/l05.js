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
    stairs: {
      entry: assign({
        messages: ["Ao descer as escadas, você dá de cara "],
      }),
      on: {
        ...defaultActions,
        goEast: "stairs-east",
        goSouthEast: "stairs-southeast",
        goSouth: "stairs-south",
      },
    },
    "stairs-east": {
      entry: assign({
        messages: ["Leste"],
      }),
      on: {
        ...defaultActions,
        goWest: "stairs",
      },
    },
    "stairs-southeast": {
      entry: assign({
        messages: ["Sudeste"],
      }),
      on: {
        ...defaultActions,
        goNorthWest: "stairs",
      },
    },
    "stairs-south": {
      entry: assign({
        messages: ["Sul"],
      }),
      on: {
        ...defaultActions,
        goNorth: "stairs",
      },
    },
  },
};

module.exports = l05;
