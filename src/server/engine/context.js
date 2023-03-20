const Characters = require("./characters");

function addMessages(messages = []) {
  return (ctx, event) => {
    let newMessages = Array.isArray(messages) ? messages : [messages];

    return [...ctx.messages, ...newMessages];
  };
}

function addVisit(location) {
  return (ctx, event) => {
    if (ctx.visited?.[location]) {
      ctx.visited[location] += 1;
    } else {
      ctx.visited[location] = 1;
    }

    return ctx.visited;
  };
}

function addSteps(ctx, event) {
  return ctx.steps + 1;
}

function acceptedMission(name) {
  return (ctx) => ctx.missions[name]?.accepted ?? false;
}

function pendingMission(name) {
  return (ctx) => !ctx.missions[name]?.accepted ?? false;
}

function setMessages(messages = [], who = Characters.NARRATOR) {
  return (ctx, event) => {
    let newMessages = Array.isArray(messages) ? messages : [messages];

    newMessages = newMessages.map((m) => {
      if (m.prompt) return m;
      return { prompt: m, who };
    });

    newMessages.forEach((m) => ctx?.messages?.push(m));
  };
}

function getTransitionName(intent, value, prompt = null) {
  switch (intent) {
    case "goDirection":
      if (value == "north") return { intent: "goNorth", value };
      if (value == "east") return { intent: "goEast", value };
      if (value == "west") return { intent: "goWest", value };
      if (value == "south") return { intent: "goSouth", value };
      if (value == "northwest") return { intent: "goNorthWest", value };
      if (value == "southwest") return { intent: "goSouthWest", value };
      if (value == "southeast") return { intent: "goSouthEast", value };
      if (value == "northeast") return { intent: "goNorthEast", value };
      if (value == "down") return { intent: "goDown", value };
      if (value == "up") return { intent: "goUp", value };
    case "type":
      return { intent, value: value ?? prompt };
    default:
      return { intent, value };
  }
}

module.exports = {
  addMessages,
  addVisit,
  addSteps,
  acceptedMission,
  pendingMission,
  setMessages,
  getTransitionName,
};
