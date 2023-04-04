const { assign, raise, send, sendTo } = require("xstate");
const Messages = require("./messages");
const { setMessages, getTransitionName } = require("./context");

const l = require("../logger");
const _ = require("lodash");

const npcs = require("./npcs");

const OPEN_ITEM_MESSAGES = [
  "O que você está tentando abrir?",
  "Nem tudo se resume a abrir itens.",
  "As vezes é melhor não arriscar.",
  "Você tem certeza disso?!",
];

const TURN_ON_MESSAGES = [
  "Ligar? Não é todo botão que é clicável nessa vida.",
  "E se isso fosse uma bomba?",
  "Não sei como ligar isso.",
  "O que? Ligar o que exatamente?!",
];

const TURN_OFF_MESSAGES = [
  "Desligar? Não é todo botão que é clicável nessa vida.",
  "Se isso fosse uma bomba o seu tempo já estava esgotado!",
  "Não sei como desligar isso.",
  "O que? Desligar o que exatamente?!",
];

const defaultActions = {
  goDown: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goUp: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goSouth: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goWest: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goEast: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goNorth: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goSouthEast: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goNorthEast: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goNorthWest: {
    actions: setMessages(Messages.errors.goDirection),
  },
  goSouthWest: {
    actions: setMessages(Messages.errors.goDirection),
  },
  turnOn: {
    actions: (ctx) => ctx.messages.push(_.sample(TURN_ON_MESSAGES)),
  },
  turnOff: {
    actions: (ctx) => ctx.messages.push(_.sample(TURN_OFF_MESSAGES)),
  },
  openItem: {
    actions: (ctx) => ctx.messages.push(_.sample(OPEN_ITEM_MESSAGES)),
  },
};

const talk2npc = (eventHandler = null) => {
  return async (ctx, event) => {
    const name = ctx.npcName;
    const npc = npcs?.[name];
    const prompt = event?.prompt ?? event?.value ?? "";
    if (!npc) ctx.messages.push({ prompt: "Eu não entendi", who: npc.char });

    l.debug(`Sending prompt to npc ${name}`);
    const { answer, intent, value } = await npc.say(prompt);

    const ehAnswer = eventHandler?.(ctx, { answer, intent, value });

    if (ehAnswer) {
      ctx.messages.push({ prompt: ehAnswer, who: npc.char });

      return;
    }

    // // Try to auto-capture intent
    if (intent === "exitConversation") {
      l.debug(`Intent is to exit conversation, throwing error`);
      throw new Error("conversation ended");
    }

    // Try to capture answer
    if (answer) {
      l.debug(`Sending answer back to client ${answer}`);
      ctx.messages.push({ prompt: answer, who: npc.char });
      return;
    }

    // Return generic error
    l.debug(`fsm didn't had any intent or answer we known, sending default error`);
    ctx.messages.push({ prompt: "O que? Eu não entendi", who: npc.char });
  };
};

module.exports = { defaultActions, talk2npc };
