const { getUsers, getUser } = require("../services/userService");

const Characters = require("../engine/characters");

const l = require("../logger");
const { isCooldownActive, setCooldown, getRenderer } = require("../services/gameService");

module.exports = async (io, client, { id: userId }, sessionId) => {
  l.info(`Registering listeners for UI actions`);
  const user = await getUser(userId);

  const { add2world, setError } = getRenderer(io, sessionId, user);

  client.on("ui:who_is", async ({ id }) => {
    let character = Object.values(Characters).find((character) => character.id === id);

    const key = `ui:who_is:${id ?? "me"}`;
    const isCooldown = await isCooldownActive(user, key);

    if (isCooldown) {
      setError({ message: "Você não pode executar tantas ações assim 👀" });
      return;
    }

    await setCooldown(user, key);

    // Character not found
    if (!character) {
      setError({ message: "Você ainda não conhece esse personagem (ou ele não existe)" });
      return;
    }

    const description = id == Characters.PLAYER.id ? user.description : character.description;

    add2world({ prompt: description }, false);
  });

  client.on("ui:tip", async (data) => {
    let prompt = "";

    switch (data?.name) {
      case "directions-north":
        prompt = `Você pode se movimentar nas 4 direções cardinais (norte, sul, leste, oeste). Para você saber aonde você se encontra, você pode consultar o mapa clicando no menu superior, ou digitando Ctrl + M.`;
        break;
      default:
        prompt = `${data?.name} não está registrado`;
    }

    add2world({ prompt }, false);
  });

  client.on("ui:help", async (data) => {
    add2world({ prompt: data }, false);
  });
};
