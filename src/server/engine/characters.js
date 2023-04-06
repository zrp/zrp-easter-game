const Characters = {
  PLAYER: {
    id: "00-user",
    name: ">",
    showName: false,
    fullName: "",
    description: "",
    color: "text-orange-400",
  },
  NARRATOR: {
    id: "01-narrator",
    name: ">",
    showName: false,
    fullName: "GPT-4",
    color: "text-blue-400",
    description: "Não é possível dizer quem é o dono desta voz, mas ela fala profundamente com você.",
  },
  BUN: {
    id: "02-bun",
    name: "Bun",
    showName: true,
    fullName: "Bun, o Coelho",
    color: "text-pink-400",
    description:
      "Bun, o Coelho, é conhecido dos moradores da cidade de Nodeville, do reino de W'eb. Ele é seguidor leal da guilda Vercelida. Ele te contou sobre seus ovos terem sido roubados em seu laboratório por uma figura misteriosa.",
  },
  BUN_UNKNOWN: {
    id: "03-bun-unknown",
    name: "????",
    showName: true,
    fullName: "Bun, o Coelho",
    color: "text-pink-400",
    description:
      "Bun, o Coelho, é conhecido dos moradores da cidade de Nodeville, do reino de W'eb. Ele é seguidor leal da guilda Vercelida. Ele te contou sobre seus ovos terem sido roubados em seu laboratório por uma figura misteriosa.",
  },
  IMPOSTOR_UNKNOWN: {
    id: "04-impostor-unknow",
    name: "????",
    showName: true,
    fullName: "ElePHPant, líder da guilda PHPzica",
    color: "text-green-400",
    description: "",
  },
  GPT: {
    id: "05-gpt",
    name: "GPT",
    showName: true,
    fullName: "GPT, Chat",
    color: "text-green-400",
    description: "",
  },
  NARRATOR_GPT: {
    id: "06-gpt4",
    name: "????",
    showName: false,
    fullName: "GPT-4",
    color: "text-white",
    description: "Não é possível dizer quem é o dono desta voz, mas ela fala profundamente com você.",
  },
};

module.exports = Characters;
