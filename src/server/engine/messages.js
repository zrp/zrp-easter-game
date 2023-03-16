const Characters = require("./characters");

const Messages = {
  errors: {
    goDirection: {
      prompt: `Você não pode ir para essa direção!`,
    },
    openItem: {
      prompt: `Abrir o que? Não posso abrir algo que eu não sei o que é`,
    },
  },
  actions: {
    grab: {
      prompt: "Pego.",
    },
  },
  startOfGame: {
    intro: {
      prompt: `Bem-vindo ao desafio de páscoa da ZRP!\nEste jogo é um tributo ao jogo interativo ZORK, um jogo baseado em texto e processamento natural de linguagem lançado originalmente em 1977.\nNessa primeira parte o jogo é parecido com o original, você começará no mesmo lugar (A oeste da casa), mas o mapa e os desafios são outros.\nO resto do jogo é totalmente original, e testará sua capacidade lógica e de desenvolvedor!\nVocê está pronto?!`,
    },
    approve: {
      prompt: `Ok! Mas não vá se arrepender...`,
    },
    refuse: {
      prompt: `Não!? Sabe quantos dias demorou para fazer esse jogo? Agora você vai jogar!`,
    },
  },
  westOfHouse: {
    entry: {
      prompt: `Oeste da casa\nVocê está parado em um campo aberto a oeste de uma casa branca, com uma porta da frente fechada.\nHá uma pequena caixa de correio aqui.`,
      who: Characters.NARRATOR,
    },
    mailboxOpen: {
      prompt: "Ao abrir a caixa de correio uma nota é revelada.",
    },
  },
  northOfHouse: {
    entry: {
      prompt: `Norte da Casa\nVocê está de frente para o lado norte de uma casa branca. Não há porta aqui e todas as janelas estão trancadas.`,
      who: Characters.NARRATOR,
    },
  },
  southOfHouse: {
    entry: {
      prompt: `Sul da Casa\nVocê está de frente para o lado sul da casa branca. Não há porta aqui e todas as janelas estão trancadas.`,
      who: Characters.NARRATOR,
    },
  },
  behindHouse: {
    entry: {
      prompt: `Atrás da Casa\nVocê está atrás da casa branca. Um caminho leva à floresta a leste. Num canto da casa há uma pequena janela ligeiramente entreaberta.`,
      who: Characters.NARRATOR,
    },
  },
  eastOfHouse: {},
  eastFlorest: {
    entry: {
      prompt: `Floresta à Leste\nVocê está numa clareira. Você vê uma luz forte vindo do leste.`,
      who: Characters.NARRATOR,
    },
  },
  westFlorest: {
    entry: {
      prompt: `Floresta à Oeste\nVocê vê a entrada para uma floresta escura. É muito escuro para ver passagem alguma.`,
      who: Characters.NARRATOR,
    },
  },
};

module.exports = Messages;
