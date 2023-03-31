const questions = [
  {
    id: 1,
    question:
      "Para retornar múltiplos itens em uma função render de um componente React é necessário encapsular o retorno de todos os itens em uma única saída e por isso existe o Fragment, que irá se comportar da seguinte forma:",
    answer: "Irá adicionar somente os itens internos ao DOM sem nenhum encapsulamento.",
    options: [
      "Encapsular todos em uma div para manter a semântica do HTML.",
      "Encapsular todos em um elemento <> para manter a semântica do HTML.",
      "Encapsular todos em um span para manter a semântica do HTML.",
      "Irá adicionar somente os itens internos ao DOM sem nenhum encapsulamento.",
    ],
    topic: "Frontend",
    difficulty: "easy",
  },
  {
    id: 2,
    question:
      "Ao usar o CSS Grid Layout para dispor os elementos de um interface, nós podemos deixar que o próprio grid conduza o posicionamento dos itens dentro do espaço em disposição através do seu auto-placement, porém existe uma propriedade que permite controlar como eles irão se organizar e esta seria:",
    answer: "grid-auto-flow",
    options: ["grid-direction", "grid-auto-flow", "grid-orientation", "grid-axis"],
    topic: "Frontend",
    difficulty: "easy",
  },
  {
    id: 3,
    question: "Em qual tipo de memória fica armazenada as informações que são utilizadas pela API de Clipboard do HTML5?",
    answer: "Data Buffer",
    options: ["Data Buffer", "Disk Buffer", "Write Buffer", "Circular Buffer"],
    topic: "Frontend",
    difficulty: "hard",
  },
  {
    id: 4,
    question:
      "Qual a métrica utilizada para identificar o tempo que leva entre a primeira visualização de um elemento de uma página web e o momento que o seu conteúdo pode receber inputs dos usuários?",
    answer: "Total Blocking Time",
    options: ["Total Blocking Time", "First Content Paint", "First Input Delay", "Time to Interactive"],
    topic: "Frontend",
    difficulty: "medium",
  },
  {
    id: 5,
    question: "Qual propriedade de um item dentro de um container com display:flex define a capacidade do mesmo ocupar menos espaço caso necessário?",
    answer: "flex-shrink",
    options: ["flex-flow", "flex-grow", "flex-wrap", "flex-shrink"],
    topic: "Frontend",
    difficulty: "medium",
  },
  {
    id: 6,
    question:
      "Qual a melhor forma para atualizar em tela mudanças em tempo real para usuários de uma plataforma web que não estão utilizando a aplicação no momento?",
    answer: "Notifications API",
    options: ["Websockets", "Server Side Events", "Notifications API", "Local Notification"],
    topic: "Frontend",
    difficulty: "medium",
  },
  {
    id: 7,
    question: "Qual evento do Window responsável por notificar qualquer janela que houve uma mudança em qualquer dado de sua localStorage?",
    answer: "storage",
    options: ["hashchange", "keychange", "storage", "popchange"],
    topic: "Frontend",
    difficulty: "medium",
  },
  {
    id: 8,
    question: "Qual dos seguintes data types do Javascript não é primitivo?",
    answer: "Number",
    options: ["Object", "Number", "Null", "Boolean"],
    topic: "Frontend",
    difficulty: "medium",
  },
  {
    id: 9,
    question: "Como garantir que não haverá mudanças nos valores de um objeto o tornando imutável com Javascript?",
    answer: "Utilizar a função nativa Object.freeze",
    options: [
      "Utilizar a função nativa Object.seal",
      "Declarar o objeto usando const",
      "Declarar o objeto usando let",
      "Utilizar a função nativa Object.freeze",
    ],
    topic: "Frontend",
    difficulty: "medium",
  },
  {
    id: 10,
    question: "Qual a maneira de voltar o histórico de navegação do usuário para 3 páginas atrás?",
    answer: "History.go(-3)",
    options: ["History.back(3)", "History.replaceState(3)", "History.pushState(-3)", "History.go(-3)"],
    topic: "Frontend",
    difficulty: "medium",
  },
];

const getRandomQuestion = (prevIds = []) => {
  const randomIndex = Math.floor(Math.random() * questions.length);

  const next = questions[randomIndex];

  return prevIds.includes(next.id) ? getRandomQuestion(prevIds) : next;
};

module.exports = {
  getRandomQuestion,
};
