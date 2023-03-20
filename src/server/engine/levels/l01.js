const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit } = require("../context");
const { ITEMS } = require("../inventory");
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
            cond: (ctx) => ctx.items[ITEMS.mailboxNote.id],
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
                  (ctx) => {
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
                  (ctx) => {
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
            cond: (ctx) => ctx.openLocks["l01.behind-house.window"],
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

module.exports = l01;
