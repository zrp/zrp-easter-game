const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit } = require("../context");
const { ITEMS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

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

module.exports = { l02Attic, l02Tunnel };
