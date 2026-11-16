// Este é o arquivo de vocês. Escrevam o código das quatro funções abaixo.
// O arquivo kit.js liga a página às funções; não precisam mexer nele.
// Salvem o arquivo e recarreguem index.html no navegador para testar.
//
// Lembrete: vocês DECODIFICAM, então as letras andam para TRÁS no alfabeto.
// Só as letras de A a Z mudam. Espaços e pontuação ficam como estão.

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Portão 1 - A roda de César
function decodificarPortao1(mensagem) {
  // TODO: toda letra foi empurrada 3 casas para a frente. Voltem 3 casas.
  // Dica: depois do A vem o Z de novo (a roda dá a volta).
  return "";
}

// Portão 2 - A chave que se repete
function decodificarPortao2(mensagem) {
  // TODO: a chave é [2, 5, 1] e se repete: letra 0 usa 2, letra 1 usa 5,
  // letra 2 usa 1, letra 3 usa 2 de novo...
  // Dica: o contador só anda quando a letra é de A a Z.
  return "";
}

// Portão 3 - A marcha dos blocos
function decodificarPortao3(mensagem) {
  // TODO: o deslocamento é 2 + Math.floor(posicaoDaLetra / 4).
  // Contem só as letras, começando em 0. A cada 4 letras, o passo cresce 1.
  return "";
}

// Portão 4 - O recado em duas camadas
function decodificarPortao4(mensagem) {
  // TODO: duas camadas. Primeiro desfaçam o deslocamento do portão 3.
  // Depois invertam cada trecho contínuo de letras A-Z (palavra por palavra).
  // Dica: reaproveitem decodificarPortao3.
  return "";
}

// Esta função já está pronta: ela escolhe qual portão usar.
function decodificar(mensagem, portao) {
  if (portao === 1) return decodificarPortao1(mensagem);
  if (portao === 2) return decodificarPortao2(mensagem);
  if (portao === 3) return decodificarPortao3(mensagem);
  if (portao === 4) return decodificarPortao4(mensagem);
  return "";
}
