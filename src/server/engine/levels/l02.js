const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit } = require("../context");
const { ITEMS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

const { getRandomQuestion } = require("../questions");

const l02Attic = {
  id: "l02-attic",
  initial: "entrance",
  states: {
    entrance: {
      entry: assign({
        messages: addMessages([
          {
            prompt: `Sotão\nVocê desce pelas escadas, chegando a um sotão úmido e mofado. Ao leste você vê uma fraca luz passando por uma fresta.`,
          },
        ]),
        location: "Sotão",
        visited: addVisit("l02.attic-entrance"),
        steps: addSteps,
      }),
      on: {
        ...defaultActions,
        goEast: "at-door",
        goUp: "#l01.inside-of-house.kitchen",
        openItem: {
          target: "at-door",
          cond: (_, ev) => ev?.value === "door",
        },
      },
    },
    "at-door": {
      entry: assign({
        messages: addMessages([
          {
            prompt: `Você se aproxima da porta e ouve cochichos ao fundo. Você tenta abrir a porta, mas ela está trancada. Você vê um painel eletrônico ao lado, e acima dele escrito:\n-------------------\nDigite a senha para entrar!\nDica: quanto mais você os dá, mais os deixa pra trás. O que são?\n-------------------`,
          },
        ]),
        steps: addSteps,
        location: "Sotão / Porta",
      }),
      on: {
        ...defaultActions,
        goWest: "entrance",
        type: [
          {
            target: "#l02-boss",
            actions: assign({
              messages: [
                {
                  prompt:
                    'Você digita sua senha. O monitor exibe: "Senha correta!"\nA porta começa a se abrir, mas o painel parece enlouquecer e com uma intensidade alarmante ele começa a pedir novas senhas para você.',
                },
              ],
              score: (ctx) => ctx.score + ctx.openLocks["l02-attic.entrance.door"]?.attemptsRemaining,
              openLocks: (ctx) => _.merge(ctx.openLocks, { "l02-attic.entrance.door": { open: true } }),
            }),
            cond: (context, { value }) => value === "steps",
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
            cond: (context, { value }) => !value || value !== "steps",
          },
        ],
      },
    },
  },
};

const l02Tunnel = {
  id: "l02-tunnel",
  initial: "tunnel-entrance",
  states: {
    "tunnel-entrance": {
      entry: assign({
        messages: addMessages([
          {
            prompt: `Base do Desfiladeiro\nVocê desce a encosta, chegando à base do desfiladeiro. À oeste você vê uma porta, ela parece ser protegida por uma senha. Você parece ver o que são ruínas de uma antiga escavação ao seu lado.`,
          },
        ]),
        location: "Base do Desfiladeiro",
        visited: addVisit("l02.tunnel-entrance"),
        steps: addSteps,
      }),
      on: {
        ...defaultActions,
        goWest: "at-door",
        goUp: "#l01.canyon",
        goSouthEast: "#l01.canyon",
        seeItem: [
          {
            actions: (ctx) =>
              ctx.messages.push(
                `Você vê nas ruínas uma pedra grande. Nela está escrito:\nIV.IV.MMXXIII\n-------------------\nA profecia\nJá não se sabe aonde estão os antigos moradores daquela casa, não deixaram nem um mapa. Ela parece ter sido abandonada às pressas. Dizem que eles tomaram conhecimento de uma profecia, uma profecia terrível.`,
              ),
            cond: (ctx, { value }) => value == "ruins",
          },
        ],
        grabItem: {
          actions: (ctx) => ctx.messages.push("A pedra é muito grande para ser retirada."),
        },
        openItem: {
          target: "open-door",
          cond: (_, ev) => ev?.value === "door",
        },
      },
      states: {
        idle: {},
      },
    },
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
            prompt: `Você se aproxima da porta e ouve cochichos ao fundo. Você vê um painel eletrônico ao lado, e acima dele escrito:\nDigite a senha. Dica:\n-----------------------------------------------\nMaria tem 4 filhas, e cada filha tem um irmão. Quantos filhos maria possui?\n-----------------------------------------------\n`,
          },
        ]),
        steps: addSteps,
        location: "Base do Desfiladeiro / Porta",
      }),
      on: {
        ...defaultActions,
        goEast: "tunnel-entrance",
        refuse: {
          actions: assign({
            messages: [
              {
                prompt: 'A porta parece te encarar como se dissese: "Já desistindo?!"',
              },
            ],
          }),
        },
        type: [
          {
            target: "#l02-boss",
            actions: (ctx) => {
              ctx.messages.push(
                'Você digita a senha. O monitor exibe: "Senha correta!".\nA porta começa a se abrir, mas o painel parece enlouquecer e com uma intensidade alarmante ele começa a pedir novas senhas para você.',
              );
              ctx.score = ctx.score + ctx.openLocks["l02-tunnel.entrance.door"].attemptsRemaining;
              ctx.openLocks["l02-tunnel.entrance.door"] = true;
            },
            cond: (context, e) => !!e.value.match("5"),
          },
          {
            target: "#game.game-over",
            actions: (ctx) => {
              ctx.messages.push(
                "Você digita sua senha. O monitor exibe:\nLimite de tentativas excedido, autodestruição em\n3...\n2...\n1...\nVocê vê uma fumaça preta sair da tranca. Não há mais nada que você possa fazer.",
              );
            },
            cond: (context, { value }) => context.openLocks["l02-tunnel.entrance.door"].attemptsRemaining === 1,
          },
          {
            actions: (ctx) => {
              ctx.openLocks["l02-tunnel.entrance.door"].attemptsRemaining -= 1;
              ctx.messages.push(
                `Você digita sua senha. O monitor exibe: "Senha incorreta! Tentativas restantes: ${ctx.openLocks["l02-tunnel.entrance.door"]?.attemptsRemaining}"`,
              );
            },
          },
        ],
      },
    },
  },
};

