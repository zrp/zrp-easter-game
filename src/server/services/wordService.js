const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['pt'], forceNER: true });

// goNorth
manager.addDocument('pt', 'ir para o norte', 'action.goNorth')
manager.addDocument('pt', 'vá para o norte', 'action.goNorth')

// goSouth
manager.addDocument('pt', 'ir para o sul', 'action.goSouth')
manager.addDocument('pt', 'vá para o sul', 'action.goSouth')

// goEast
manager.addDocument('pt', 'ir para o leste', 'action.goEast')
manager.addDocument('pt', 'vá para o leste', 'action.goEast')

// goWest
manager.addDocument('pt', 'ir para o oeste', 'action.goWest')
manager.addDocument('pt', 'vá para o oeste', 'action.goWest')

// mui
manager.addDocument('pt', 'quem é a guilda Mui', 'action.mui');
manager.addDocument('pt', 'o que é Mui', 'action.mui');

// basketOfEggs
manager.addDocument('pt', 'cesta de ovos', 'action.basketOfEggs');
manager.addDocument('pt', 'o que é a cesta de ovos', 'action.basketOfEggs');
manager.addDocument('pt', 'aonde estão seus ovos', 'action.basketOfEggs');

// monsterName
manager.addDocument('pt', 'qual o nome da criatura?', 'action.monsterName');
manager.addDocument('pt', 'qual o nome do monstro?', 'action.monsterName');
manager.addDocument('pt', 'quem é o monstro?', 'action.monsterName');

// monsterFace
manager.addDocument('pt', 'você viu o monstro?', 'action.monsterFace');
manager.addDocument('pt', 'como o monstro é?', 'action.monsterFace');

// what should i do
manager.addDocument('pt', 'o que eu faço', 'action.help');
manager.addDocument('pt', 'me ajuda', 'action.help');

let trained = false;

const getIntent = async (sentence) => {
  if (!trained) await train();
  const response = await manager.process('pt', sentence);

  return response.intent;
}

const train = async () => {
  trained = true;
  await manager.train();
  manager.save();
}

module.exports = {
  getIntent,
  train,
}
