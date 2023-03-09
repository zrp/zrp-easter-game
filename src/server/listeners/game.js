const l = require('../logger');
const { default: Queue } = require('queue');

const { getWorldState, push, getResponder } = require('../services/gameService');
const { getUser } = require('../services/userService');

const GameEngine = require('../engine/main');
const Characters = require('../engine/characters');
const { getIntent } = require('../services/wordService');

module.exports = async (io, client, { id: userId }, sessionId) => {
  l.info(`Registering listeners for game`);

  const user = await getUser(userId);
  const world = await getWorldState(user);

  client.emit('game:loaded', { user, world });

  l.debug(`Loaded user ${user.id} from storage`);
  l.debug(`Loaded world associated with ${user.id}, world length is ${world.length}`);

  // Creates a "responder" for this client
  // This functions sends game:responses to client and ack that the client received the response
  const responder = getResponder(io, sessionId, user);

  // Load last state
  const lastState = world[world.length - 1];

  l.debug(`Loaded lastState for user: ${JSON.stringify(lastState, null, 2)}`);

  const game = GameEngine(user, responder);

  const fsm = game(lastState?.fsm?.state, lastState?.context);

  fsm.start();

  if (world.length == 0) {
    fsm.send('startGame');
  }

  l.info(`⚡ Game started!`);


  // Register a prompt handler to manipulate the fsm
  client.on('prompt', async ({ prompt }) => {
    responder({
      interactive: false, animate: false, prompt, who: {
        id: "99-user",
        name: '(você)',
        color: "text-orange-400",
      }
    });

    const intent = await getIntent(prompt);

    if (intent == 'None') {
      responder({
        interactive: true,
        animate: true,
        prompt: "Não entendi o que você quis dizer. Precisa de $[ajuda](ui:help)$?",
        who: {
          id: null,
          name: null,
          color: "text-red-500",
        }
      }, false)
      return;
    }

    l.debug(`Prompt ${prompt} generated intent ${intent}, testing against fsm`);

    fsm.send(intent);
  });
}
