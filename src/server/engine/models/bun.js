const { BUN } = require("../characters");
const { createModel } = require("./");

module.exports = createModel(
  BUN,
  // Utterances / Data
  (manager) => {
    manager.addNamedEntityText("city", "nodeville", ["pt"], ["nodeville", "node ville"]);
    manager.addNamedEntityText("kingdom", "w'eb", ["pt"], ["W'eb", "web", "dimensão", "reino"]);

    // Where are you from
    manager.addDocument("pt", "de que cidade você é?", "whereAreYouFrom");
    manager.addDocument("pt", "de onde você é?", "whereAreYouFrom");
    manager.addDocument("pt", "voltar para casa?", "whereAreYouFrom");
    manager.addDocument("pt", "cidade de nodeville", "whereAreYouFrom");
    manager.addDocument("pt", "dimensão", "whereAreYouFrom");

    // Where are we
    manager.addDocument("pt", "aonde estamos?", "whereAreWe");

    // more about
    manager.addDocument("pt", "conte mais sobre o %kingdom%", "moreAboutKingdom");
    manager.addDocument("pt", "aonde fica o %kingdom%?", "moreAboutKingdom");

    // Cesta de ovos
    manager.addDocument("pt", "cesta de ovos", "basketOfEggs");
    manager.addDocument("pt", "o que é a cesta de ovos", "basketOfEggs");
    manager.addDocument("pt", "aonde estão seus ovos", "basketOfEggs");

    // easter
    manager.addDocument("pt", "páscoa", "easter");
    manager.addDocument("pt", "preparativos para a páscoa", "easter");
    manager.addDocument("pt", "preparando para a páscoa", "easter");

    // monsterName
    manager.addDocument("pt", "qual o nome do ladrão?", "monsterName");
    manager.addDocument("pt", "quem te roubou?", "monsterName");
    manager.addDocument("pt", "quem é o ladrão?", "monsterName");
    manager.addDocument("pt", "você sabe quem é o ladrão?", "monsterName");

    // monsterFace
    manager.addDocument("pt", "você viu o ladrão?", "monsterFace");
    manager.addDocument("pt", "como o ladrão é?", "monsterFace");
    manager.addDocument("pt", "e como era seu rosto?", "monsterFace");
    manager.addDocument("pt", "e como ele era?", "monsterFace");

    // oi
    manager.addDocument("pt", "oi", "hello");
    manager.addDocument("pt", "olá", "hello");
    manager.addDocument("pt", "alô", "hello");
    manager.addDocument("pt", "fala", "hello");
    manager.addDocument("pt", "e aí?", "hello");
    manager.addDocument("pt", "coé", "hello");
    manager.addDocument("pt", "opa", "hello");
    manager.addDocument("pt", "bom dia", "hello");
    manager.addDocument("pt", "boa tarde", "hello");
    manager.addDocument("pt", "boa noite", "hello");

    // não
    manager.addDocument("pt", "não", "refuse");
    manager.addDocument("pt", "jamais", "refuse");
    manager.addDocument("pt", "nope", "refuse");
    manager.addDocument("pt", "no", "refuse");

    // tail
    manager.addDocument("pt", "rabo", "aboutTail");
    manager.addDocument("pt", "que rabo?", "aboutTail");
    manager.addDocument("pt", "como era o rabo?", "aboutTail");

    // curse
    manager.addDocument("pt", "vai se fuder", "curse");
    manager.addDocument("pt", "vá se fuder", "curse");
    manager.addDocument("pt", "vsf", "curse");
    manager.addDocument("pt", "otário", "curse");
    manager.addDocument("pt", "pau no cu", "curse");
    manager.addDocument("pt", "pnc", "curse");
    manager.addDocument("pt", "vtnc", "curse");
    manager.addDocument("pt", "vai toma no cu", "curse");
    manager.addDocument("pt", "arrombado", "curse");
    manager.addDocument("pt", "filho da puta", "curse");

    // complaining
    manager.addDocument("pt", "caralho", "complaining");
    manager.addDocument("pt", "foda", "complaining");
    manager.addDocument("pt", "porra", "complaining");

    // accept mission
    manager.addDocument("pt", "claro", "acceptMission");
    manager.addDocument("pt", "é pra já", "acceptMission");
    manager.addDocument("pt", "sim", "acceptMission");
    manager.addDocument("pt", "bora", "acceptMission");
    manager.addDocument("pt", "posso", "acceptMission");

    // apologize
    manager.addDocument("pt", "desculpa", "apologize");
    manager.addDocument("pt", "foi mal", "apologize");
    manager.addDocument("pt", "era brincadeira", "apologize");
    manager.addDocument("pt", "foi sem querer", "apologize");

    manager.addDocument("pt", "oi, tudo bom?", "hello");
    manager.addDocument("pt", "tudo bem?", "hello");

    // how the machine work
    manager.addDocument("pt", "como a máquina funciona?", "aboutMachine");
    manager.addDocument("pt", "o que é a máquina?", "aboutMachine");
    manager.addDocument("pt", "que máquina?", "aboutMachine");
    manager.addDocument("pt", "o que é a máquina no canto?", "aboutMachine");
    manager.addDocument("pt", "o que é a máquina ao leste?", "aboutMachine");
    manager.addDocument("pt", "o que é a máquina na direita?", "aboutMachine");

    manager.addDocument("pt", "como usar a máquina?", "aboutMachine");

    // password
    manager.addDocument("pt", "qual a senha?", "aboutPassword");
    manager.addDocument("pt", "qual a senha de ativação?", "aboutPassword");
    manager.addDocument("pt", "qual a senha da máquina?", "aboutPassword");
    manager.addDocument("pt", "senha da máquina", "aboutPassword");

    manager.addDocument("pt", "prazer em te conhecer", "niceToMeetYou");
    manager.addDocument("pt", "foi um prazer te conhecer", "niceToMeetYou");
    manager.addDocument("pt", "feliz em te conhecer", "niceToMeetYou");
    manager.addDocument("pt", "bom te conhecer", "niceToMeetYou");
    manager.addDocument("pt", "legal te conhecer", "niceToMeetYou");

    manager.addDocument("pt", "tchau", "exitConversation");
    manager.addDocument("pt", "vlw, flw", "exitConversation");
    manager.addDocument("pt", "falou", "exitConversation");
    manager.addDocument("pt", "até mais", "exitConversation");
    manager.addDocument("pt", "até já", "exitConversation");
    manager.addDocument("pt", "abraço", "exitConversation");

    manager.addDocument("pt", "me ajude a ir", "goToKingdom");
    manager.addDocument("pt", "me ajude", "goToKingdom");
    manager.addDocument("pt", "me ajude a ir para sua dimensão", "goToKingdom");
    manager.addDocument("pt", "me ajude a ir para %kingdom%", "goToKingdom");
    manager.addDocument("pt", "ir para %kingdom%", "goToKingdom");
    manager.addDocument("pt", "como ir para %kingdom%", "goToKingdom");

    manager.addDocument("pt", "com o que?", "withWhat");
    manager.addDocument("pt", "sobre o que?", "withWhat");

    manager.addAnswer(
      "pt",
      "easter",
      "Eu venho para esse laboratório em março e abril com minha cesta de ovos, mas desde que fui roubado, fiquei desolado e não consegui nem pensar em voltar para casa. Preciso resolver esse problema e recuperar minha cesta de ovos. Será que você me ajudaria?",
    );

    manager.addAnswer(
      "pt",
      "moreAboutKingdom",
      "O reino W'eb fica numa dimensão separada da sua, eu posso te teleportar para lá, mas os riscos são grandes. Humanos não aguentam viver naquelas condições por muito tempo, então você precisará voltar antes do seu tempo acabar.",
    );

    manager.addAnswer(
      "pt",
      "helpRequested",
      `Você sempre pode me pedir ajuda. Para falar comigo, digite abaixo. Eu sou bem esperto, se eu souber te responder, responderei com prazer. Tente dizer, por exemplo, "o que é a cidade de Nodeville?".`,
    );

    manager.addAnswer(
      "pt",
      "whereAreWe",
      "Agora estamos no meio do meu laboratório secreto. Como você sabe, eu não sou desse mundo, mas do reino W'eb. Eu utilizo este laboratório apenas nos meses de março e abril para distribuir ovos para as crianças, mas minha cesta foi roubada, então vim para cá atrás de alguém que possa me ajudar. Você pode?",
    );

    manager.addAnswer(
      "pt",
      "whereAreYouFrom",
      "Eu vim da cidade de Nodeville, que é parte do reino W'eb, e é para lá que o ladrão voltou.\nSe você quiser eu posso te ajudar a chegar na minha dimensão. Só precisamos usar a máquina à sua direita.",
    );

    manager.addAnswer(
      "pt",
      "basketOfEggs",
      `Aaaah, minha cesta de ovos :(\nEu iria distribuí-los até a páscoa, mas aquele ladrão roubou eles de mim.\nMas eu acredito que ainda há tempo. Se você encontrar minha cesta talvez eu possa te recompensar com um desses ovos.`,
    );

    manager.addAnswer(
      "pt",
      "aboutMachine",
      `A máquina é um teletransportador interdimensional quantizado. Ele pode te levar para W'eb, mas para usar a máquina você precisa ligá-la e digitar a senha de ativação.`,
    );

    manager.addAnswer("pt", "aboutPassword", `Eu sempre me esqueço dessa maldita senha. Talvez você encontre a senha na minha mesa.`);
    manager.addAnswer("pt", "monsterName", "Eu não sei quem ele era.");
    manager.addAnswer(
      "pt",
      "monsterFace",
      "Eu não vi o seu rosto, mas ele era grande e usava uma capa preta. A única coisa que me lembro foi de ver seu rabo longo desaparecendo pelo portal.",
    );
    manager.addAnswer("pt", "complaining", `Não se irrite! Eu posso te ajudar. O que você quer saber?`);

    manager.addAnswer("pt", "aboutTail", `Era um rabo longo com fios pretos na ponta, mas como te disse, não vi muita coisa, posso estar enganado.`);

    manager.addAnswer("pt", "niceToMeetYou", `O prazer é meu! É sempre bom conhecer pessoas dispostas a me ajudarem! Algo mais em que eu possa ajudá-lo?`);

    manager.addAnswer("pt", "refuse", "Aaaah, tudo bem, outros provavelmente terão interesse em me ajudar.");
    manager.addAnswer("pt", "curse", "Você me xingar não vai te ajudar em nada.");
    manager.addAnswer("pt", "exitConversation", "Até logo! E boa sorte.");

    manager.addAnswer("pt", "apologize", "Tudo bem, está perdoado.");
    manager.addAnswer("pt", "apologize", "Não tem problema.");
    manager.addAnswer("pt", "apologize", "Ok, mas espero que não se repita, tá bom?");
  },
);
