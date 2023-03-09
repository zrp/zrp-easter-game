const { getUsers, getUser } = require("../services/userService");

const Characters = require('../engine/characters');

const l = require('../logger');
const { isCooldownActive, setCooldown, getResponder } = require("../services/gameService");

module.exports = async (io, client, { id: userId }, sessionId) => {
  l.info(`Registering listeners for UI actions`);

  const user = await getUser(userId);

  const responder = getResponder(io, sessionId, user);

  client.on('ui:who_is', async ({ id }) => {
    let character = Object.values(Characters).find(character => character.id === id);

    const key = `ui:who_is:${id ?? 'me'}`;
    const isCooldown = await isCooldownActive(user, key);

    // Chill-out dude!
    if (isCooldown) {
      responder({
        error: { message: "Você não pode executar tantas ações assim 👀" }
      }, false)
      return;
    }

    await setCooldown(user, key);

    // User request info about itself
    if (id == '99-user') {
      responder({
        worldAdd: {
          prompt: user.description,
          interactive: true,
          animate: true
        }
      }, false)
      return;
    }

    // Character not found
    if (!character) {
      responder({
        error: { message: "Você ainda não conhece esse personagem (ou ele não existe)" }
      }, false)
    }

    responder({
      worldAdd: {
        prompt: character.description,
        interactive: true,
        animate: true,
      }
    }, false);
  });

  client.on('ui:tip', async (data) => {
    console.log(`TIP`, data);
    switch (data?.name) {
      case "directions-north":
        responder({
          worldAdd: {
            prompt: `Você pode se movimentar nas 4 direções cardinais (norte, sul, leste, oeste). Para você saber aonde você se encontra, você pode consultar o mapa clicando no menu superior, ou digitando Ctrl + M.`,
            interactive: false,
            animate: true,
          }
        }, false);
        break;
      default:
        responder({
          worldAdd: {
            prompt: `${data?.name} não está registrado`,
            interactive: false,
            animate: false,
          }
        }, false);
    }
  });

  client.on('ui:help', async (data) => {
    responder({
      worldAdd: {
        prompt: data,
        interactive: true,
        animate: true,
      }
    }, false)
  })
}
