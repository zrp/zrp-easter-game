const { createMachine, interpret, assign, raise, send, sendTo, sendParent } = require("xstate");

const { createSaver } = require("../services/gameService");
const Characters = require("./characters");

const l = require("../logger");
const _ = require("lodash");

const narrator = require("./models/narrator");
const bun = require("./models/bun");

const { Subject } = require("rxjs");
const { distinctUntilChanged } = require("rxjs/operators");
const Messages = require("./messages");

const { addMessages, addSteps, addVisit, getTransitionName } = require("./context");
const { ITEMS, seeItem, readItem, item2txt, detachItem } = require("./inventory");
const { defaultActions } = require("./actions");

const { l01, l02Attic, l02Tunnel, l03, l04, l05, l06 } = require("./levels");

const npcs = require("./npcs");

const shortcuts = {
  I: (fsm) => {
    fsm.send("getInventory");
    return null;
  },
  P: (fsm) => {
    fsm.send("getProgress");
    return null;
  },
  N: (fsm) => {
    fsm.send("goNorth");
    return "goDirection";
  },
  S: (fsm) => {
    fsm.send("goSouth");
    return "goDirection";
  },
  L: (fsm) => {
    fsm.send("goEast");
    return "goDirection";
  },
  O: (fsm) => {
    fsm.send("goWest");
    return "goDirection";
  },
  NO: (fsm) => {
    fsm.send("goNorthWest");
    return "goDirection";
  },
  SO: (fsm) => {
    fsm.send("goSouthWest");
    return "goDirection";
  },
  SE: (fsm) => {
    fsm.send("goSouthEast");
    return "goDirection";
  },
  NE: (fsm) => {
    fsm.send("goNorthEast");
    return "goDirection";
  },
};

