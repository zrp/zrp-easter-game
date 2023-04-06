const UNITS = {
  NONE: null,
  LITER: "L",
  MASS: "Kg",
};

const ITEM_TYPES = {
  OBJECT: "object",
};

const createItem = (name, id, meta = {}, qty = 1, unit = UNITS.NONE, type = ITEM_TYPES.OBJECT) => {
  const obj = {
    name,
    id,
    type,
    qty,
    unit,
    ...meta,
  };

  return obj;
};

const ITEM_IDS = {
  mailboxNote: "l01.west-of-house.open-mailbox.note",
  tableQuickNote: "l01.quicknote",
  book: "l01.book",
  jewerelyBox: "l01.jewerelyBox",
  jewerelyBoxSapphire: "l01.sapphire",
  bunNotebook: "l03.diary",
  bunKey: "l03.key",
  bunKeyRuby: "l03.key.ruby",
  battery: "l04.battery",
  cuttingTool: "l04.cuttingTool",
  coil: "l06.coil",
};

const mailboxNote = createItem("nota", ITEM_IDS.mailboxNote, {
  readable: true,
  description: `Uma nota velha e suja. No canto você vê as iniciais Z, R e P. Ela parece ser legível.`,
  contents: `Nota dos desenvolvedores:\nEste jogo foi desenvolvido pela ZRP, e é um desafio para desenvolvedores, mas qualquer um pode jogar.\nEle é um tributo ao jogo interativo ZORK, um jogo baseado em texto e processamento natural de linguagem lançado originalmente em 1977.\nNessa primeira parte o jogo é parecido com o original, você começou no mesmo lugar (A oeste da casa), mas o mapa e os desafios são outros.\nO resto do jogo é totalmente original, e testará sua capacidade lógica e de desenvolvedor!\nEu espero que esse jogo não seja fácil para você, mas se você nunca jogou ZORK, aqui vai uma dica:\nVocê pode digitar alguns atalhos no terminal, e eles executam ações rápidas e comuns nesse jogo:\n\t• P: exibe seu progresso\n\t• I: mostra seu inventário\n\t• N: vai para o Norte\n\t• S: vai para o Sul\n\t• L: vai para o leste\n\t• O: vai para o Oeste\nVocê pode também usar NE (nordeste), SE (sudeste), SO (sudoeste) e NO (noroeste).\nEspero que se divirta! :)\n@p`,
});

const book = createItem("livro", ITEM_IDS.book, {
  readable: true,
  description: `Um livro. Ele está sujo, e parece ter sido rasgado. Você consegue ler apenas uma parte dele.`,
  contents: `IV.II.MMXXIII\n-------------------\nRumores do fim tem chegado até mim. Meu amigo Bun, ao que tudo indica, desapareceu. Ele deve ter voltado para a W'eb. Como sempre, ele me pediu para guardar o seu laboratório. Estranhamente, da última vez que o encontrei, ele me pediu para guardar uma caixa de jóias. Eu a coloquei no cofre da casa, mas se os rumores se confirmarem (...). Eu acredito que o Bun entenderia. Outros podem guardar a entrada. Preciso me preparar para o que está por vir.\n-------------------\nNo rodapé você vê escrito: ▲`,
});

const quicknote = createItem("bilhete", ITEM_IDS.tableQuickNote, {
  readable: true,
  description: `Um bilhete. ELe parece ter sido escrito às pressas.`,
  contents: `IV.III.MMXXIII\n-------------------\nTomei conhecimento hoje de uma profecia terrível. Aquele que mais temíamos voltará e tudo será perdido.\nVou-me embora daqui. Existe um caminho ao norte, através da floresta. Poucos conhecem esse caminho, ele é escuro e perigoso, mas é a melhor forma de sair daqui.\nEspero não estar sendo seg\n-------------------\n`,
});

const bunKeyRuby = createItem("rubi", ITEM_IDS.bunKeyRuby, {
  readable: false,
  description: `Uma rubi, de vermelho profundo e brilho opaco. Ele ornava a chave que o Bun lhe entregou.`,
});

