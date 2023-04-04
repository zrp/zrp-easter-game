const { ITEMS, ITEM_IDS } = require("../inventory");
const { defaultActions } = require("../actions");

const Characters = require("../characters");

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
  turnOff: [brokenGuard],
  turnOn: [brokenGuard],
};

const l04 = {
  id: "l04",
  initial: "idle",
  states: {
    idle: {
      entry: (ctx) =>
        ctx.messages.push(
          "Entre o espaço-tempo você vê imagens amorfas e distantes. Um som estridente passa pela sua cabeça enquanto você sente seu corpo sendo puxado de volta para a realidade. Parece ser a sua própria voz.\nDe repente você se vê de volta ao laboratório, mas algo está diferente. Você sente que o ar não é real, que o calor não é real, e que seu corpo não é mais o seu corpo. Você está dentro da W'eb.",
        ),
      after: {
        4000: "web-machine",
      },
    },
    "web-machine": {
      entry: nextState(
        (ctx) =>
          `W'eb / Laboratório\nVocê está no meio do laboratório.\nO teletransportador parece ${
            ctx.objects["web.machine"]?.broken ? "quebrado" : "operacional"
          }.`,
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
      entry: nextState(
        `Você vê uma lousa imensa na parede norte. Ela parece conter algumas fórmulas.`,
        "W'eb / Laboratório (Sala de Estudos)",
      ),
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
      entry: (ctx) => {
        ctx.location = "W'eb / Laboratório (Saída Leste)";
        ctx.steps += 1;
        if (!ctx.objects["web.lab.door-01"].open) {
          ctx.messages.push(`Você vê uma porta de aço. Essa parece ser a saída do laboratório.`);
        }
      },
      always: [{ target: "lab-east-2", cond: (ctx) => ctx.objects["web.lab.door-01"].open }],
      on: {
        ...defaultActions,
        goWest: "web-machine",
        type: [
          {
            target: "lab-east-2",
            actions: (ctx) => {
              ctx.messages.push(`Senha válida`);
              ctx.score += 10;
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
      entry: (ctx) =>
        ctx.messages.push(
          `Você se depara com uma segunda porta. Essa parece ser a verdadeira saída do laboratório, mas a porta parece emperrada.`,
        ),
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
      entry: nextState(
        (ctx) =>
          `Você vê os fundos do laboratório. Uma sala grande e relativamente vazia, com ${
            ctx.objects["web.lab.rug"].open ? "uma mesa e tapete no canto" : "uma mesa no canto e um tapete ao centro"
          }. ${ctx.objects["web.lab.rug"].open ? "No meio você vê um alçapão." : ""}`,
        "W'eb / Fundo do Laboratório",
      ),
      on: {
        ...defaultActions,
        goNorth: "web-machine",
        goDown: [
          { target: "underground", cond: (ctx) => ctx.objects["web.lab.trapdoor"].open },
          {
            actions: (ctx) => ctx.messages.push("O alçapão está fechado. Você vê um buraco de fechadura no alçapão."),
            cond: (ctx) => !ctx.objects["web.lab.trapdoor"].open && ctx.objects["web.lab.rug"].open,
          },
          { actions: (ctx) => ctx.messages.push("Descer para onde?") },
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
              ctx.messages.push(
                `Você utiliza a chave que o Bun lhe deu, abrindo o alçapão. A chave emperrou no alçapão. Ela não pode ser retirada.`,
              );
              const index = ctx.inventory.findIndex((i) => i.id === ITEMS.bunKey.id);

              if (index >= 0) ctx.inventory.splice(index, 1);

              ctx.score += 5;
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
              ctx.score += 5;
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
              ctx.score += 5;
            },
            cond: (ctx, e) => e.value === "rug" && !ctx.objects["web.lab.rug"].open,
          },
        ],
      },
    },
    underground: {
      id: "underground",
      initial: "stairs",
      entry: (ctx) => ctx.messages.push("Você desce as escadas, chegando no que parece ser uma antiga parte do laboratório."),
      states: {
        stairs: {
          entry: nextState(
            "1º Subsolo / Escadas\nVocê vê um corredor ao leste e outro ao sul. Ao seu lado você vê uma escada que dá para o laboratório.",
            "1º Subsolo / Escadas",
          ),
          on: {
            ...defaultActions,
            // Go up only if latch is open
            goUp: [{ target: "#l04.lab-south" }],
            goEast: "stairs-east",
            goSouth: "stairs-south",
          },
        },
        "stairs-east": {
          entry: nextState(
            (ctx) =>
              `1º Subsolo / Escadas (Leste)\nVocê se encontra no corredor ao leste das escadas.${
                ctx.openLocks["l04.lights"] == "off" ? " Ele parece ficar cada vez mais escuro." : ""
              } Você vê um interruptor ao seu lado.`,
            "1º Subsolo / Escadas (Leste)",
          ),
          on: {
            ...defaultActions,
            goWest: "stairs",
            turnOn: [
              {
                actions: (ctx) => ctx.messages.push("As luzes já estão acessas."),
                cond: (ctx) => ctx.l04.powerRestored && ctx.openLocks["l04.lights"] === "on",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("As luzes se acendem.");
                  ctx.openLocks["l04.lights"] = "on";
                },
                cond: (ctx) => ctx.l04.powerRestored && ctx.openLocks["l04.lights"] === "off",
              },
              {
                actions: (ctx) => ctx.messages.push("Parece que não há energia! O interruptor segue desligado."),
                cond: (ctx, { value }) => value === "lights",
              },
              {
                actions: (ctx) => ctx.messages.push("Ligar o que exatamente?"),
              },
            ],
            turnOff: [
              {
                actions: (ctx) => ctx.messages.push("As luzes já estão apagadas."),
                cond: (ctx) => ctx.l04.powerRestored && ctx.openLocks["l04.lights"] === "off",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("As luzes se apagam.");
                  ctx.openLocks["l04.lights"] = "off";
                },
                cond: (ctx) => ctx.l04.powerRestored && ctx.openLocks["l04.lights"] === "on",
              },
              {
                actions: (ctx) => ctx.messages.push("Parece que não há energia! O interruptor segue desligado."),
                cond: (ctx, { value }) => value === "lights",
              },
              {
                actions: (ctx) => ctx.messages.push("Desligar o que exatamente?"),
              },
            ],
            goEast: [
              {
                target: "warehouse-east",
                cond: (ctx) => ctx.l04.powerRestored && ctx.openLocks["l04.lights"] == "on",
              },
              {
                actions: (ctx) => ctx.messages.push("É muito escuro para ver o caminho."),
              },
            ],
          },
        },
        "stairs-south": {
          entry: nextState(
            "1º Subsolo / Escadas (Sul)\nVocê vê um corredor para o leste e outro para o sul. A entrada é para o norte. Você ouve um barulho vindo do corredor leste.",
            "1º Subsolo / Escadas (Sul)",
          ),
          on: {
            ...defaultActions,
            goNorth: "stairs",
            goSouth: "warehouse-south",
            goEast: "corridor-east",
          },
        },
        "warehouse-east": {
          entry: nextState(
            "1º Subsolo / Almoxarifado Leste\nVocê vê uma parede aonde ficavam ferramentas. Você vê uma ferramenta de corte. Ela parece pegável.",
            "1º Subsolo / Almoxarifado Leste",
          ),
          on: {
            ...defaultActions,
            goWest: "stairs-east",
            seeItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push("Você vê uma ferramenta de corte. Ela parece ser útil para cortar metal.");
                },
                cond: (ctx, { value }) => !ctx.items[ITEM_IDS.cuttingTool] && value == "cuttingTool",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("Você vê a parede. Ela parece ser um típico painel organizador, nada demais.");
                },
                cond: (ctx, { value }) => value == "wall",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("Ver o que?!");
                },
                cond: (ctx, { value }) => value != "cuttingTool",
              },
            ],
            grabItem: [
              {
                actions: (ctx) => ctx.messages.push("Você já pegou a ferramenta de corte."),
                cond: (ctx) => ctx.items[ITEM_IDS.cuttingTool],
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("Pego.");
                  ctx.score += 5;
                  ctx.items[ITEM_IDS.cuttingTool] = true;
                  ctx.inventory.push(ITEMS.cuttingTool.item);
                },
                cond: (ctx, { value }) => value == "cuttingTool",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("Você realmente está tentando pegar a parede? E aonde você vai por ela exatamente?!?!");
                },
                cond: (ctx, { value }) => value == "wall",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("O que você está tentando pegar?!");
                },
              },
            ],
          },
        },
        "warehouse-south": {
          entry: nextState(
            (ctx) =>
              `1º Subsolo / Almoxarifado Sul\nVocê vê uma mesa. Ela parece ser uma bancada de trabalho. ${
                ctx.items[ITEMS.battery.id] ? "Ela está vazia" : "Sob a mesa você vê uma bateria"
              }.`,
            "1º Subsolo / Almoxarifado Sul",
          ),
          on: {
            ...defaultActions,
            goNorth: "stairs-south",
            seeItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push("Você vê uma bateria. Ela parece ter sido retirada para manutenção.");
                },
                cond: (ctx, { value }) => !ctx.items[ITEMS.battery.id] && value == "battery",
              },
              {
                actions: (ctx) => {
                  const grabbed = ctx.items[ITEMS.battery.id];
                  ctx.messages.push(
                    `Você vê uma mesa de metal. Ela parece ser uma bancada de trabalho.${grabbed ? "" : " Encima dela há uma bateria."}`,
                  );
                },
                cond: (ctx, { value }) => value == "table",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("Ver o que?!");
                },
                cond: (ctx, { value }) => value != "battery",
              },
            ],
            grabItem: [
              {
                actions: (ctx) => ctx.messages.push("Você já pegou a bateria."),
                cond: (ctx, { value }) => ctx.items[ITEMS.battery.id] && value == "battery",
              },
              {
                actions: (ctx) => {
                  ctx.items[ITEMS.battery.id] = true;
                  ctx.inventory.push(ITEMS.battery.item);
                  ctx.score += 5;
                  ctx.messages.push("Pego.");
                },
                cond: (ctx, { value }) => value == "battery",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push('Essa é nova! "Pegar uma mesa" kkk');
                },
                cond: (ctx, { value }) => value == "table",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("O que você está tentando pegar?!");
                },
              },
            ],
          },
        },
        "corridor-east": {
          entry: nextState(
            (ctx) =>
              `1º Subsolo / Corredor Leste\nVocê se encontra no corredor leste. O barulho estranho continua vindo do leste, parece algo metálico batendo. Ao sul você vê uma porta. Ela parece ${
                ctx.openLocks["l04.energy-room"] ? "aberta" : "fechada"
              }. A entrada fica à oeste.`,
            "1º Subsolo / Corredor Leste",
          ),
          on: {
            ...defaultActions,
            goWest: "stairs-south",
            goEast: "lock-room",
            goSouth: [
              { target: "energy-room", cond: (ctx) => ctx.openLocks["l04.energy-room"] },
              { actions: (ctx) => ctx.messages.push("A porta parece fechada.") },
            ],
            openItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push(`A porta ainda está aberta (mas da janela já não entra luz).`);
                  ctx.openLocks["l04.energy-room"] = true;
                },
                cond: (ctx, { value }) => ctx.openLocks["l04.energy-room"] && value == "door",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(`Você abriu a porta.`);
                  ctx.score += 2;
                  ctx.openLocks["l04.energy-room"] = true;
                },
                cond: (ctx, { value }) => value == "door",
              },
              { actions: (ctx) => ctx.messages.push("Você está tentando abrir o que exatamente?") },
            ],
          },
        },
        "energy-room": {
          entry: nextState(
            (ctx) =>
              `1º Subsolo / Sala do Gerador\nVocê entra na sala e vê um grande gerador ao fundo. Ele parece ${
                ctx.l04.powerRestored ? "ligado" : "desligado"
              }. ${ctx.openLocks["l04.generatorHasBattery"] ? "" : "Parece que está faltando uma bateria."}`,
            "1º Subsolo / Sala do Gerador",
          ),
          on: {
            ...defaultActions,
            goNorth: "corridor-east",
            turnOn: [
              {
                actions: (ctx) => ctx.messages.push("O gerador já está ligado!"),
                cond: (ctx) => ctx.openLocks["l04.generator"],
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("O gerador foi ligado! Você ouve um click vindo do corredor (as luzes devem ter sido restauradas).");
                  ctx.openLocks["l04.generator"] = true;
                  ctx.l04.powerRestored = true;
                },
                cond: (ctx, { value }) => value === "generator" && ctx.openLocks["l04.generatorHasBattery"],
              },
              {
                actions: (ctx) => ctx.messages.push("Ligar o que exatamente?"),
              },
            ],
            turnOff: [
              {
                actions: (ctx) => ctx.messages.push("O gerador já está desligado!"),
                cond: (ctx) => !ctx.openLocks["l04.generator"],
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("O gerador foi desligado! Você ouve um click vindo do corredor (as luzes devem ter sido desligadas).");
                  ctx.openLocks["l04.generator"] = false;
                  ctx.l04.powerRestored = false;
                },
                cond: (ctx, { value }) => value === "generator" && ctx.openLocks["l04.generatorHasBattery"],
              },
              {
                actions: (ctx) => ctx.messages.push("Desligar o que exatamente?"),
              },
            ],
            putItem: [
              {
                actions: (ctx) => ctx.messages.push(`Esse gerador já possui uma bateria instalada. Ela parece estar com 95% de carga.`),
                cond: (ctx) => ctx.openLocks["l04.generatorHasBattery"],
              },
              {
                actions: (ctx) => {
                  const index = ctx.inventory.findIndex((i) => i.id === ITEM_IDS.battery);
                  ctx.inventory.splice(index, 1);
                  ctx.score += 7;
                  ctx.openLocks["l04.generatorHasBattery"] = true;
                  ctx.messages.push("Você colocou a bateria no gerador. Ela parece travada no lugar. Você não conseguirá mais retirá-la.");
                },
                cond: (ctx, { value }) => ctx.inventory.findIndex((i) => i.id === ITEM_IDS.battery) >= 0 && value == "battery",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push(
                    `Você vê escrito no equipamento:\n--------------------------\nInsira aqui uma bateria de 12V (+/-). O uso de uma bateria irregular pode danificar o equipamento.\n--------------------------`,
                  );
                },
              },
            ],
            seeItem: [
              {
                actions: (ctx) => {
                  ctx.messages.push(
                    `Você vê um gerador. Ele parece estar ${ctx.openLocks["l04.generator"] ? "ligado" : "desligado"}. ${
                      ctx.openLocks["l04.generatorHasBattery"] ? "Ele tem uma bateria instalada." : "Ele parece ter uma bateria faltando."
                    }`,
                  );
                },
                cond: (ctx, { value }) => value == "generator",
              },
              {
                actions: (ctx) => {
                  ctx.messages.push("Ver o que exatamente?!");
                },
              },
            ],
          },
        },
        "lock-room": {
          entry: nextState(
            (ctx) =>
              `1º Subsolo / Vestiário\nVocê está no vestiário. Você vê diferentes armários${
                ctx.l04.lockerOpen
                  ? "."
                  : ", todos fechados. Você vê um dos armários batendo contra uma correia de metal. Ela parece muito dura para abrir com as mãos."
              }`,
            "1º Subsolo / Vestiário",
          ),
          on: {
            ...defaultActions,
            goWest: "corridor-east",
            openItem: [
              {
                actions: (ctx) => ctx.messages.push("O armário já está aberto e você já encontrou o verdadeiro Bun."),
                cond: (ctx, { value }) => ctx.l04.lockerOpen && value === "locker",
              },
              {
                target: "#l05",
                actions: (ctx) => {
                  ctx.score += 10;
                  ctx.messages.push(
                    "Você pega a sua ferramenta de corte, posicionando a correia entre seus dentes. Depois de fazer muita força, a correia parece ceder e quebrar no meio.\nNisso salta um coelho em direção a você, derrubando-o no chão.",
                  );
                  ctx.messages.push({ prompt: "Aaaaaaah! Você me salvou, muito obrigado.", who: Characters.BUN_UNKNOWN });
                  ctx.messages.push({ prompt: "Eu te conheço!!?", who: Characters.PLAYER });
                  ctx.messages.push({
                    prompt:
                      "Como você me conhece?! Eu sou o Bun, responsável pela segurança da páscoa todos os anos. Eu estava me preparando para ir para o seu mundo, mas um homem de capuz preto me prendeu aqui e roubou os ovos.",
                    who: Characters.BUN,
                  });
                  ctx.messages.push({ prompt: "Como isso é possível? Eu acabei de falar com você (...)", who: Characters.PLAYER });
                  ctx.messages.push({
                    prompt:
                      "Oooooooooooh não! Se aquele impostor já chegou no seu mundo (...)\nPrecisamos ser rápidos, temos que voltar antes que ele descubra como escapar do meu laboratório. Mas como sei que posso confiar em você?",
                    who: Characters.BUN,
                  });
                  ctx.messages.push({ prompt: "Me pergunte o que quiser!", who: Characters.PLAYER });
                  ctx.messages.push({
                    prompt: "Ok! Só o desenvolvedor da profecia saberia responder as perguntas que lhe farei.",
                    who: Characters.BUN,
                  });

                  ctx.l04.lockerOpen = true;
                },
                cond: (ctx, { value }) => ctx.inventory.findIndex((i) => i.id === ITEM_IDS.cuttingTool) >= 0 && value === "locker",
              },
              {
                actions: (ctx) => ctx.messages.push("Você tenta abrir o armário, mas a correia é muito resistente. Ela não cede."),
                cond: (ctx, { value }) => value === "locker",
              },
            ],
            seeItem: [
              {
                actions: (ctx) =>
                  ctx.messages.push(
                    ctx.l04.lockerOpen
                      ? "O armário está aberto."
                      : "O armário está fechado por uma correia metálica. Ela parece muito dura para ser aberta com as mãos.",
                  ),
                cond: (ctx, { value }) => value === "locker",
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = l04;
