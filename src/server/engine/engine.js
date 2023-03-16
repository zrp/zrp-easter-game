const { createMachine, interpret, assign, raise, send, sendTo, sendParent } = require("xstate");

const { createSaver } = require("../services/gameService");
const Characters = require("./characters");

const l = require("../logger");
const _ = require("lodash");

const narrator = require("./models/narrator");

const { Subject } = require("rxjs");
const { distinctUntilChanged } = require("rxjs/operators");

const { ConversationContext } = require("node-nlp");
const { result } = require("lodash");
const Messages = require("./messages");
const { choose } = require("xstate/lib/actions");

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

const getTransitionName = (intent, value) => {
  switch (intent) {
    case "goDirection":
      if (value == "north") return "goNorth";
      if (value == "east") return "goEast";
      if (value == "west") return "goWest";
      if (value == "south") return "goSouth";
      if (value == "northwest") return "goNorthWest";
      if (value == "southwest") return "goSouthWest";
      if (value == "southeast") return "goSouthEast";
      if (value == "northeast") return "goNorthEast";
    default:
      return intent;
  }
};

const UNITS = {
  NONE: null,
  LITER: "L",
  MASS: "Kg",
};

const ITEM_TYPES = {
  OBJECT: "object",
};

const createItem = (name, id, meta = {}, qty = 1, unit = UNITS.NONE, type = ITEM_TYPES.OBJECT) => {
  return {
    name,
    id,
    type,
    qty,
    unit,
    ...meta,
  };
};

const ITEM_IDS = {
  mailboxNote: "l01.west-of-house.open-mailbox.note",
};

const ITEMS = {
  mailboxNote: {
    id: ITEM_IDS.mailboxNote,
    item: createItem("nota", ITEM_IDS.mailboxNote, {
      readable: true,
      description: `Uma nota velha e suja. No canto você vê as iniciais Z, R e P. Ela parece ser legível.`,
      contents: `Nota dos desenvolvedores:\nEste jogo foi desenvolvido pela ZRP, e é um desafio para desenvolvedores, mas qualquer um pode jogar.\nEu espero que esse jogo não seja fácil para você, mas se você nunca jogou ZORK, aqui vai uma dica:\nVocê pode digitar alguns atalhos no terminal, e eles executam ações rápidas e comuns nesse jogo:\n\t• P: exibe seu progresso\n\t• I: mostra seu inventário\n\t• N: vai para o Norte\n\t• S: vai para o Sul\n\t• L: vai para o leste\n\t• O: vai para o Oeste\nVocê pode também usar NE (nordeste), SE (sudeste), SO (sudoeste) e NO (noroeste).\nEspero que se divirta! :)\n@p`,
    }),
  },
};

const item2txt = (item) => {
  return `\t• ${item.name} (${item.qty}${item.unit ?? ""})`;
};

const readItem = (item) => {
  if (item.readable) {
    return item.contents;
  } else {
    return `Não é possível ler este item.`;
  }
};

const seeItem = (item) => {
  if (item.description) {
    return item.description;
  } else {
    return `Não é possível ver este item.`;
  }
};

