const { createMachine, interpret, assign, raise, send, sendTo, sendParent } = require("xstate");

const { createSaver } = require("../services/gameService");
const Characters = require("./characters");

const l = require("../logger");
const _ = require("lodash");

const narrator = require("./models/narrator");
const bun = require("./models/bun");

const { Subject } = require("rxjs");
const { distinctUntilChanged } = require("rxjs/operators");

const { ConversationContext } = require("node-nlp");
const { result } = require("lodash");
const Messages = require("./messages");
const { choose } = require("xstate/lib/actions");
const { actions } = require("./messages");

const npcs = {
  [Characters.BUN.id]: bun,
};

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

const getTransitionName = (intent, value, prompt = null) => {
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
    case "type":
      return { intent, value: value ?? prompt };
    default:
      return { intent, value };
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
  bunNotebook: "l03.diary",
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
  bunNotebook: {
    id: ITEM_IDS.bunNotebook,
    item: createItem("diário do Bun", ITEM_IDS.bunNotebook, {
      readable: true,
      description: `Um caderno estranho, ele parece um diário. Na capa você lê "Propriedade de Bun, O Coelho". Ela parece ser legível.`,
      contents: `Diário do Bun\n---------------------------\nA senha do teletransportador jamais deve ser divulgada. Apenas os verdadeiros cidadãos de W'eb devem saber a resposta.\nJá sei, a senha será o nome da primeira pessoa a programar na história.\n- Bun`,
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

const createEngine = (user) => {
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
    turnOn: {
      actions: assign({ messages: addMessages({ prompt: "Ligar o que exatamente?" }) }),
      cond: (e, { value }) => !value,
    },
  };

  const talk2npc = (eventHandler = (result) => false) => {
    return async (ctx, { prompt }) => {
      const name = ctx.npcName;
      const npc = npcs[name];

      if (!npc) ctx.messages.push({ prompt: "Eu não entendi", who: npc.char });

      // Try to process prompt using NLP
      const r = await npc.say(prompt);

      l.debug(`Sending prompt to npc ${name}, prompt resulted in ${JSON.stringify(r, null, 2)}`);

      const { answer, intent, value } = r;

      const ehAnswer = eventHandler?.(r, ctx);

      if (ehAnswer) {
        subject.next({ prompt: ehAnswer, who: npc.char });

        return;
      }

      // Try to auto-capture intent
      if (intent === "exitConversation") {
        l.debug(`Intent is to exit conversation, throwing error`);
        throw new Error("conversation ended");
      }

      // Try to capture answer
      if (answer) {
        l.debug(`Sending answer back to client ${answer}`);
        subject.next({ prompt: answer, who: npc.char });
        return;
      }

      if (intent) {
        const { intent: tIntent, value: tValue } = getTransitionName(intent, value, prompt);

        l.debug(`Sending transitionName ${tIntent} with value "${tValue}" to fsm (generated from intent ${intent})`);

        fsm.send(tIntent, { value: tValue });
        return;
      }

      // Return generic error
      l.debug(`fsm didn't had any intent or answer we known, sending default error`);
      subject.next({ prompt: "O que? Eu não entendi", who: npc.char });
    };
  };

  const l01 = {
    id: "l01",
    initial: "west-of-house",
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
          go2l02: "#l02-attic",
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
          enterLocation: [
            {
              actions: raise("go2l02"),
              cond: (ctx, { value }) => value === "house" && ctx.openLocks["l01.behind-house.window"],
            },
            {
              actions: assign({
                messages: [{ prompt: `A janela parece estar muito fechada para isso. Talvez tentar abrí-la um pouco?` }],
              }),
              cond: (ctx, { value }) => value === "house" && !ctx.openLocks["l01.behind-house.window"],
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
            prompt: `Vista para o desfiladeiro\nVocê está no topo do desfiladeiro, em sua parede oeste. Daqui há uma vista maravilhosa para o rio abaixo. Do outro lado do desfiladeiro as paredes dos penhascos brancos se unem às poderosas muralhas das montanhas. Seguindo o desfiladeiro rio acima, para o norte, uma cidade pode ser vista. O rio flui de uma grande caverna escura. A oeste e a sul avista-se uma imensa floresta, estendendo-se por quilômetros ao redor. Você vê uma passagem estreita à noroeste, ela parece te levar à base do desfiladeiro.`,
          }),
          visited: addVisit("canyon"),
          steps: addSteps,
        }),
        on: {
          ...defaultActions,
          goNorthWest: "#l02-tunnel",
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

  const l02Attic = {
    id: "l02-attic",
    initial: "entrance",
    states: {
      entrance: {
        initial: "idle",
        entry: assign({
          messages: addMessages([
            {
              prompt: `Sotão\nVocê tropeça na janela e dá de cara no chão. No chão havia um alçapão que se abre com o impacto, e você começa a rolar por um túnel escuro.\nVocê cai num sotão mofado e úmido, iluminado apenas pela fraca luz que passa pelo túnel e pela fresta na porta ao leste.`,
            },
          ]),
          location: "Sotão",
          visited: addVisit("l02.attic-entrance"),
          steps: addSteps,
        }),
        on: {
          ...defaultActions,
          goEast: ".at-door",
          openItem: {
            target: ".at-door",
            cond: (_, ev) => ev?.value === "door",
          },
        },
        states: {
          idle: {},
          "at-door": {
            entry: assign({
              messages: addMessages([
                {
                  prompt: `Você se aproxima da porta e ouve cochichos ao fundo. Você tenta abrir a porta, mas ela está trancada. Você vê um painel eletrônico ao lado, e acima dele escrito: "A senha é o melhor framework Ruby já feito"`,
                },
              ]),
            }),
            on: {
              type: [
                {
                  target: "#l03",
                  actions: assign({
                    messages: [
                      {
                        prompt:
                          'Você digita sua senha. O monitor exibe: "Senha correta!"\nA porta se abre e você atravessa ela rapidamente, deixando aquele lugar imundo.',
                      },
                    ],
                    openLocks: (ctx) => _.merge(ctx.openLocks, { "l02-attic.entrance.door": { open: true } }),
                  }),
                  cond: (context, { value }) => value === "rails",
                },
                {
                  target: "#game.game-over",
                  actions: assign({
                    messages: [
                      {
                        prompt:
                          'Você digita sua senha. O monitor exibe: "Limite de tentativas excedido"\nVocê começa a ouvir o barulho de um motor ao fundo. As paredes da sala parecem se aproximar. Elas rapidamente começam a acelerar em sua direção. Você resiste, mas não há nada que você possa fazer.',
                      },
                    ],
                  }),
                  cond: (context, { value }) => context.openLocks["l02-attic.entrance.door"]?.attemptsRemaining === 1,
                },
                {
                  actions: assign((ctx) => ({
                    openLocks: _.merge(ctx.openLocks, {
                      "l02-attic.entrance.door": {
                        attemptsRemaining: ctx.openLocks["l02-attic.entrance.door"]?.attemptsRemaining - 1,
                      },
                    }),
                    messages: [
                      {
                        prompt: `Você digita sua senha. O monitor exibe: "Senha incorreta! Tentativas restantes: ${ctx.openLocks["l02-attic.entrance.door"]?.attemptsRemaining}"`,
                      },
                    ],
                  })),
                  openLocks: (ctx) =>
                    _.merge(ctx.openLocks, {
                      "l02-attic.entrance.door": {
                        attemptsRemaining: ctx.openLocks["l02-attic.entrance.door"]?.attemptsRemaining - 1,
                      },
                    }),
                  cond: (context, { value }) => !value || value !== "rails",
                },
              ],
            },
          },
        },
      },
    },
  };

  const l02Tunnel = {
    id: "l02-tunnel",
    initial: "tunnel-entrance",
    states: {
      "tunnel-entrance": {
        initial: "idle",
        entry: assign({
          messages: addMessages([
            {
              prompt: `Túnel\nVocê tropeça no caminho, rolando pela encosta do desfiladeiro. O chão irregular e coberto de folhas esconde um buraco que se abre com o impacto, te sugando para dentro da terra.\nVocê bate em algumas pedras no meio do caminho, mas finalmente chega ao que parece ser a entrada de um túnel velho, iluminado apenas pela fraca luz que passa pelo buraco acima e pela fresta de uma porta à oeste.`,
            },
          ]),
          location: "Túnel",
          visited: addVisit("l02.tunnel-entrance"),
          steps: addSteps,
        }),
        on: {
          ...defaultActions,
          goWest: ".at-door",
          openItem: {
            target: ".open-door",
            cond: (_, ev) => ev?.value === "door",
          },
        },
        states: {
          idle: {},
          "open-door": {
            entry: assign({
              messages: addMessages([
                {
                  prompt: `Você tenta abrir a porta, mas a porta está trancada.`,
                },
              ]),
            }),
            always: [{ target: "at-door" }],
          },
          "at-door": {
            entry: assign({
              messages: addMessages([
                {
                  prompt: `Você se aproxima da porta e ouve cochichos ao fundo. Você vê um painel eletrônico ao lado, e acima dele escrito:\n-----------------------------------------------\nDigite a resposta à seguinte charada para abrir essa porta:\n"Eu tenho cidades, mas não tenho casas. Eu tenho montanhas, mas não tenho árvores. Eu tenho água, mas não tenho peixes. O que eu sou?"\n-----------------------------------------------\n`,
                },
              ]),
            }),
            on: {
              refuse: {
                actions: assign({
                  messages: [
                    {
                      prompt: 'A porta parece te encarar, como se dissese: "Já desistindo?!"',
                    },
                  ],
                }),
              },
              type: [
                {
                  target: "#l03",
                  actions: assign({
                    messages: [
                      {
                        prompt:
                          'Você digita sua senha. O monitor exibe: "Senha correta!"\nA porta se abre e você atravessa o túnel em direção a uma forte luz branca.',
                      },
                    ],
                    openLocks: (ctx) => _.merge(ctx.openLocks, { "l02-tunnel.entrance.door": { open: true } }),
                  }),
                  cond: (context, { value }) => value === "map",
                },
                {
                  target: "#game.game-over",
                  actions: assign({
                    messages: [
                      {
                        prompt:
                          "Você digita sua senha. O monitor exibe:\nLimite de tentativas excedido, autodestruição em\n3...\n2...\n1...\nVocê vê uma fumaça preta sair da tranca. Não há mais nada que você possa fazer.",
                      },
                    ],
                  }),
                  cond: (context, { value }) => context.openLocks["l02-tunnel.entrance.door"]?.attemptsRemaining === 1,
                },
                {
                  actions: assign((ctx) => ({
                    openLocks: _.merge(ctx.openLocks, {
                      "l02-tunnel.entrance.door": {
                        attemptsRemaining: ctx.openLocks["l02-tunnel.entrance.door"]?.attemptsRemaining - 1,
                      },
                    }),
                    messages: [
                      {
                        prompt: `Você digita sua senha. O monitor exibe: "Senha incorreta! Tentativas restantes: ${ctx.openLocks["l02-tunnel.entrance.door"]?.attemptsRemaining}"`,
                      },
                    ],
                  })),
                  openLocks: (ctx) =>
                    _.merge(ctx.openLocks, {
                      "l02-tunnel.entrance.door": {
                        attemptsRemaining: ctx.openLocks["l02-tunnel.entrance.door"]?.attemptsRemaining - 1,
                      },
                    }),
                  cond: (context, { value }) => !value || value !== "rails",
                },
              ],
            },
          },
        },
      },
    },
  };

  const l03 = {
    id: "l03",
    initial: "idle",
    states: {
      idle: {
        entry: assign({
          messages: (ctx) =>
            addMessages([
              {
                prompt: `Laboratório\nVocê abre a porta e se depara com um moderno laboratório. Ao leste da sala você vê uma máquina estranha. Ela parece ${
                  ctx.openLocks["l03.machine"]?.state == "on" ? "ligada" : "desligada"
                }. Você vê papéis amontoados numa mesa do seu lado. No fundo da sala você vê um coelho sentado. Ele parece desolado.\n`,
              },
            ])(ctx),
          location: "Laboratório",
        }),
        on: {
          ...defaultActions,
          goEast: "machine",
          approve: {
            target: "npc",
            actions: (ctx) => {
              ctx.messages.push({ prompt: "Você decide falar novamente com o coelho." });
            },
          },
          speakTo: [
            {
              actions: assign({
                messages: [{ prompt: `Você já falou com o coelho e aceitou a missão de recuperar a cesta de ovos. Quer falar novamente com ele?` }],
              }),
              cond: (ctx) => ctx.missions["l03.retrieveBasketOfEggs"]?.accepted,
            },
            {
              target: "npc",
              actions: (ctx) => {
                ctx.messages.push({ prompt: "Você decide falar com o coelho (talvez seja uma boa ideia dizer oi)." });
              },
              cond: (ctx, { value }) => value === Characters.BUN.id,
            },
          ],
          seeItem: [
            {
              actions: assign({
                messages: [{ prompt: "Você vê uma mesa extremamente bagunçada. Você vê um diário que parece ser do coelho." }],
              }),
              cond: (_, { value }) => value === "table",
            },
          ],
          grabItem: [
            {
              actions: [
                (ctx, event) => {
                  ctx.messages.push(Messages.actions.grab);
                  ctx.inventory.push(ITEMS.bunNotebook.item);
                },
                assign({ items: (ctx) => _.merge(ctx.items, { [ITEMS.bunNotebook.id]: true }) }),
              ],
              cond: (ctx, event) => event.value == "diary" && !ctx.items[ITEMS.bunNotebook.id],
            },
            {
              actions: [
                (ctx, event) => {
                  ctx.messages.push({ prompt: "Você já pegou o diário." });
                },
              ],
              cond: (ctx, event) => event.value == "diary" && ctx.items[ITEMS.bunNotebook.id],
            },
          ],
        },
      },
      npc: {
        id: "npc",
        initial: "waiting",
        entry: assign({
          npcName: Characters.BUN.id,
          cc: {},
        }),
        exit: assign({
          npcName: null,
          cc: {},
        }),
        on: {
          ...defaultActions,
          say: [
            {
              target: "idle",
              cond: (ctx) => !ctx.npcName || (ctx.npcName && !npcs[ctx.npcName]),
            },
            {
              target: ".speaking",
            },
          ],
        },
        states: {
          waiting: {},
          conversationExit: {
            entry: assign({
              messages: [{ prompt: "Você termina de conversar com Bun." }],
            }),
            always: [{ target: "#l03.idle" }],
          },
          speaking: {
            invoke: {
              id: "talk2npc",
              src: talk2npc(({ intent, value }, context) => {
                l.debug(`Event handler for talk2npc called with intent ${intent}`);
                const mission = context.missions["l03.retrieveBasketOfEggs"];

                const previous = { ...(context.cc ?? {}) };
                context.cc.previous = { intent, value };

                switch (intent) {
                  case "hello":
                    return `Aaaaaaaaaaaah! Que susto!\nAchei que era aquele ladrão novamente. Você poderia me ajudar!?`;
                  case "refuse":
                    if (previous.intent === "niceToMeetYou") return `Tudo bem!`;
                    if (previous.intent === "complaining") return `Ok, se quiser algo só me perguntar!`;
                    if (previous.intent === "acceptMission") throw new Error("conversation ended");
                    return false;
                  case "withWhat":
                    return "Um ladrão roubou minha cesta. Você pode me ajudar?";
                  case "acceptMission":
                    if (mission.accepted) {
                      return "Obrigado por me ajudar, há algo mais que você precise saber?";
                    } else {
                      mission.accepted = true;
                      return "Aaaah, muito obrigado! Então, eu estava me preparando para a páscoa e vim para esse mundo para distribuir os ovos para as crianças, mas quando cheguei no meu laboratório fui surpreendido por um ladrão. Ele roubou minha cesta e fugiu de volta para a nossa dimensão. Eu tentei ir atrás dele, mas eu escorreguei e não consegui.";
                    }
                  default:
                    if (!mission.accepted) return `Eu só posso te falar o que ocorreu se você decidir me ajudar`;
                    return false;
                }
              }),
              onDone: {
                target: "waiting",
              },
              onError: {
                target: "conversationExit",
              },
            },
          },
        },
      },
      machine: {
        initial: "idle",
        entry: assign({
          messages: (ctx) =>
            addMessages([
              {
                prompt: `Laboratório / Máquina\nVocê se aproxima de uma máquina estranha e grande. Ela parece ${
                  ctx.openLocks["l03.machine"]?.state == "on" ? "ligada" : "desligada"
                }.`,
              },
            ])(ctx),
          location: "Laboratório / Máquina",
        }),
        on: _.merge(defaultActions, {
          goWest: "idle",
          turnOff: [
            {
              actions: assign({
                messages: addMessages({
                  prompt: `Você desligou a máquina.`,
                  specialAction: "question:get-machine-code",
                }),
                openLocks: (ctx) => _.merge(ctx.openLocks, { "l03.machine": { state: "off" } }),
              }),
              cond: (ctx, { value }) => ctx.openLocks["l03.machine"]?.state == "on",
            },
            {
              actions: assign({
                messages: addMessages({ prompt: `A máquina já está desligada.` }),
              }),
            },
          ],
          turnOn: [
            {
              target: ".machineWaiting",
              actions: assign({
                messages: addMessages({
                  prompt: `Você ligou a máquina. Ao fazê-lo, ela pede que você digite a senha para ativação.`,
                }),
                openLocks: (ctx) => _.merge(ctx.openLocks, { "l03.machine": { state: "on" } }),
              }),
              cond: (ctx, { value }) => ctx.openLocks["l03.machine"]?.state == "off",
            },
            {
              actions: assign({
                messages: addMessages({ prompt: `A máquina já está ligada. Ela pede uma senha de ativação.` }),
              }),
            },
          ],
        }),
        states: {
          idle: {},
          machineWaiting: {
            on: {
              type: [
                {
                  target: "#l04",
                  actions: assign({
                    messages: [
                      {
                        prompt: "Antes que você se vá, tome esse contador e essa chave! Eles te ajudarão em breve!",
                        who: Characters.BUN,
                      },
                      {
                        prompt:
                          "Você digita a senha. A máquina se abre e você visualiza um portal. Antes que você pudesse se despedir, o portal te suga para dentro dele.",
                      },
                      {
                        prompt: "Até logo! E boa sorte!",
                        who: Characters.BUN,
                      },
                    ],
                    openLocks: (ctx) => _.merge(ctx.openLocks, { "l03.machine": { open: true } }),
                    // inventory: (ctx) => ctx.inventory.push(),
                  }),
                  cond: (context, { value }) => value === "ada",
                },
                {
                  actions: assign((ctx) => ({
                    openLocks: _.merge(ctx.openLocks, {
                      "l03.machine": {
                        attemptsRemaining: ctx.openLocks["l03.machine"]?.attemptsRemaining - 1,
                      },
                    }),
                    messages: [
                      {
                        prompt: `Senha incorreta!`,
                      },
                    ],
                  })),
                  cond: (ctx) => ctx.openLocks["l03.machine"]?.state == "on",
                },
                {
                  actions: assign({
                    messages: [{ prompt: `A máquina precisa estar ligada!` }],
                  }),
                },
              ],
            },
          },
        },
      },
    },
  };

  const initialContext = {
    steps: -1,
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
    initial: "l03",
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
      l04: {
        id: "l04",
        states: {},
      },
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
        subject.next(message);
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
      const stateWas = _.cloneDeep(fsm.state);
      l.debug(`Engine received prompt: "${prompt}"`);

      // Try to capture shortcuts
      if (Object.keys(shortcuts).includes(prompt)) {
        l.debug(`Running shortcut ${prompt} for user`);
        shortcuts[prompt]?.(fsm);
        return;
      }

      // if (r.intent == "lookAround") {
      //   fsm.send("lookAround");
      //   return;
      // }

      // Check if npc exists in current state
      if (fsm.state?.context?.npcName) {
        fsm.send("say", { prompt });
        return;
      }

      // Try to process prompt using NLP
      const r = await narrator.say(prompt);

      l.debug(`Prompt resulted in ${JSON.stringify(r, null, 2)}`);

      const { answer, intent, value, conversationContext } = r;

      // Try to capture answer
      if (answer) {
        l.debug(`Sending answer back to client ${answer}`);
        subject.next({ prompt: answer });
        return;
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
