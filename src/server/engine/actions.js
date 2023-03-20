const { assign, raise, send, sendTo } = require("xstate");
const Messages = require("./messages");
const { setMessages, getTransitionName } = require("./context");

const l = require("../logger");

const npcs = require("./npcs");

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
    actions: setMessages({ prompt: "Ligar o que exatamente?" }),
    cond: (context, event) => !event?.value,
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
