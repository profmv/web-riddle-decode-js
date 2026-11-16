export const GATE_GUIDES = [
  {
    title: 'A roda de César',
    topic: 'Strings, funções, laços e condicionais',
    brief: 'Quem trancou este portão trocou cada letra pela que vem três posições à frente. Use a mesma roda para trazer as letras de volta.',
    instructions: [
      'No VS Code, crie uma função que receba um caractere e um deslocamento. Use o alfabeto de A a Z para descobrir a posição da letra.',
      'Na decodificação, volte 3 posições. Se passar do A, continue pelo Z. Mantenha espaços e pontuação onde estão.',
      'Percorra a mensagem com um laço e reúna os caracteres em uma nova string. Cole o resultado no campo do portão.'
    ],
    concept: {
      title: 'O alfabeto dá a posição',
      text: 'Em JavaScript, o índice começa em zero. Na string "ABC", A ocupa o índice 0. O método indexOf retorna -1 se o caractere não estiver na string.'
    },
    hints: [
      {
        title: 'Como achar a posição?',
        text: 'Teste estas linhas no seu projeto. Depois troque "F" por "!" e use a diferença para decidir se o caractere deve ficar como veio.',
        code: 'const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"\nconst posicao = alfabeto.indexOf("F")\nconsole.log(posicao)'
      },
      {
        title: 'E se eu passar do A?',
        text: 'Imagine um teste com deslocamento de 1. Para qual letra A deve voltar? Use esse teste para decidir o que fazer quando a posição calculada ficar negativa.'
      }
    ],
    retry: 'Confiram a volta do A para o Z e se espaços e pontuação ficaram no lugar.',
    links: [
      { label: 'String.indexOf()', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf' },
      { label: 'Laços for...of', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/for...of' }
    ]
  },
  {
    title: 'A chave que se repete',
    topic: 'Vetores, índices e resto da divisão',
    brief: 'A roda ainda funciona. Agora são três deslocamentos diferentes, e a sequência começa de novo depois do terceiro.',
    instructions: [
      'Guarde a chave [2, 5, 1] em um vetor. Volte 2 posições na primeira letra, 5 na segunda, 1 na terceira e 2 na quarta. Repita até o fim.',
      'Comece o contador de letras em zero. Só aumente esse contador depois de processar uma letra de A a Z.',
      'Reaproveite a função do primeiro portão que desloca uma letra. Só muda a forma de escolher o número de posições.'
    ],
    concept: {
      title: 'O resto faz o índice voltar',
      text: 'Ao dividir um contador pelo tamanho de um vetor, o resto fica entre 0 e o último índice. Assim, a sequência de posições depende de quantas letras já foram contadas.'
    },
    hints: [
      {
        title: 'Como repetir uma lista?',
        text: 'Neste exemplo, o vetor tem dois itens. Experimente trocar indice por 0, 1, 2 e 3. Compare o padrão que aparece.',
        code: 'const lista = [7, 9]\nconst indice = 2\nconst item = lista[indice % lista.length]\nconsole.log(item)'
      },
      {
        title: 'Quem consome uma posição?',
        text: 'Compare o segundo A nas entradas "AA" e "A A". Os dois precisam receber o mesmo deslocamento. Confira em qual parte do laço você aumenta o contador.'
      }
    ],
    retry: 'Se o começo confere e o resto não, confiram se o contador avança em espaços ou pontuação.',
    links: [
      { label: 'Vetores com Array', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array' },
      { label: 'Operadores aritméticos, incluindo %', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Expressions_and_operators' }
    ]
  },
  {
    title: 'A marcha dos blocos',
    topic: 'Math.floor() e blocos de letras',
    brief: 'O mecanismo sobe um degrau a cada quatro letras. Descubra o degrau de cada letra antes de girar a roda.',
    instructions: [
      'Use a contagem de letras do portão anterior, a partir de zero e sem contar espaços nem pontuação.',
      'O deslocamento começa em 2. Divida o índice da letra por 4, arredonde para baixo com Math.floor() e some esse número ao deslocamento inicial.',
      'Passe o deslocamento calculado para sua função de decodificar uma letra. Preserve os demais caracteres.'
    ],
    concept: {
      title: 'Uma conta para achar o bloco',
      text: 'Math.floor() encontra o inteiro abaixo ou igual ao resultado. Nos índices 3 e 4, dividir por 4 e arredondar para baixo dá 0 e 1, respectivamente.'
    },
    hints: [
      {
        title: 'Onde o deslocamento muda?',
        text: 'Antes de rodar o texto inteiro, imprima o índice e o deslocamento para os índices de 0 a 9. Confira se o valor fica igual dentro de cada grupo de quatro.',
        code: 'for (let i = 0; i < 10; i++) {\n  console.log(i, 2 + Math.floor(i / 4))\n}'
      },
      {
        title: 'O começo confere e o resto não?',
        text: 'Confira se o contador começa em zero e só aumenta depois de uma letra de A a Z. Se a primeira palavra sair certa e as seguintes erradas, o contador provavelmente está contando espaços.'
      }
    ],
    retry: 'Se o começo confere e o resto não, confiram onde o deslocamento muda: a cada quatro letras, sem contar espaços.',
    links: [
      { label: 'Math.floor()', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/floor' },
      { label: 'Operadores aritméticos', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Expressions_and_operators' }
    ]
  },
  {
    title: 'O recado em duas camadas',
    topic: 'Vetores, métodos de string e composição de funções',
    brief: 'O último recado passou por dois mecanismos. Leia como ele foi cifrado e descubra em que ordem seu programa deve desfazer os passos.',
    instructions: [
      'Na hora de cifrar, a primeira etapa inverteu as letras dentro de cada trecho contínuo de A a Z. Espaços e sinais separam trechos e ficam no lugar. Por exemplo, "SOL, LUA!" vira "LOS, AUL!" nessa etapa.',
      'Só depois veio o giro do terceiro portão: 2 mais o número do bloco. O contador de letras começou em zero e continuou do início ao fim do recado.',
      'Crie uma função para lidar com a inversão dos trechos. Combine-a com a função que seu grupo já escreveu para o terceiro portão e use o programa para recuperar a frase inteira.'
    ],
    concept: {
      title: 'Duas funções, duas ordens possíveis',
      text: 'O resultado de uma função pode entrar na próxima. Quando uma etapa muda a posição das letras e a outra usa essa posição em uma conta, vale testar o que acontece ao trocar a ordem.'
    },
    hints: [
      {
        title: 'Qual camada está por fora?',
        text: 'Escreva os dois passos da cifra em dois cartões. Qual deles produziu diretamente o texto que você está vendo? Use uma palavra curta para comparar as duas ordens.'
      },
      {
        title: 'Como guardar um trecho?',
        text: 'Ao percorrer o texto, experimente juntar as letras de A a Z até encontrar um separador. Um trecho pode virar vetor de caracteres, mudar de ordem e voltar a ser string. Veja também o que acontece quando a frase termina em letra.'
      },
      {
        title: 'E se o giro for grande?',
        text: 'Este recado tem mais de 100 letras, então o deslocamento passa de 26. Uma volta completa tem 26 letras: compare um teste com deslocamento 27 e outro com deslocamento 1 e confira se sua função trata voltas completas.'
      }
    ],
    retry: 'Confiram a ordem das camadas e se o contador de letras seguiu do início ao fim do recado.',
    links: [
      { label: 'String.split()', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/split' },
      { label: 'Array.reverse()', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse' },
      { label: 'Array.join()', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/join' }
    ]
  }
];