const jewerelyBoxSapphire = createItem("safira", ITEM_IDS.jewerelyBoxSapphire, {
  readable: false,
  description: `Uma safira de azul intenso e brilho médio. Ele estava dentro de uma caixa de jóias.`,
});

const battery = createItem("bateria", ITEM_IDS.battery, {
  readable: false,
  description: "Uma bateria de 12V convencional. Ela parece ser parte de um gerador elétrico.",
});

const jewerelyBox = createItem("caixa de jóias", ITEM_IDS.jewerelyBox, {
  readable: false,
  description: "Uma caixa de jóias. Parece haver algo dentro.",
  descriptionEmpty: "Uma caixa de jóias. Ela está vazia.",
  inside: jewerelyBoxSapphire,
  detachMessage: `Você abre a caixa de jóias. Dentro você encontra uma safira.`,
});

const cuttingTool = createItem("ferramenta de corte", ITEM_IDS.cuttingTool, {
  readable: false,
  description: "Uma ferramenta de corte. Ela parece ser útil para cortar metal e outros materiais rígidos.",
});

const coil = createItem("bobina de cristal", ITEM_IDS.coil, {
  readable: false,
  description: "Uma bobina de cristal mágica. De uso único. Pode ser usada para ligar o teletransportador do laboratório do Bun.",
});

const ITEMS = {
  mailboxNote: {
    id: ITEM_IDS.mailboxNote,
    item: mailboxNote,
  },
  quickNote: {
    id: ITEM_IDS.quickNote,
    item: quicknote,
  },
  book: {
    id: ITEM_IDS.book,
    item: book,
  },
  bunNotebook: {
    id: ITEM_IDS.bunNotebook,
    item: createItem("diário do Bun", ITEM_IDS.bunNotebook, {
      readable: true,
      description: `Um caderno estranho, ele parece um diário. Na capa você lê "Propriedade de Bun, O Coelho". Ela parece ser legível.`,
      contents: `Diário do Bun\n---------------------------\nA senha do teletransportador jamais deve ser divulgada. Apenas os verdadeiros cidadãos de W'eb devem saber a resposta.\nAcreditava eu que a profecia seria cumprida, mas já não tenho mais esperanças. Desde os primórdios, eu venho esperando que essa pessoa apareça para nos salvar.\nAinda lembro quando acreditava que seria aquela, a primeira pessoa a programar.\nBom, de qualquer forma, seu nome é uma senha que apenas o escolhido saberia.\n- Bun`,
    }),
  },
  battery: {
    id: ITEM_IDS.battery,
    item: battery,
  },
  jewerelyBox: {
    id: ITEM_IDS.jewerelyBox,
    item: jewerelyBox,
  },
  cuttingTool: {
    id: ITEM_IDS.cuttingTool,
    item: cuttingTool,
  },
  coil: {
    id: ITEM_IDS.coil,
    item: coil,
  },
  bunKey: {
    id: ITEM_IDS.bunKey,
    item: createItem("chave do Bun", ITEM_IDS.bunKey, {
      readable: false,
      description: `Uma chave dourada ornada com um rubi. O rubi parece removível.`,
      descriptionEmpty: `Uma chave dourada. Havia um rubi nela, mas ele foi removido. Aonde ficava o rubi lê-se: 0983`,
      inside: bunKeyRuby,
      detachMessage: `Você faz um pouco de força na chave, mas a cola finalmente cede, revelando o Rubi inteiro na sua mão. Aonde ficava o rubi parece haver algo inscrito.\nPego.`,
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
    return item.descriptionEmpty && !item.inside ? item.descriptionEmpty : item.description;
  } else {
    return `Não é possível ver este item.`;
  }
};

const detachItem = (item) => {
  if (item.inside) {
    const inside = { ...item.inside };
    const newItem = { ...item };
    newItem.inside = null;
    return { inside, message: item.detachMessage, newItem };
  } else {
    return { message: `Não há nada para remover deste item.`, inside: null, newItem: null };
  }
};

module.exports = {
  ITEMS,
  ITEM_IDS,
  readItem,
  seeItem,
  detachItem,
  item2txt,
};