const createEngine = (user) => {
  const subject = new Subject();
  const location$ = new Subject();

  const initialContext = {
    steps: 0,
    score: 0,
    name: "Pedro",
    messages: [],
    visited: {},
    inventory: [],
    location: "",
    items: {
      [ITEMS.mailboxNote.id]: false,
      [ITEMS.bunNotebook.id]: false,
    },
    objects: {
      "web.machine": {
        state: "off",
        open: false,
        broken: true,
      },
      "web.lab.door-01": {
        open: false,
      },
      "web.lab.rug": {
        open: false,
      },
      "web.lab.trapdoor": {
        open: false,
      },
    },
    openLocks: {
      "l01.behind-house.window": false,
      "l02-attic.entrance.door": {
        open: false,
        attemptsRemaining: 3,
      },
      "l02-tunnel.entrance.door": {
        open: false,
        attemptsRemaining: 10,
      },
      "l03.machine": {
        state: "off",
        open: false,
        attemptsRemaining: 3,
      },
    },
    missions: {
      "l03.retrieveBasketOfEggs": {
        accepted: false,
        done: false,
      },
    },
  };

  const machine = createMachine({
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "game",
    context: _.clone(initialContext),
    initial: "l01",
    on: {
      lookAround: {
        target: "#game.hist",
      },
      getInventory: {
        actions: assign({
          messages: (ctx, e) => {
            const itemList = ctx.inventory.map((item) => `${item2txt(item)}`).join("\n");

            return [
              ...ctx.messages,
              ctx.inventory.length == 0
                ? { prompt: `Você não está carregando nada!` }
                : {
                    prompt: `Você está carregando:\n${itemList}`,
                  },
            ];
          },
        }),
        cond: (ctx) => ctx.steps >= 0,
      },
      getProgress: {
        actions: assign({
          messages: (ctx, e) => {
            return [
              ...ctx.messages,
              {
                prompt: `Você ${
                  ctx.steps == 0
                    ? "não deu nenhum passo."
                    : `deu ${ctx.steps} passo${ctx.steps > 1 ? "s" : ""}. Isso corresponde ~${(ctx.steps * 0.938).toFixed(2)}Km.`
                }\nVocê se encontra no momento em: ${ctx.location}`,
              },
            ];
          },
        }),
        cond: (ctx) => ctx.steps >= 0,
      },
      dropItem: {
        actions: (ctx, { value: item }) => {
          const removeIndex = ctx.inventory.findIndex((obj) => !!obj.id?.match(item));
          if (removeIndex >= 0) {
            const item = ctx.inventory.splice(removeIndex, 1)[0];
            ctx.messages.push({ prompt: `Você não possui mais a ${item?.name}.` });
          } else {
            ctx.messages.push({ prompt: `Você não está carregando este item.` });
          }
        },
        cond: (ctx) => ctx.steps >= 0,
      },
      readItem: {
        actions: (ctx, { value: item }) => {
          const index = ctx.inventory.findIndex((obj) => !!obj.id?.match(item));
          if (index < 0) {
            ctx.messages.push({ prompt: "Você não está carregando este item." });
            return;
          }

          const found = ctx.inventory[index];

          ctx.messages.push({ prompt: readItem(found) });
        },
      },
      seeItem: {
        actions: (ctx, { value: item }) => {
          const index = ctx.inventory.findIndex((obj) => !!obj.id?.match(item));

          if (index < 0) {
            ctx.messages.push({ prompt: "Você não está carregando este item." });
            return;
          }

          const found = ctx.inventory[index];

          ctx.messages.push({ prompt: seeItem(found) });
        },
      },
      detachItem: {
        actions: (ctx, event) => {
          const [v0, v1] = event?.value ?? [];

          if (!v0 || !v1) return;

          const index = ctx.inventory.findIndex((obj) => !!obj.id?.match(v0) || !!obj?.id?.match(v1));

          if (index < 0) {
            ctx.messages.push({ prompt: "Você não está carregando este item." });
            return;
          }

          const found = ctx.inventory[index];

          if (!found.inside) {
            ctx.messages.push({ prompt: "Já removido." });
          }

          const { message, inside, newItem } = detachItem(found);

          ctx.inventory[index] = newItem;
          ctx.inventory.push(inside);
          ctx.messages.push({ prompt: message });
        },
      },
    },
    states: {
      idle: {
        on: {
          startGame: {
            actions: assign({
              messages: addMessages(Messages.startOfGame.intro),
            }),
          },
          approve: {
            target: "l01",
            actions: assign({
              messages: addMessages(Messages.startOfGame.approve),
            }),
          },
          refuse: {
            target: "l01",
            actions: assign({
              messages: addMessages(Messages.startOfGame.refuse),
            }),
          },
        },
      },
      "game-over": {
        entry: assign(
          _.merge({
            ...initialContext,
            messages: [{ prompt: "Como num passe de mágica, você se vê voltando no tempo, tudo lhe parece familiar, mas diferente. O que será que ocorreu?" }],
          }),
        ),
        always: [{ target: "l01" }],
      },
      l01,
      l02Attic,
      l02Tunnel,
      l03,
      l04,
      l05,
      hist: {
        type: "history",
        history: "shallow",
      },
    },
  });

  const saver = createSaver(user);

  const fsm = interpret(machine, { devTools: true }).onTransition(async (state) => {
    if (state?.changed) {
      l.debug(`FSM transitioned to ${JSON.stringify(state?.value)} due to ${state._event?.name} (${state._event?.type})`);

      location$.next(state?.context?.location);
      const messages = _.reverse(state?.context?.messages ?? []);

      let message = messages.pop();

      while (!!message) {
        const m = message.prompt ? message : { prompt: message };
        subject.next(m);
        message = messages.pop();
      }

      await saver(state);
    }
  });

  return {
    start: (savegame) => {
      if (!fsm.initialized) {
        savegame ? fsm.start(savegame) : fsm.start();
        l.info(`⚡ Engine started!`);
      }

      if (!savegame) {
        l.info(`Send startGame to fsm!`);
        fsm.send("startGame");
      }

      // Reload data for subscribers
      location$.next(fsm?.state?.context?.location);
    },
    onLocationChange: (cb = null) => {
      location$.pipe(distinctUntilChanged()).subscribe((location) => {
        l.debug(`Location changed to ${location}`);
        cb?.(location);
      });
    },
    onUpdate: (cb = null) => {
      subject.subscribe((message) => {
        cb?.(message);
      });
    },
    onError: (cb = null) => {
      errorSubject.subscribe(async (error) => {
        await cb?.(error);
      });
    },
    next: async (prompt) => {
      l.debug(`Engine received prompt: "${prompt}"`);

      // Try to capture shortcuts
      if (Object.keys(shortcuts).includes(prompt)) {
        l.debug(`Running shortcut ${prompt} for user`);
        shortcuts[prompt]?.(fsm);
        return;
      }
      // Check if npc exists in current state
      if (fsm.state?.context?.npcName) {
        fsm.send("say", { prompt });
        return;
      }

      // Try to process prompt using NLP
      const { answer, intent, value } = await narrator.say(prompt);

      // Try to capture answer
      if (answer) {
        l.debug(`Sending answer back to client ${answer}`);
        subject.next({ prompt: answer });

        if (!intent) return;
      }

      // Try to capture intent
      if (intent) {
        const { intent: tIntent, value: tValue } = getTransitionName(intent, value, prompt);

        l.debug(`Sending transitionName ${tIntent} with value "${tValue}" to fsm (generated from intent ${intent})`);

        fsm.send(tIntent, { value: tValue });
        return;
      }

      // Return generic error
      l.debug(`fsm didn't had any intent or answer we known, sending default error`);
      subject.next({ prompt: "O que? Eu não entendi. Precisa de ajuda?", who: Characters.NARRATOR });
    },
    _fsm: fsm,
  };
};

module.exports = {
  createEngine,
};
