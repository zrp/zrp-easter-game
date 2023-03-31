const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit, acceptedMission, setMessages, pen, pendingMissiondingMission, pendingMission } = require("../context");
const { ITEMS } = require("../inventory");
const { defaultActions, talk2npc } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

const npcs = require("../npcs");

const checkMissionAccepted = {
  target: "#l03.idle",
  actions: setMessages("Você pensa que talvez devesse falar com o coelho antes de mexer na estranha máquina."),
  cond: (ctx) => !ctx.missions["l03.retrieveBasketOfEggs"].accepted,
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
              prompt: `Laboratório\nVocê abre a porta e se depara com um moderno laboratório. A porta rapidamente se fecha. Ela parece queimada de vez.\nAo leste da sala você vê uma máquina estranha. Ela parece ${
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
        refuse: {
          actions: (ctx) => {
            ctx.messages.push({ prompt: "Você decide explorar mais a sala." });
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
          {
            target: "machine",
            cond: (_, { value }) => value === "machine",
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
            target: "#l03.idle",
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
            src: talk2npc((context, { intent, value }) => {
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
      initial: "machineWaiting",
      entry: assign({
        messages: (ctx) =>
          addMessages([
            {
              prompt: `Laboratório / Máquina\nVocê se aproxima de uma máquina estranha e grande. Ela parece ${
                ctx.openLocks["l03.machine"]?.state == "on" ? "ligada" : "desligada"
              }. Você vê um terminal e um teclado na mesa.`,
            },
          ])(ctx),
        location: "Laboratório / Máquina",
      }),
      on: {
        ...defaultActions,
        goWest: "#l03.idle",
        turnOff: [
          checkMissionAccepted,
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
          checkMissionAccepted,
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
      },
      states: {
        machineWaiting: {
          on: {
            type: [
              checkMissionAccepted,
              {
                target: "#l04",
                actions: assign({
                  messages: [
                    {
                      prompt:
                        "Você digita a senha correta!\nA máquina se abre e você visualiza um portal azul para outra dimensão. Antes que você pudesse se despedir, o portal te suga para dentro dele (...)",
                    },
                    {
                      prompt: "Até logo! E boa sorte!",
                      who: Characters.BUN,
                    },
                  ],
                  openLocks: (ctx) => _.merge(ctx.openLocks, { "l03.machine": { open: true } }),
                  inventory: (ctx) => [...ctx.inventory, ITEMS.bunKey.item],
                }),
                cond: (ctx, { value }) => value === "ada" && ctx.missions["l03.retrieveBasketOfEggs"].accepted && ctx.openLocks["l03.machine"]?.state == "on",
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

module.exports = l03;
