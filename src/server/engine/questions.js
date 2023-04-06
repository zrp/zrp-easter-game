const _ = require("lodash");

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
    question:
      "Qual propriedade de um item dentro de um container com display:flex define a capacidade do mesmo ocupar menos espaço caso necessário?",
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
    answer: "object",
    options: ["object", "number", "null", "boolean"],
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
  {
    id: 11,
    question: "Qual das seguintes características é relacionada a uma Standard Queue da AWS SQS?",
    answer: "At-Least-Once Delivery",
    options: ["High Throughput", "Exactly-Once Processing", "First-In-First-Out Delivery", "At-Least-Once Delivery"],
    topic: "AWS",
    difficulty: "easy",
  },
  {
    id: 12,
    question: "Qual das seguintes engines não é suportada pelo serviço Amazon RDS?",
    answer: "SQLite",
    options: ["MariaDB", "Oracle", "PostgreSQL", "SQLite"],
    topic: "AWS",
    difficulty: "easy",
  },
  {
    id: 13,
    question: "Qual dos seguintes produtos da AWS não é um serviço de computação?",
    answer: "Route53",
    options: ["EC2", "Route53", "Lambda", "ECS"],
    topic: "AWS",
    difficulty: "easy",
  },
  {
    id: 14,
    question:
      "Qual o conceito do CloudFront é utilizado para disponibilizar conteúdos personalizados baseados na localização na qual a plataforma está sendo acessada?",
    answer: "Geo Targeting",
    options: ["AWS Regions", "Availability Zones", "Geo Targeting", "Geolocation"],
    topic: "AWS",
    difficulty: "easy",
  },
  {
    id: 15,
    question: "Qual o número máximo de IP elásticos numa única conta da AWS consegue gerar?",
    answer: "5",
    options: ["5", "3", "10", "1"],
    topic: "AWS",
    difficulty: "hard",
  },
  {
    id: 16,
    question: "Qual a flag é necessária para poder editar o conteúdo do último commit realizado?",
    answer: "--amend",
    options: ["--edit", "--rewrite", "--amend", "--patch"],
    topic: "Git",
    difficulty: "easy",
  },
  {
    id: 17,
    question: "Qual das opções de merge de duas branches irá gerar um novo commit com a integração entre as branches?",
    answer: "three way",
    options: ["rebase", "three way", "fast foward", "fetch"],
    topic: "Git",
    difficulty: "easy",
  },
  {
    id: 18,
    question: "Como pegar os itens do seu stash e não removê-los ao serem adicionados no seu working directory?",
    answer: "git stash apply",
    options: ["git stash drop", "git stash pop", "git stash apply", "git stash save"],
    topic: "Git",
    difficulty: "easy",
  },
  {
    id: 19,
    question: "Como buscar branches que possuem um commit em específico?",
    answer: "git branch --contains COMMIT_HASH",
    options: [
      "git branch --list COMMIT_HASH",
      "git commit --list COMMIT_HASH",
      "git commit --contains COMMIT_HASH",
      "git branch --contains COMMIT_HASH",
    ],
    topic: "Git",
    difficulty: "hard",
  },
  {
    id: 20,
    question: "Usando o git bisect para buscar um bug, como marcar o commit que introduziu o erro?",
    answer: "git bisect bad",
    options: ["git bisect apply", "git bisect broken", "git bisect save", "git bisect bad"],
    topic: "Git",
    difficulty: "hard",
  },
  {
    id: 21,
    question: "Qual o tipo de serviço Kubernetes é utilizado para ser exposto na internet?",
    answer: "Load Balancer",
    options: ["Cluster IP", "Node Port", "External Name", "Load Balancer"],
    topic: "Kubernetes",
    difficulty: "hard",
  },
  {
    id: 22,
    question: "Qual o comando usado para rodar um comando em um container específico com o kubectl?",
    answer: "kubectl exec",
    options: ["kubectl run", "kubectl apply", "kubectl exec", "kubectl attach"],
    topic: "Kubernetes",
    difficulty: "hard",
  },
  {
    id: 23,
    question: "Como interromper um container imediatamente com o docker?",
    answer: "docker kill CONTAINER_ID",
    options: ["docker kill CONTAINER_ID", "docker stop CONTAINER_ID", "docker prune CONTAINER_ID", "docker pause CONTAINER_ID"],
    topic: "Docker",
    difficulty: "hard",
  },
  {
    id: 24,
    question: "Qual das seguintes opções não é o status de um container?",
    answer: "Killed",
    options: ["Killed", "Created", "Running", "Paused"],
    topic: "Docker",
    difficulty: "hard",
  },
  {
    id: 25,
    question: "Qual dos seguintes data types do Python não é IMUTÁVEL?",
    answer: "List",
    options: ["Bytes", "List", "Number", "Tuple"],
    topic: "Python",
    difficulty: "hard",
  },
  {
    id: 26,
    question: "Qual o último nível de escopo é verificado em busca de uma declaração pelo interpretador Python?",
    answer: "Built-in",
    options: ["Local", "Built-in", "Global", "Module"],
    topic: "Python",
    difficulty: "hard",
  },
  {
    id: 27,
    question: "Como converter um número inteiro para string em Python?",
    answer: "str()",
    options: ["to_string()", "str()", "string()", "String.valueOf()"],
    topic: "Python",
    difficulty: "hard",
  },
  {
    id: 28,
    question: "Em Orientação a Objetos, quando uma classe base é herdada por diversas classes derivadas nós chamamos isso de:",
    answer: "Hierarchical Inheritance",
    options: ["Multilevel Inheritance", "Hierarchical Inheritance", "Multiple Inheritance", "Single Inheritance"],
    topic: "Arquitetura",
    difficulty: "hard",
  },
  {
    id: 29,
    question: "O que é um paradigma de programação?",
    answer: "Uma abordagem ou estilo de programação baseado em um conjunto de princípios ou conceitos fundamentais",
    options: [
      "Um tipo de linguagem de programação",
      "Uma forma de codificar que não segue padrões",
      "Um conjunto de bugs comuns em programação",
      "Uma abordagem ou estilo de programação baseado em um conjunto de princípios ou conceitos fundamentais",
    ],
    topic: "Paradigmas de Programação",
    difficulty: "easy",
  },
  {
    id: 30,
    question: "Qual a diferença entre HTTP e HTTPS?",
    answer: "O HTTPS é uma versão segura do HTTP, que utiliza criptografia para garantir a segurança da comunicação",
    options: [
      "O HTTPS é mais rápido que o HTTP",
      "O HTTP é uma versão segura do HTTPS",
      "O HTTP não é mais usado hoje em dia",
      "O HTTPS é uma versão segura do HTTP, que utiliza criptografia para garantir a segurança da comunicação",
    ],
    topic: "Segurança na Web",
    difficulty: "hard",
  },
  {
    id: 31,
    question: "O que é o Git?",
    answer: "Um sistema de controle de versão distribuído",
    options: [
      "Um banco de dados relacional",
      "Um ambiente de desenvolvimento integrado",
      "Um sistema de gerenciamento de projetos",
      "Um sistema de controle de versão distribuído",
    ],
    topic: "Git",
    difficulty: "easy",
  },
  {
    id: 32,
    question: "O que é uma linguagem de programação orientada a objetos?",
    answer: "Uma linguagem de programação que usa objetos como unidades básicas para modelar dados e funcionalidades",
    options: [
      "Uma linguagem de programação que não usa objetos",
      "Uma linguagem de programação que usa funções como unidades básicas para modelar dados e funcionalidades",
      "Uma linguagem de programação que usa objetos como unidades básicas para modelar dados e funcionalidades",
      "Uma linguagem de programação que usa apenas números para modelar dados e funcionalidades",
    ],
    topic: "Programação Orientada a Objetos",
    difficulty: "medium",
  },
  {
    id: 33,
    question: "Qual é o objetivo do teorema CAP em sistemas distribuídos?",
    answer:
      "Mostrar que é impossível para um sistema distribuído fornecer simultaneamente consistência, disponibilidade e tolerância a partições em caso de falhas de rede",
    options: [
      "Definir o protocolo para sincronização de relógios em sistemas distribuídos",
      "Garantir que todos os nós em um sistema distribuído tenham a mesma versão do software instalado",
      "Fornecer um método para escalar um sistema distribuído sem perda de desempenho",
      "Mostrar que é impossível para um sistema distribuído fornecer simultaneamente consistência, disponibilidade e tolerância a partições em caso de falhas de rede",
    ],
    topic: "Sistemas Distribuídos",
    difficulty: "hard",
  },
  {
    id: 34,
    question: "O que é o teorema de Rice em teoria da computação?",
    answer:
      "O teorema de Rice afirma que para qualquer propriedade extensiva não trivial de um programa, não é possível determinar se um programa dado tem essa propriedade ou não",
    options: [
      "O teorema de Rice afirma que todos os problemas de decisão são decidíveis",
      "O teorema de Rice afirma que a complexidade de tempo e espaço de um algoritmo são sempre iguais, independente dos seus inputs",
      "O teorema de Rice afirma que um problema não recursivo sempre pode ser reescrito de forma recursiva",
      "O teorema de Rice afirma que para qualquer propriedade extensiva não trivial de um programa, não é possível determinar se um programa dado tem essa propriedade ou não",
    ],
    topic: "Teoria da Computação",
    difficulty: "hard",
  },
  {
    id: 35,
    question: "O que é o algoritmo RSA em criptografia?",
    answer:
      "O algoritmo RSA é um algoritmo de criptografia de chave pública que usa o produto de dois números primos grandes para gerar uma chave pública e uma chave privada para criptografar e descriptografar dados",
    options: [
      "O algoritmo RSA é um algoritmo de criptografia de chave simétrica que usa uma única chave para criptografar e descriptografar dados",
      "O algoritmo RSA é um algoritmo de criptografia que usa uma matriz de substituição para criptografar dados",
      "O algoritmo RSA é um algoritmo de compressão de dados que usa técnicas de codificação redundante para criptografar e descriptografar dados",
      "O algoritmo RSA é um algoritmo de criptografia de chave pública que usa o produto de dois números primos grandes para gerar uma chave pública e uma chave privada para criptografar e descriptografar dados",
    ],
    topic: "Criptografia",
    difficulty: "hard",
  },
  {
    id: 36,
    question: "O que é o problema do halting em teoria da computação?",
    answer:
      "O problema do halting é o problema de determinar se um programa pode parar (ou seja, entrar em um estado de 'halting') para qualquer entrada dada",
    options: [
      "O problema do halting é o problema de determinar a complexidade de tempo de um algoritmo",
      "O problema do halting é o problema de determinar se um programa pode continuar após uma parada",
      "O problema do halting descreve o problema de uma máquina poder parar aleatoriamente devido a um bit flip ou bit manipulation",
      "O problema do halting é o problema de determinar se um programa pode parar (ou seja, entrar em um estado de 'halting') para qualquer entrada dada",
    ],
    topic: "",
    difficulty: "hard",
  },
  {
    id: 37,
    question: "O que é um ORM em desenvolvimento de software?",
    answer: "Uma técnica de programação que mapeia objetos de software para tabelas em um banco de dados relacional",
    options: [
      "Um modelo de desenvolvimento de software que enfatiza a colaboração entre clientes e desenvolvedores",
      "Uma ferramenta para testes de unidade em desenvolvimento de software",
      "Um conjunto de práticas de desenvolvimento ágil de software",
      "Uma técnica de programação que mapeia objetos de software para tabelas em um banco de dados relacional",
    ],
    topic: "Desenvolvimento de Software",
    difficulty: "medium",
  },
  {
    id: 38,
    question: "O que é uma arquitetura de microsserviços?",
    answer:
      "Um estilo de arquitetura de software que consiste em construir um aplicativo como um conjunto de serviços independentes, cada um executando um processo único e comunicando-se por meio de uma interface bem definida",
    options: [
      "Uma arquitetura de software que usa um único serviço para gerenciar todas as funções de um aplicativo",
      "Um modelo de programação orientado a objetos que enfatiza a modularidade e o encapsulamento",
      "Um padrão de projeto que descreve como criar objetos a partir de classes de objetos",
      "Um estilo de arquitetura de software que consiste em construir um aplicativo como um conjunto de serviços independentes, cada um executando um processo único e comunicando-se por meio de uma interface bem definida",
    ],
    topic: "Arquitetura de Software",
    difficulty: "hard",
  },
  {
    id: 39,
    question: "O que é injeção de dependência em desenvolvimento de software?",
    answer:
      "Um padrão de projeto de software que permite que objetos dependam uns dos outros sem que o objeto que depende precise saber a implementação específica do objeto de que está dependendo",
    options: [
      "Uma técnica de otimização de código para melhorar o desempenho do aplicativo",
      "Um método de criptografia que protege informações confidenciais em trânsito",
      "Um padrão de projeto que descreve como dividir um sistema em pequenos componentes independentes",
      "Um padrão de projeto de software que permite que objetos dependam uns dos outros sem que o objeto que depende precise saber a implementação específica do objeto de que está dependendo",
    ],
    topic: "Padrões de Projeto de Software",
    difficulty: "hard",
  },
  {
    id: 40,
    question: "Qual a diferença entre uma chave primária e uma chave estrangeira em um banco de dados?",
    answer:
      "Uma chave primária é um campo ou conjunto de campos em uma tabela de banco de dados que identifica exclusivamente cada registro na tabela. Já uma chave estrangeira é um campo ou conjunto de campos em uma tabela de banco de dados que faz referência a uma chave primária em outra tabela, estabelecendo uma relação entre as duas tabelas",
    options: [
      "Uma chave primária é um campo em uma tabela de banco de dados que armazena dados de texto, enquanto uma chave estrangeira armazena dados numéricos",
      "Uma chave primária é usada para criptografar dados sensíveis em um banco de dados, enquanto uma chave estrangeira é usada para proteger informações confidenciais",
      "Uma chave primária é usada para estabelecer uma relação entre duas tabelas em um banco de dados, enquanto uma chave estrangeira é um campo de dados normal em uma tabela de banco de dados",
      "Uma chave primária é um campo ou conjunto de campos em uma tabela de banco de dados que identifica exclusivamente cada registro na tabela. Já uma chave estrangeira é um campo ou conjunto de campos em uma tabela de banco de dados que faz referência a uma chave primária em outra tabela, estabelecendo uma relação entre as duas tabelas",
    ],
    topic: "Banco de Dados",
    difficulty: "medium",
  },
  {
    id: 41,
    question: "Quais são as principais limitações das redes neurais convolucionais?",
    answer: "As redes neurais convolucionais incluem a necessidade de grandes quantidades de dados rotulados para o treinamento",
    options: [
      "As redes neurais convolucionais não podem ser usadas em problemas de classificação de imagem",
      "As redes neurais convolucionais não podem ser treinadas em GPUs",
      "As redes neurais convolucionais incluem a necessidade de grandes quantidades de dados rotulados para o treinamento",
      "As redes neurais convolucionais não são capazes de lidar com dados de entrada em formatos diferentes de imagem",
    ],
    topic: "Inteligência Artificial",
    difficulty: "hard",
  },
  {
    id: 42,
    question: "O que são modelos de linguagem em processamento de linguagem natural?",
    answer:
      "Modelos de linguagem em processamento de linguagem natural são modelos estatísticos que tentam estimar a probabilidade de uma sequência de palavras em um idioma dado um conjunto de dados de treinamento",
    options: [
      "Modelos de linguagem em processamento de linguagem natural são modelos que tentam analisar a gramática de um idioma para identificar erros de escrita",
      "Modelos de linguagem em processamento de linguagem natural são modelos que tentam classificar texto em categorias pré-definidas",
      "Modelos de linguagem em processamento de linguagem natural são modelos que tentam analisar a estrutura sintática de um texto para identificar relações entre palavras",
      "Modelos de linguagem em processamento de linguagem natural são modelos estatísticos que tentam estimar a probabilidade de uma sequência de palavras em um idioma dado um conjunto de dados de treinamento",
    ],
    topic: "Processamento de Linguagem Natural",
    difficulty: "hard",
  },
];

const getRandomQuestion = (prevIds = []) => {
  const ids = _.uniq(prevIds);

  const availableQuestions = _.filter(questions, (q) => !ids.includes(q.id));

  return _.sample(availableQuestions.length > 0 ? availableQuestions : questions);
};

module.exports = {
  getRandomQuestion,
};
