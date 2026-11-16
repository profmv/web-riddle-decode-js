// =====================================================================
// MINHA CIFRA - arquivo da dupla (ou trio)
// =====================================================================
// Aqui vocês criam a cifra própria do desafio final.
//
// O que já vem pronto:
//   - ALFABETO, prepararTexto e deslocarLetra (podem usar à vontade);
//   - o arquivo painel.js, que liga esta página aos botões.
//
// O que falta fazer (procurem os TODO):
//   1. chaveParaPassos: transformar a chave em uma lista de números;
//   2. cifrar: embaralhar o texto seguindo a regra de vocês;
//   3. decifrar: desfazer exatamente o que cifrar fez.
//
// Como testar: salve o arquivo, atualize a aba do navegador e use o
// botão "Testar ida e volta". Se algo der errado, abra o Console
// (F12) para ver a mensagem de erro.
// =====================================================================

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// PRONTA: deixa o texto em MAIÚSCULAS e sem acentos.
// "Ação" vira "ACAO". Use antes de cifrar, se quiser simplificar.
function prepararTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

// PRONTA: desloca UMA letra no alfabeto.
// Funciona com passos negativos e muito grandes, e deixa intactos
// espaços, números e pontuação.
//   deslocarLetra("Z", 1)  -> "A"
//   deslocarLetra("A", -1) -> "Z"
//   deslocarLetra("!", 3)  -> "!"
function deslocarLetra(letra, passos) {
  const posicao = ALFABETO.indexOf(letra);
  if (posicao === -1) {
    return letra;
  }
  const novaPosicao = (posicao + (((passos % 26) + 26) % 26)) % 26;
  return ALFABETO[novaPosicao];
}

// INCOMPLETA: transforma a chave em uma lista de passos.
// A posição de cada letra no alfabeto (A = 0, B = 1, ...) é um passo.
//   chaveParaPassos("SOL") deve devolver [18, 14, 11]
function chaveParaPassos(chave) {
  // TODO 1: deixe a chave pronta com prepararTexto(chave).
  // TODO 2: percorra as letras da chave e use ALFABETO.indexOf(letra).
  // TODO 3: ignore o que não for letra (indexOf devolve -1).
  // TODO 4: se a chave ficar vazia, devolva [0] para não quebrar.
  return [];
}

// INCOMPLETA: transforma o texto em mensagem cifrada.
function cifrar(texto, chave) {
  const limpo = prepararTexto(texto);
  const passos = chaveParaPassos(chave);
  let resultado = "";

  // TODO 1: percorram o texto limpo, caractere por caractere
  //         (um for com índice ajuda a saber a posição).
  // TODO 2: decidam quantos passos cada letra anda, usando a chave
  //         (dica: passos[i % passos.length] repete a chave em ciclo).
  // TODO 3: preservem espaços e pontuação: só letras mudam, e
  //         deslocarLetra já deixa o resto como está.
  // TODO 4: acumulem cada caractere novo em "resultado".

  return resultado === "" ? "" : resultado;
}

// INCOMPLETA: devolve a mensagem cifrada ao texto original.
function decifrar(texto, chave) {
  const limpo = prepararTexto(texto);
  const passos = chaveParaPassos(chave);
  let resultado = "";

  // TODO: façam o caminho contrário, na ordem inversa das camadas.
  // Se cifrar andou para frente, decifrar anda para trás. Se cifrar
  // aplicou a camada A e depois a camada B, decifrar desfaz primeiro
  // a B e só depois a A (como tirar meias e sapatos: ao contrário de
  // como se colocou).

  return resultado === "" ? "" : resultado;
}

// =====================================================================
// Ideias para ir além (para quem terminar cedo)
// =====================================================================
// - Atbash: troque A por Z, B por Y, C por X... (não precisa de chave).
// - Passos diferentes por palavra: a palavra 1 anda 1, a 2 anda 2...
// - Duas camadas: primeiro um deslocamento, depois inverter cada palavra.
// - Trocar letras vizinhas em pares: "CASA" vira "ACAS".
// - Converter letras em números (A = 1, B = 2...) e decifrar de volta.
// - Aceitar chaves com números, como "3" ou "SOL7".
// - Preservar acentos e maiúsculas em vez de usar prepararTexto.
// - Mostrar no painel quantas letras a mensagem tem.
// - Escrever mais testes: texto vazio, só pontuação, letra Z, chave longa.
// - Criar uma função quebrar() que tenta todas as chaves de 0 a 25.
// =====================================================================
