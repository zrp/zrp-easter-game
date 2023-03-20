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
  bunNotebook: "l03.diary",
  bunKey: "l03.key",
  bunKeyRuby: "l03.key.ruby",
};

const mailboxNote = createItem("nota", ITEM_IDS.mailboxNote, {
  readable: true,
  description: `Uma nota velha e suja. No canto você vê as iniciais Z, R e P. Ela parece ser legível.`,
  contents: `Nota dos desenvolvedores:\nEste jogo foi desenvolvido pela ZRP, e é um desafio para desenvolvedores, mas qualquer um pode jogar.\nEu espero que esse jogo não seja fácil para você, mas se você nunca jogou ZORK, aqui vai uma dica:\nVocê pode digitar alguns atalhos no terminal, e eles executam ações rápidas e comuns nesse jogo:\n\t• P: exibe seu progresso\n\t• I: mostra seu inventário\n\t• N: vai para o Norte\n\t• S: vai para o Sul\n\t• L: vai para o leste\n\t• O: vai para o Oeste\nVocê pode também usar NE (nordeste), SE (sudeste), SO (sudoeste) e NO (noroeste).\nEspero que se divirta! :)\n@p`,
});

const bunKeyRuby = createItem("rubi", ITEM_IDS.bunKeyRuby, {
  readable: false,
  description: `Uma rubi, de vermelho profundo e brilho opaco. Ele ornava a chave que o Bun lhe entregou.`,
});

const ITEMS = {
  mailboxNote: {
    id: ITEM_IDS.mailboxNote,
    item: mailboxNote,
  },
  bunNotebook: {
    id: ITEM_IDS.bunNotebook,
    item: createItem("diário do Bun", ITEM_IDS.bunNotebook, {
      readable: true,
      description: `Um caderno estranho, ele parece um diário. Na capa você lê "Propriedade de Bun, O Coelho". Ela parece ser legível.`,
      contents: `Diário do Bun\n---------------------------\nA senha do teletransportador jamais deve ser divulgada. Apenas os verdadeiros cidadãos de W'eb devem saber a resposta.\nJá sei, a senha será o nome da primeira pessoa a programar na história.\n- Bun`,
    }),
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
    return `Não há nada para remover deste item.`;
  }
};

module.exports = {
  ITEMS,
  readItem,
  seeItem,
  detachItem,
  item2txt,
};