const createEngine = (user, savegame) => {
  const subject = new Subject();
  const location$ = new Subject();

  const addMessages =
    (messages = []) =>
    (ctx, ev) => {
      console.log(ev);
      let newMessages = Array.isArray(messages) ? messages : [messages];

      return [...ctx.messages, ...newMessages];
    };

  const addVisit = (locName) => (ctx) => {
    console.log(ctx);

    if (ctx.visited?.[locName]) {
      ctx.visited[locName] += 1;
    } else {
      ctx.visited[locName] = 1;
    }

    return ctx.visited;
  };

  const addSteps = (ctx) => ctx.steps + 1;

  const defaultActions = {
    goSouth: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goWest: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goEast: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goNorth: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goSouthEast: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goNorthEast: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goNorthWest: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
    goSouthWest: {
      actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
    },
  };

  const l01 = {
    id: "l01",
    initial: "west-of-house",
    on: {
      lookAround: {
        target: "#game.hist",
      },
    },
    states: {
      "west-of-house": {
        initial: "idle",
        entry: assign({
          messages: addMessages(Messages.westOfHouse.entry),
          visited: addVisit("west-of-house"),
          steps: addSteps,
          location: "Oeste da Casa",
        }),
        on: {
          ...defaultActions,
          goNorth: "north-of-house",
          goWest: "west-florest",
          goSouth: "south-of-house",
          goEast: {
            actions: assign({
              messages: [{ prompt: "A porta está fechada e você não pode abrí-la." }],
            }),
          },
          openItem: [
            {
              actions: (ctx, { value: item }) => {
                if (item == "mailbox") {
                  ctx.messages.push({ prompt: `A caixa está vazia` });
                } else {
                  ctx.messages.push({ prompt: `O que você está tentando abrir exatamente?` });
                }
              },
              cond: (ctx, event) => ctx.items[ITEMS.mailboxNote.id],
            },
            {
              target: ".open-mailbox",
              cond: (ctx, event) => event?.value === "mailbox" && !ctx.items[ITEMS.mailboxNote.id],
            },
          ],
        },
        states: {
          idle: {},
          "open-mailbox": {
            entry: assign({
              messages: (ctx, e) => (e.type !== "lookAround" ? addMessages(Messages.westOfHouse.mailboxOpen)(ctx, e) : null),
            }),
            on: {
              grabItem: [
                {
                  target: "idle",
                  actions: [
                    (ctx, event) => {
                      ctx.messages.push(Messages.actions.grab);
                      ctx.inventory.push(ITEMS.mailboxNote.item);
                    },
                    assign({ items: (ctx) => _.merge(ctx.items, { [ITEMS.mailboxNote.id]: true }) }),
                  ],
                  cond: (ctx, event) => event.value == "note" && !ctx.items[ITEMS.mailboxNote.id],
                },
                {
                  target: "idle",
                  actions: [
                    (ctx, event) => {
                      ctx.messages.push({ prompt: "Você já pegou a nota." });
                    },
                  ],
                  cond: (ctx, event) => event.value == "note" && ctx.items[ITEMS.mailboxNote.id],
                },
              ],
            },
          },
        },
      },
      "north-of-house": {
        entry: assign({
          messages: addMessages(Messages.northOfHouse.entry),
          visited: addVisit("north-of-house"),
          steps: addSteps,
          location: "Norte da Casa",
        }),
        on: {
          ...defaultActions,
          goWest: "west-of-house",
          goEast: "behind-house",
          goNorth: "florest-path",
        },
      },
      "behind-house": {
        entry: assign({
          messages: addMessages(Messages.behindHouse.entry),
          visited: addVisit("behind-house"),
          steps: addSteps,
          location: "Atrás da Casa",
        }),
        on: {
          ...defaultActions,
          go2l02: "#l02",
          goNorth: "north-of-house",
          goEast: "east-florest",
          goSouth: "south-of-house",
          goWest: [
            {
              actions: raise("go2l02"),
              cond: (ctx, { value }) => ctx.openLocks["l01.behind-house.window"],
            },
            { actions: assign({ messages: [{ prompt: "A janela está fechada demais para uma pessoa passar." }] }) },
          ],
          enterPlace: [
            {
              actions: raise("go2l02"),
              cond: (ctx, { value }) => value === "house" && ctx.openLocks["l01.behind-house.window"],
            },
          ],
          openItem: [
            {
              actions: assign({
                messages: [{ prompt: `Você fez um tremendo esforço, mas conseguiu abrir a janela o suficiente para permitir que uma pessoa passe.` }],
                openLocks: (ctx) => _.merge(ctx.openLocks, { "l01.behind-house.window": true }),
              }),
              cond: (_, { value }) => {
                return value == "window";
              },
            },
          ],
        },
      },
      "south-of-house": {
        entry: assign({
          messages: addMessages(Messages.southOfHouse.entry),
          visited: addVisit("south-of-house"),
          steps: addSteps,
          location: "Sul da Casa",
        }),
        on: {
          ...defaultActions,
          goEast: "behind-house",
          goWest: "west-of-house",
          goSouth: {
            actions: assign({
              messages: [{ prompt: `Você só vê mato, aparentemente não há nenhuma entrada por aqui.` }],
            }),
          },
          goNorth: {
            actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
          },
        },
      },
      "florest-path": {
        entry: assign({
          messages: addMessages({ prompt: `Caminho da Floresta\n` }),
          visited: addVisit("florest-path"),
          steps: addSteps,
          location: "Caminho da Floresta",
        }),
        on: {
          ...defaultActions,
          goNorth: "clearing",
          goSouth: "north-of-house",
          goWest: {
            actions: assign({ messages: [{ prompt: `A passagem é estreita demais para passar.` }] }),
          },
          goEast: "east-florest",
        },
      },
      clearing: {
        entry: assign({
          messages: addMessages({ prompt: `Clareira\n` }),
          visited: addVisit("florest-path"),
          steps: addSteps,
          location: "Clareira",
        }),
        on: {
          ...defaultActions,
          goSouth: "florest-path",
          goWest: {
            actions: assign({ messages: [{ prompt: `A passagem é estreita demais para passar.` }] }),
          },
          goEast: "east-florest",
        },
      },
      "east-florest": {
        entry: assign({
          messages: addMessages(Messages.eastFlorest.entry),
          visited: addVisit("east-florest"),
          steps: addSteps,
          location: "Entrada da Floresta Leste",
        }),
        on: {
          ...defaultActions,
          goNorth: {
            actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
          },
          goSouth: {
            actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
          },
          goEast: "canyon",
          goWest: "behind-house",
        },
      },
      canyon: {
        entry: assign({
          messages: addMessages({
            prompt: `Vista para o desfiladeiro\nVocê está no topo do desfiladeiro, em sua parede oeste. A partir daqui, há uma vista maravilhosa do rio abaixo. Do outro lado do desfiladeiro, as paredes dos penhascos brancos se unem às poderosas muralhas das montanhas. Seguindo o desfiladeiro rio acima, para o norte, uma cidade pode ser vista. O poderoso rio flui de uma grande caverna escura. A oeste e a sul avista-se uma imensa floresta, estendendo-se por quilómetros ao redor. Você vê uma passagem estreita à noroeste, ela parece te levar à base do desfiladeiro.`,
          }),
        }),
        on: {
          ...defaultActions,
          goNorthWest: "#l02",
        },
      },
      "west-florest": {
        entry: assign({
          messages: addMessages(Messages.westFlorest.entry),
          visited: addVisit("west-florest"),
          steps: addSteps,
          location: "Entrada da Floresta Oeste",
        }),
        on: {
          goNorth: {
            actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
          },
          goSouth: {
            actions: assign({ messages: addMessages(Messages.errors.goDirection) }),
          },
          goWest: {
            actions: assign({ messages: [{ prompt: `Você não possui uma lanterna para enxergar a passagem` }] }),
          },
          goEast: "west-of-house",
        },
      },
    },
  };

  const l02 = {
    id: "l02",
    initial: "attic-entrance",
    states: {
      "attic-entrance": {
        entry: assign({
          messages: addMessages([
            { prompt: `Você tropeça e dá de cara no chão. Você começa a rolar  Sua mente começa a vagar, e você se vê transportar para outro mundo.` },
            {
              prompt: `(?) / Entrada\nVocê acorda numa sala branca, coberta com uma fina neblina cinza. Você não tem mais nenhum pertence com você.\nAo leste você vê uma porta preta com uma tranca dourada.`,
            },
          ]),
          inventory: [],
          location: "(?) / Entrada",
        }),
      },
    },
  };

  const machine = createMachine({
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "game",
    state: savegame,
    context: {
      steps: -1,
      score: 0,
      name: "Pedro",
      messages: [],
      visited: {},
      inventory: [],
      location: "",
      items: {
        [ITEMS.mailboxNote.id]: false,
      },
      openLocks: {
        "l01.behind-house.window": false,
      },
    },
    initial: "idle",
    on: {
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
                  ctx.steps == 0 ? "não deu nenhum passo." : `deu ${ctx.steps} passo${ctx.steps > 1 ? "s" : ""}.`
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
      l01,
      l02,
      hist: {
        type: "history",
        history: "shallow",
      },
    },
  });

  const saver = createSaver(user);

  const fsm = interpret(machine).onTransition(async (state) => {
    if (state.changed) {
      l.debug(`FSM transitioned to ${JSON.stringify(state.value)} due to ${state._event?.name} (${state._event?.type})`);

      location$.next(state.context.location);
      const messages = _.reverse(state.context.messages ?? []);

      let message = messages.pop();

      while (!!message) {
        subject.next(message);
        message = messages.pop();
      }

      await saver(state);
    }
  });

  return {
    start: (savegame) => {
      if (!fsm.initialized) {
        fsm.start(savegame);
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
      const stateWas = _.cloneDeep(fsm.state);
      l.debug(`Engine received prompt: "${prompt}"`);

      // Try to capture shortcuts
      if (Object.keys(shortcuts).includes(prompt)) {
        l.debug(`Running shortcut ${prompt} for user`);
        shortcuts[prompt]?.(fsm);
        return;
      }

      // Try to process prompt using NLP
      const r = await narrator.say(prompt);

      l.debug(`Prompt resulted in ${JSON.stringify(r, null, 2)}`);

      const { answer, intent, value, conversationContext } = r;

      // Try to capture answer
      if (answer) {
        l.debug(`Sending answer back to client ${answer}`);
        return;
      }

      // Try to capture intent
      if (intent) {
        const transitionName = getTransitionName(intent, value);

        l.debug(`Sending transitionName ${transitionName} with value "${value}" to fsm (generated from intent ${intent})`);

        fsm.send(transitionName, { value: value });
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
