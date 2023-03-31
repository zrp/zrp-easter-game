const { assign, raise } = require("xstate");

const { addMessages, addSteps, addVisit, setMessages } = require("../context");
const { ITEMS } = require("../inventory");
const { defaultActions } = require("../actions");

const _ = require("lodash");

const Messages = require("../messages");
const Characters = require("../characters");
const l = require("../../logger");

const brokenGuard = {
  actions: (ctx) => {
    ctx.messages.push("A máquina está quebrada.");
  },
  cond: (ctx) => !!ctx.objects["web.machine"]?.broken,
};

const machineActions = {
  fixItem: {
    actions: (ctx, event) => {
      if (event.value != "machine") return;

      // const item = ctx.inventory.find('');
      const item = null;

      if (item) {
      } else {
        ctx.messages.push("Você não têm as peças para consertar a máquina. Aparentemente há uma bobina faltando.");
      }
    },
  },
  turnOff: [
    brokenGuard,
    {
      actions: assign({
        messages: [
          {
            prompt: `Você desligou a máquina.`,
          },
        ],
        objects: (ctx) => _.merge(ctx.objects, { "web.machine": { state: "off" } }),
      }),
      cond: (ctx) => ctx.objects["web.machine"]?.state == "on",
    },
    {
      actions: assign({
        messages: [{ prompt: `A máquina já está desligada.` }],
      }),
    },
  ],
  turnOn: [
    brokenGuard,
    {
      actions: assign({
        messages: [
          {
            prompt: `Você ligou a máquina. Ao fazê-lo, ela pede que você digite a senha para ativação.`,
          },
        ],
        objects: (ctx) => _.merge(ctx.objects, { "web.machine": { state: "off" } }),
      }),
      cond: (ctx) => ctx.objects["web.machine"]?.state == "on",
    },
    {
      actions: assign({
        messages: [{ prompt: `A máquina já está ligada. Ela pede uma senha de ativação.` }],
      }),
    },
  ],
};

const l04 = {
  id: "l04",
  initial: "web-machine",
  states: {
    "web-machine": {
      entry: assign({
        location: "W'eb / Laboratório",
        messages: (ctx) => [
          `W'eb / Laboratório\nEntre o espaço-tempo você vê imagens amorfas e distantes. Um som estridente passa pela sua cabeça enquanto você sente seu corpo sendo puxado de volta para a realidade. De repente você é cuspido pela máquina de volta ao laboratório, mas não o mesmo laboratório, agora você se encontra no laboratório de Bun, dentro da W'eb.\nA máquina parece ${
            ctx.objects["web.machine"]?.broken ? "quebrada" : "operacional"
          }.`,
        ],
      }),
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
        messages: (ctx) => (ctx.objects["web.lab.door-01"].open ? [] : [`Você vê uma porta de aço. Essa parece ser a saída do laboratório.`]),
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
        messages: (ctx) => [`Você se depara com uma segunda porta. Essa parece ser a verdadeira saída do laboratório, mas a porta parece emperrada.`],
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
          `Você vê os fundos do laboratório. Uma sala grande e relativamente vazia, com uma mesa no canto e um tapete ${
            ctx.objects["web.lab.rug"].open ? "no canto" : "ao centro"
          }. ${ctx.objects["web.lab.rug"].open ? "No meio você vê um alçapão." : ""}`,
        ],
        location: "W'eb / Fundo do Laboratório",
      }),
      on: {
        ...defaultActions,
        goNorth: "web-machine",
        goDown: "#l05",
        seeItem: [
          {
            actions: (ctx) => ctx.messages.push(`A mesa está vazia.`),
            cond: (ctx, e) => e.value === "table",
          },
          {
            actions: (ctx) => ctx.messages.push(`O tapete parece ser de um tecido barato. Você percebe uma leve corrente de ar saindo pelas bordas do tapete.`),
            cond: (ctx, e) => e.value === "rug",
          },
          {
            actions: (ctx) =>
              ctx.messages.push(
                ctx.objects["web.lab.trapdoor"].open
                  ? `O alçapão parece aberto. Você vê a chave do Bun emperrada no buraco da fechadura.`
                  : `O alçapão parece fechado. Você vê um buraco de chave nele.`,
              ),
            cond: (ctx, e) => e.value === "trapdoor",
          },
        ],
        openItem: [
          {
            actions: (ctx) => {
              ctx.messages.push(`Você utiliza a chave que o Bun lhe deu, abrindo o alçapão. A chave emperrou no alçapão. Ela não pode ser retirada.`);
              const index = ctx.inventory.findIndex((i) => i.id === ITEMS.bunKey.id);

              if (index >= 0) ctx.inventory.splice(index, 1);

              ctx.objects["web.lab.trapdoor"].open = true;
            },
            cond: (ctx, e) => e.value === "trapdoor" && !ctx.objects["web.lab.trapdoor"].open,
          },
          {
            actions: (ctx) => {
              ctx.messages.push(`O alçapão já está aberto.`);
            },
            cond: (ctx, e) => e.value === "trapdoor" && ctx.objects["web.lab.trapdoor"].open,
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
  },
};

module.exports = l04;
