const tokenize2nlp = (label) => `%${label}%`;

const tokenize2front = (text, action, data = "") => {
  return `$[${text}](${action}${data != "" ? "," + data : ""})$`;
};

const char2token = (character) => {
  const text = character.name;
  const action = "ui:who_is";
  const data = character.id;

  return tokenize2front(text, action, data);
};

module.exports = {
  tokenize2front,
  tokenize2nlp,
  char2token,
};
