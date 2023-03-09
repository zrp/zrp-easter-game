const Nicknames = [
  {
    "name": (gender = 'M') => gender == 'M' ? "o Destruidor" : 'a Destruidora',
    "description": (gender = 'M') => gender == 'M' ? "um guerreiro temido que destrói tudo em seu caminho." : "uma guerreira temida que destrói tudo em seu caminho."
  },
]

const DefaultNickname = {
  name: (gender = 'M') => gender == 'M' ? "o Rebelde" : "a Rebelde",
  description: (gender = 'M') => gender == 'M' ? "o guerreiro que descobriu como alterar sua alcunha para uma inválida." : "a guerreira que descobriu como alterar sua alcunha para uma inválida"
}

const nicknames = [
  "Cruel",
  "Sanguinário",
  "Temível",
  "Vingador",
  "Conquistador",
  "Valente",
  "Destemido",
  "Impiedoso",
  "Inflexível",
  "Implacável",
  "Desafiante",
  "Justo",
  "Generoso",
  "Piedoso",
  "Santo",
  "Magnânimo",
  "Misericordioso",
  "Sábio",
  "Nobre",
  "Honesto",
  "Ameaçador",
  "Animalesco",
  "Assassino",
  "Astuto",
  "Barulhento",
  "Brutal",
  "Caçador",
  "Carrasco",
  "Cavaleiro Negro",
  "Cavaleiro Sangrento",
  "Corajoso",
  "Crianção",
  "Cruel",
  "Destruidor",
  "Desumano",
  "Devastador",
  "Ditador",
  "Dominador",
  "Dragão",
  "Feroz",
  "Filho da Morte",
  "Forte",
  "Gigante",
  "Gladiador",
]

const generateNickname = (gender = 'M') => {
  const idx = Math.floor(Math.random() * Nicknames.length);
  const nick = Nicknames[idx];

  return nick?.name(gender) ?? DefaultNickname.name(gender);
}

const getNicknameDescription = (name, gender = 'M') => {
  const nickname = Nicknames.find(nick => nick.name(gender) == name);

  return nickname?.description(gender) ?? DefaultNickname.description(gender);
}

module.exports = {
  generateNickname,
  getNicknameDescription,
}
