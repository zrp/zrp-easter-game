const { assign, raise } = require("xstate");

const { ITEMS, ITEM_IDS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");
const { choose } = require("xstate/lib/actions");
const { addSteps } = require("../context");

const nextState = (messageOrFn = "", location = null, score = 0) => {
  return (ctx) => {
    ctx.messages.push(typeof messageOrFn == "function" ? messageOrFn(ctx) : messageOrFn);
    if (location) ctx.location = location;
    if (score > 0) ctx.score += score;
    ctx.steps += 1;
  };
};

const brokenGuard = {
  actions: (ctx) => {
    ctx.messages.push("A máquina está quebrada.");
  },
  cond: (ctx) => !!ctx.objects["web.machine"]?.broken,
};

const machineActions = {
  enterLocation: [
    {
      actions: (ctx) => {
        ctx.score += 5;
      },
      target: "#l07",
      cond: (ctx, { value }) => value == "machine",
    },
  ],
  fixItem: {
    actions: (ctx, event) => {
      if (event.value != "machine") return;

      if (!ctx.objects["web.machine"].broken) {
        ctx.messages.push("A máquina já foi consertada.");
        return;
      }

      const index = ctx.inventory.findIndex((i) => i.id === ITEMS.coil.id);

      if (index >= 0) {
        ctx.messages.push("Você encaixa a bobina no teletransportador.");
        ctx.inventory.splice(index, 1);
        ctx.objects["web.machine"].broken = false;
        ctx.score += 5;
      } else {
        ctx.messages.push("Você não têm as peças para consertar a máquina. Aparentemente há uma bobina faltando.");
      }
    },
  },
  putItem: [
    {
      actions: (ctx, event) => {
        if (!ctx.objects["web.machine"].broken) {
          ctx.messages.push("A máquina já foi consertada.");
          return;
        }

        const index = ctx.inventory.findIndex((i) => i.id === ITEMS.coil.id);

        if (index >= 0) {
          ctx.messages.push("Você encaixa a bobina no teletransportador.");
          ctx.inventory.splice(index, 1);
          ctx.objects["web.machine"].broken = false;
          ctx.score += 5;
        } else {
          ctx.messages.push("Você não têm as peças para consertar a máquina. Aparentemente há uma bobina faltando.");
        }
      },
      cond: (ctx, { value }) => value == "coil" || value == "machine",
    },
  ],
  turnOff: [
    brokenGuard,
    {
      actions: (ctx) => {
        ctx.objects["web.machine"].state = "off";
        ctx.messages.push(`Você desligou a máquina.`);
      },
      cond: (ctx) => ctx.objects["web.machine"]?.state == "on",
    },
    {
      actions: (ctx) => ctx.messages.push("A máquina já está desligada."),
      cond: (ctx, { value }) => value == "machine",
    },
  ],
  turnOn: [
    brokenGuard,
    {
      actions: (ctx) => {
        ctx.objects["web.machine"].state = "on";
        ctx.messages.push(`Você ligou a máquina.`);
        ctx.messages.push({ prompt: "Quando estiver pronto para irmos, é só entrar na máquina.", who: Characters.BUN });
      },
      cond: (ctx) => ctx.objects["web.machine"]?.state == "off",
    },
    {
      actions: (ctx) => ctx.messages.push("A máquina já está ligada."),
      cond: (ctx, { value }) => value == "machine",
    },
  ],
};

const l06 = {
  id: "l06",
  initial: "idle",
  states: {
    idle: {
      entry: (ctx) => {
        ctx.messages.push("Enquanto vocês conversavam, um vulto rapidamente fecha a porta do vestiário, trancando-os.");
        ctx.messages.push({ prompt: "Deve ser o impostor! Rápido, temos que ir atrás dele.", who: Characters.BUN });
        ctx.messages.push("Ao fundo apenas ecoa uma risada maléfica e o barulho de passos cada vez mais distantes.");
      },
      after: {
        4000: "lock-room",
      },
    },
    "web-machine": {
      entry: nextState(
        (ctx) =>
          `W'eb / Laboratório\nVocê está no meio do laboratório.\nO teletransportador parece ${
            ctx.objects["web.machine"]?.broken ? "quebrado" : "operacional"
          }. Parece estar faltando uma bobina.`,
        "W'eb / Laboratório",
      ),
      on: {
        ...defaultActions,
        ...machineActions,
        goNorth: "lab-north",
        goEast: "lab-east",
        goSouth: "lab-south",
      },
    },
    "lab-north": {
      entry: assign({
        messages: [`Você vê uma lousa imensa na parede norte. Ela parece conter algumas fórmulas.`],
      }),
      on: {
        ...defaultActions,
        seeItem: {
          actions: (ctx) => {
            ctx.messages.push(`Você vê escrito no canto inferior esquerdo:\n-----------------\n↓↓↓`);
          },
          cond: (ctx, { value }) => value === "board",
        },
        goEast: "lab-east",
        goWest: "web-machine",
        goSouth: "lab-south",
      },
    },
    "lab-east": {
      entry: assign({
        messages: (ctx) =>
          ctx.objects["web.lab.door-01"].open ? [] : [`Você vê uma porta de aço. Essa parece ser a saída do laboratório.`],
      }),
      always: [{ target: "lab-east-2", cond: (ctx) => ctx.objects["web.lab.door-01"].open }],
      on: {
        ...defaultActions,
        goWest: "web-machine",
        type: [
          {
            target: "lab-east-2",
            actions: (ctx) => {
              ctx.messages.push(`Senha válida`);
              ctx.objects["web.lab.door-01"].open = true;
            },
            cond: (ctx, e) => !!e.value.match("0983"),
          },
          {
            actions: (ctx) => ctx.messages.push(`Senha inválida`),
            cond: (ctx, e) => !e.value.match("0983"),
          },
        ],
        openItem: [
          {
            actions: (ctx) => ctx.messages.push(`A porta está protegida por uma senha de 4 digítos.`),
            cond: (ctx, event) => event.value === "door",
          },
        ],
      },
    },
    "lab-east-2": {
      entry: assign({
        messages: (ctx) => [
          `Você se depara com uma segunda porta. Essa parece ser a verdadeira saída do laboratório, mas a porta parece emperrada.`,
        ],
      }),
      on: {
        ...defaultActions,
        goWest: "web-machine",
        type: {
          actions: (ctx) => ctx.messages.push(`O painel da porta parece queimado.`),
        },
        openItem: [
          {
            actions: (ctx) => ctx.messages.push(`A porta parece emperrada.`),
            cond: (ctx, event) => event.value === "door",
          },
        ],
      },
    },
    "lab-south": {
      entry: assign({
        messages: (ctx) => [
          `W'eb / Fundo do Laboratório\nVocê vê os fundos do laboratório. Uma sala grande e relativamente vazia, com ${
            ctx.objects["web.lab.rug"].open ? "uma mesa e tapete no canto" : "uma mesa no canto e um tapete ao centro"
          }. ${ctx.objects["web.lab.rug"].open ? "No meio você vê um alçapão." : ""}`,
        ],
        location: "W'eb / Fundo do Laboratório",
      }),
      on: {
        ...defaultActions,
        goNorth: "web-machine",
        goDown: [
          {
            actions: (ctx) => ctx.messages.push("O alçapão está fechado. Ele deve ter sido trancado pelo impostor!"),
          },
        ],
        seeItem: [
          {
            actions: (ctx) => ctx.messages.push(`A mesa está vazia.`),
            cond: (ctx, e) => e.value === "table",
          },
          {
            actions: (ctx) =>
              ctx.messages.push(
                `O tapete parece ser de um tecido barato. Você percebe uma leve corrente de ar saindo pelas bordas do tapete.`,
              ),
            cond: (ctx, e) => e.value === "rug",
          },
          {
            actions: (ctx) =>
              ctx.messages.push(`O alçapão parece fechado. A tranca parece quebrada. Ele deve ter sido trancado pelo impostor!`),
            cond: (ctx, e) => e.value === "trapdoor",
          },
        ],
        openItem: [
          {
            actions: (ctx) => {
              ctx.messages.push("Não é mais possível abrir o alçapão. O impostor quebrou a tranca.");
            },
            cond: (ctx, e) => e.value === "trapdoor",
          },
        ],
        pull: [
          {
            actions: (ctx) => ctx.messages.push(`Você já retirou o tapete.`),
            cond: (ctx, e) => e.value === "rug" && ctx.objects["web.lab.rug"].open,
          },
          {
            actions: (ctx) => {
              ctx.messages.push(`Você puxou o tapete, revelando um alçapão.`);
              ctx.objects["web.lab.rug"].open = true;
            },
            cond: (ctx, e) => e.value === "rug" && !ctx.objects["web.lab.rug"].open,
          },
        ],
        push: [
          {
            actions: (ctx) => ctx.messages.push(`Você já empurrou o tapete.`),
            cond: (ctx, e) => e.value === "rug" && ctx.objects["web.lab.rug"].open,
          },
          {
            actions: (ctx) => {
              ctx.messages.push(`Você empurrou o tapete, revelando um alçapão.`);
              ctx.objects["web.lab.rug"].open = true;
            },
            cond: (ctx, e) => e.value === "rug" && !ctx.objects["web.lab.rug"].open,
          },
        ],
      },
    },
    "lock-room": {
      entry: nextState(
        (ctx) =>
          `1º Subsolo / Vestiário\nVocê está no vestiário. Você vê diferentes armários${
            ctx.l06.hasCoil ? "." : ", no armário aonde estava Bun, você vê um objeto brilhando."
          }`,
        "1º Subsolo / Vestiário",
      ),
      exit: (ctx) => {
        ctx.messages.push(
          "Vocês fazem uma força para subir, mas conseguem entrar na ventilação. Ela parece dar diretamente no andar de cima.",
        );
      },
      on: {
        ...defaultActions,
        goWest: {
          actions: (ctx) => ctx.messages.push("Você tenta abrir a porta, mas sem sucesso. Ela parece trancada por fora."),
        },
        goUp: [
          {
            target: "lab-south",
            actions: (ctx) => {
              ctx.steps += 1;
              ctx.score += 3;
            },
            cond: (ctx) => ctx.l06.hasCoil,
          },
          {
            actions: (ctx) =>
              ctx.messages.push({
                prompt:
                  "Espere! Acho que vi algo no armário. Sim, é uma bobina de cristal do teletransportador. Ela deve ter caído do meu bolso.",
                who: Characters.BUN,
              }),
          },
        ],
        grabItem: [
          {
            actions: (ctx) => {
              ctx.messages.push("Você já pegou esse item.");
            },
            cond: (ctx, { value }) => ctx.l06.hasCoil && value == "coil",
          },
          {
            actions: (ctx) => {
              ctx.messages.push("Pego.");
              ctx.messages.push({
                prompt: "Aaaaah, essa bobina é do teletransportador. Ela deve ter caído do meu bolso quando ele me jogou no armário.",
                who: Characters.BUN,
              });
              ctx.inventory.push(ITEMS.coil.item);
              ctx.l06.hasCoil = true;
              ctx.score += 5;
            },
            cond: (ctx, { value }) => !ctx.l06.hasCoil && value == "coil",
          },
        ],
        openItem: [
          {
            actions: (ctx) => ctx.messages.push("O armário já está aberto."),
            cond: (ctx, { value }) => value === "locker",
          },
          {
            actions: (ctx) => {
              ctx.messages.push("Você tenta abrir a porta, mas sem sucesso. Ela parece trancada por fora.");
              ctx.messages.push({ prompt: "Podemos tentar subir e ir pela ventilação para o andar de cima.", who: Characters.BUN });
            },
            cond: (ctx, { value }) => ctx.l06.hasCoil && value === "door",
          },
          {
            actions: (ctx) => ctx.messages.push("Você tenta abrir a porta, mas sem sucesso. Ela parece trancada por fora."),
            cond: (ctx, { value }) => value === "door",
          },
        ],
        seeItem: [
          {
            actions: (ctx) => ctx.messages.push(`Ao se aproximar do armário, aquele objeto brilhante se revela. Parece uma bobina.`),
            cond: (ctx, { value }) => value === "locker",
          },
          {
            actions: (ctx) => ctx.messages.push(`Apenas uma porta de metal comum. Ela está trancada.`),
            cond: (ctx, { value }) => value === "door",
          },

          {
            actions: (ctx) =>
              ctx.messages.push(
                `Você vê uma bobina. No centro dela, um pedaço de cristal brilhante. Ela parece ser parte de alguma máquina.`,
              ),
            cond: (ctx, { value }) => !ctx.l06.hasCoil && value === "coil",
          },
        ],
      },
    },
  },
};

module.exports = l06;
