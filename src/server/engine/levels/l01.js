const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit } = require("../context");
const { ITEMS, ITEM_IDS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

const l01 = {
  id: "l01",
  initial: "west-of-house",
  states: {
    "west-of-house": {
      initial: "idle",
      entry: (ctx) => {
        ctx.messages.push(Messages.westOfHouse.entry);
        ctx.steps += 1;
        ctx.location = "Oeste da Casa";
      },
      on: {
        ...defaultActions,
        goNorth: "north-of-house",
        goWest: "west-florest",
        goSouth: "south-of-house",
        goEast: "inside-of-house.living-room",
        openItem: [
          {
            actions: (ctx) => {
              ctx.messages.push(`A caixa está vazia.`);
            },
            cond: (ctx, { value }) => ctx.items[ITEMS.mailboxNote.id] && value == "mailbox",
          },
          {
            target: ".open-mailbox",
            cond: (ctx, { value }) => value == "mailbox",
          },
        ],
      },
      states: {
        idle: {},
        "open-mailbox": {
          entry: (ctx, { type }) => {
            if (type !== "lookAround") ctx.messages.push(Messages.westOfHouse.mailboxOpen);
          },
          on: {
            grabItem: [
              {
                target: "idle",
                actions: [
                  (ctx) => {
                    ctx.score += 2;
                    ctx.messages.push(Messages.actions.grab);
                    ctx.inventory.push(ITEMS.mailboxNote.item);
                    ctx.items[ITEMS.mailboxNote.id] = true;
                  },
                ],
                cond: (ctx, event) => event.value == "note" && !ctx.items[ITEMS.mailboxNote.id],
              },
              {
                target: "idle",
                actions: [
                  (ctx) => {
                    ctx.messages.push("Você já pegou a nota.");
                  },
                ],
                cond: (ctx, event) => event.value == "note" && ctx.items[ITEMS.mailboxNote.id],
              },
            ],
          },
        },
      },
    },
    "inside-of-house": {
      states: {
        "living-room": {
          entry: (ctx) => {
            ctx.messages.push(
              `Casa / Sala\nVocê entra na casa, você está na sala. Você vê uma mesa de café ao centro. Você vê alguns quadros na parede. ${
                ctx.objects["house.painting"] ? "Um dos quadros está no chão. Atrás dele havia um cofre." : "Um dos quadros parece torto."
              } Parece haver uma cozinha à leste.`,
            );
            ctx.location = "Casa / Sala";
            ctx.steps += 1;
          },
          on: {
            goWest: "#l01.west-of-house",
            goEast: "kitchen",
            goNorth: {
              actions: (ctx) => ctx.messages.push(`Você tenta abrir a porta ao norte. Ela parece estar fechada do outro lado`),
            },
            type: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`Senha válida.`);
                  ctx.messages.push(`O cofre se abre, revelando uma caixa de jóias dentro dele.\nPego.`);
                  ctx.inventory.push(ITEMS.jewerelyBox.item);
                  ctx.score += 15;
                  ctx.objects["house.safe"] = true;
                },
                cond: (ctx, e) => !ctx.objects["house.safe"] && ctx.objects["house.painting"] && !!e.value.match("183729"),
              },
              {
                actions: (ctx) => ctx.messages.push(`Senha inválida`),
                cond: (ctx, e) => !ctx.objects["house.safe"] && ctx.objects["house.painting"] && !e.value.match("183729"),
              },
            ],
            grabItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você já pegou o bilhete da mesa.`);
                },
                cond: (ctx, { value }) => ctx.objects["house.quicknote"] && value == "quicknote",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Pego.`);
                  ctx.score += 5;
                  ctx.objects["house.quicknote"] = true;
                  ctx.inventory.push(ITEMS.quickNote.item);
                },
                cond: (ctx, { value }) => !ctx.objects["house.quicknote"] && value == "quicknote",
              },
            ],
            seeItem: [
              {
                actions: (ctx) => {
                  if (ctx.objects["house.quicknote"]) {
                    ctx.messages.push("Uma mesa de café. Ela está vazia.");
                  } else {
                    ctx.messages.push(`Na mesa de café você vê um bilhete. Ele parece ter sido escrito recentemente.`);
                  }
                },
                cond: (ctx, { value }) => value == "table",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Um bilhete escrito a mão. Ele parece ser legível.`);
                },
                cond: (ctx, { value }) => value == "quicknote",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(
                    `Você observa o quadro. Ele parece levemente torto. Na pintura você vê o que parecem ser uma pessoa e um coelho conversando.`,
                  );
                },
                cond: (ctx, { value }) => value == "painting",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(
                    `O cofre parece trancado! Ele pede uma combinação de 6 dígitos. Você vê um teclado numérico:\n7 | 8 | 9\n4 | 5 | 6\n1 | 2 | 3\n`,
                  );
                },
                cond: (ctx, { value }) => !ctx.objects["house.safe"] && value == "safe",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Um cofre aberto.`);
                },
                cond: (ctx, { value }) => ctx.objects["house.safe"] && value == "safe",
              },
            ],
            detachItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você retirou o quadro da parede, revelando um cofre.`);
                  ctx.objects["house.painting"] = true;
                  ctx.score += 8;
                },
                cond: (ctx, { value }) => {
                  const [v0, v1] = value ?? [];
                  return !ctx.objects["house.painting"] && (v0 == "painting" || v1 == "painting");
                },
              },
              {
                actions: (ctx) => ctx.messages.push("Você já tirou o quadro da parede. Você vê um cofre."),
                cond: (ctx, { value }) => {
                  const [v0, v1] = value ?? [];
                  return ctx.objects["house.painting"] && (v0 == "painting" || v1 == "painting");
                },
              },
            ],
            pull: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você retirou o quadro da parede, revelando um cofre.`);
                  ctx.objects["house.painting"] = true;
                  ctx.score += 8;
                },
                cond: (ctx, { value }) => !ctx.objects["house.painting"] && value == "painting",
              },
              {
                actions: (ctx) => ctx.messages.push("Você já tirou o quadro da parede. Você vê um cofre."),
                cond: (ctx, { value }) => value == "painting",
              },
            ],
            openItem: [
              {
                actions: (ctx) => ctx.messages.push("O cofre já está aberto."),
                cond: (ctx, { value }) => ctx.objects["house.safe"] && value == "safe",
              },
              {
                actions: (ctx) => ctx.messages.push("Você precisa digitar a senha de 6 dígitos para abrir o cofre."),
                cond: (ctx, { value }) => !ctx.objects["house.safe"] && value == "safe",
              },
            ],
          },
        },
        kitchen: {
          entry: (ctx) => {
            ctx.messages.push(
              `Casa / Cozinha\nVocê entra na casa, você está na cozinha. Você vê uma bancada e alguns armários. Você vê uma janela à leste e uma porta ao norte. Você vê um alçapão que parece dar para um sotão.`,
            );
            ctx.location = "Casa / Cozinha";
            ctx.steps += 1;
          },
          on: {
            goWest: "living-room",
            goDown: {
              target: "#l02-attic",
            },
            openItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`A janela já está aberta!`);
                },
                cond: (ctx, { value }) => ctx.openLocks["l01.behind-house.window"] && value == "window",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(
                    `Você fez um tremendo esforço, mas conseguiu abrir a janela o suficiente para permitir que uma pessoa passe.`,
                  );
                  ctx.openLocks["l01.behind-house.window"] = true;
                  ctx.score += 3;
                },
                cond: (ctx, { value }) => !ctx.openLocks["l01.behind-house.window"] && value == "window",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você já abriu os armários. Eles estão vazios.`);
                },
                cond: (ctx, { value }) => ctx.objects["house.cabinets"] && value == "locker",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você abriu os armários. Eles estão vazios.`);
                  ctx.score += 3;
                  ctx.objects["house.cabinets"] = true;
                },
                cond: (ctx, { value }) => !ctx.objects["house.cabinets"] && value == "locker",
              },
            ],
            goEast: [
              {
                target: "#l01.behind-house",
                cond: (ctx, { value }) => ctx.openLocks["l01.behind-house.window"],
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`A janela parece estar muito fechada para isso. Talvez tentar abrí-la um pouco?`);
                },
                cond: (ctx, { value }) => !ctx.openLocks["l01.behind-house.window"],
              },
            ],
            seeItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você vê um armário.`);
                },
                cond: (ctx, { value }) => value == "locker",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você olha para a bancada, reparando no estranho formato inscrito no mármore: ▼`);
                },
                cond: (ctx, { value }) => value == "countertop",
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
            target: "inside-of-house.kitchen",
            cond: (ctx, { value }) => ctx.openLocks["l01.behind-house.window"],
          },
          {
            actions: (ctx) => {
              ctx.messages.push(`A janela parece estar muito fechada para isso. Talvez tentar abrí-la um pouco?`);
              ctx.score += 3;
            },
            cond: (ctx, { value }) => !ctx.openLocks["l01.behind-house.window"],
          },
        ],
        enterLocation: [
          {
            target: "inside-of-house.kitchen",
            cond: (ctx, { value }) => value === "house" && ctx.openLocks["l01.behind-house.window"],
          },
          {
            actions: (ctx) => {
              ctx.messages.push(`A janela parece estar muito fechada para isso. Talvez tentar abrí-la um pouco?`);
              ctx.score += 3;
            },
            cond: (ctx, { value }) => value === "house" && !ctx.openLocks["l01.behind-house.window"],
          },
        ],
        openItem: [
          {
            actions: (ctx) => {
              ctx.messages.push(`A janela já está aberta!`);
            },
            cond: (ctx, { value }) => ctx.openLocks["l01.behind-house.window"] && value == "window",
          },
          {
            actions: (ctx) => {
              ctx.messages.push(
                `Você fez um tremendo esforço, mas conseguiu abrir a janela o suficiente para permitir que uma pessoa passe.`,
              );
              ctx.openLocks["l01.behind-house.window"] = true;
              ctx.score += 3;
            },
            cond: (ctx, { value }) => !ctx.openLocks["l01.behind-house.window"] && value == "window",
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
        messages: addMessages({
          prompt: `Clareira\nVocê está numa clareira no meio da floresta. No chão você vê um corpo. Ele parece ter sido alvejado por uma flecha.`,
        }),
        visited: addVisit("clearing"),
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
        grabItem: [
          {
            actions: (ctx) => {
              ctx.messages.push("Você já pegou o livro.");
            },
            cond: (ctx, { value }) => ctx.objects["l01.book"] && value == "book",
          },
          {
            actions: (ctx) => {
              ctx.messages.push("Pego.");
              ctx.inventory.push(ITEMS.book.item);
              ctx.score += 5;
              ctx.objects["l01.book"] = true;
            },
            cond: (ctx, { value }) => !ctx.objects["l01.book"] && value == "book",
          },
        ],
        seeItem: [
          {
            cond: (ctx, { value }) => value == "book",
          },
          {
            actions: (ctx) =>
              ctx.messages.push(
                `Você vê um corpo alvejado por uma flecha. ${
                  ctx.objects["l01.book"] ? "" : "Ele parece estar carregando um livro nos seus braços."
                }`,
              ),
            cond: (ctx, { value }) => value == "body",
          },
        ],
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
        location: "Vista para o Desfiladeiro",
        visited: addVisit("canyon"),
        steps: addSteps,
      }),
      on: {
        ...defaultActions,
        goWest: "east-florest",
        goNorthWest: {
          target: "#l02-tunnel",
          actions: (ctx) => (ctx.score += 4),
        },
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

module.exports = l01;