const l02Boss = {
  id: "l02-boss",
  initial: "idle",
  states: {
    idle: {
      after: {
        2000: "battle",
      },
    },
    gg: {
      after: {
        2000: "#game.game-over",
      },
    },
    battle: {
      entry: (ctx) => {
        ctx.currentQuestion = getRandomQuestion(ctx.questions);
        ctx.questions.push(ctx.currentQuestion.id);
      },
      on: {
        testAnswer: [
          {
            target: "#l03",
            actions: (ctx, event) => {
              if (ctx.currentQuestion.answer === event.answer) {
                ctx.messages.push(`O painel responde: R̶e̵s̶p̸o̷s̴t̵a̷ ̵c̸o̵r̴r̴e̶t̸a̸`);
                ctx.score += 8;
              } else {
                ctx.messages.push(`O painel responde: R̵e̴s̵p̴o̷s̸t̷a̵ ̸i̵n̸c̶o̶r̸r̵e̵t̸a̵,̶ ̸t̴e̶n̵t̴e̵ ̴n̵o̸v̴a̶m̴e̴n̶t̷e̷!̷`);
              }

              ctx.currentQuestion = null;
              ctx.messages.push("De alguma forma mágica a porta aceita suas respostas e cede, dando passagem para você.");
            },
            cond: (ctx) => ctx.questions.length >= 5 && ctx.score >= 30,
          },
          {
            target: "gg",
            actions: (ctx, event) => {
              if (ctx.currentQuestion.answer === event.answer) {
                ctx.messages.push(`O painel responde: R̶e̵s̶p̸o̷s̴t̵a̷ ̵c̸o̵r̴r̴e̶t̸a̸`);
                ctx.score += 8;
              } else {
                ctx.messages.push(`O painel responde: R̵e̴s̵p̴o̷s̸t̷a̵ ̸i̵n̸c̶o̶r̸r̵e̵t̸a̵,̶ ̸t̴e̶n̵t̴e̵ ̴n̵o̸v̴a̶m̴e̴n̶t̷e̷!̷`);
              }

              ctx.messages.push(
                "A porta começa a fazer um barulho intenso, aparentemente ela não ficou satisfeita com as suas respostas. Você ouve um barulho de 'tick' vindo dela. É melhor correr.\ntick\ntick\ntick\nbooooooooom!",
              );
            },
            cond: (ctx) => ctx.questions.length >= 5 && ctx.score < 30,
          },
          {
            target: "battle",
            actions: (ctx, event) => {
              if (ctx.currentQuestion.answer === event.answer) {
                ctx.messages.push(`O painel responde: R̶e̵s̶p̸o̷s̴t̵a̷ ̵c̸o̵r̴r̴e̶t̸a̸`);
                ctx.score += 8;
              } else {
                ctx.messages.push(`O painel responde: R̵e̴s̵p̴o̷s̸t̷a̵ ̸i̵n̸c̶o̶r̸r̵e̵t̸a̵,̶ ̸t̴e̶n̵t̴e̵ ̴n̵o̸v̴a̶m̴e̴n̶t̷e̷!̷`);
              }
            },
          },
        ],
      },
    },
  },
};

module.exports = { l02Attic, l02Tunnel, l02Boss };
