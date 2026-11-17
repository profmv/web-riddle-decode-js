// Kit da Estação Cifra: liga a página às funções do decoder.js.
// Estudantes não precisam mexer neste arquivo.

// Wrapped in a function so names declared at the top level of decoder.js
// (for example "cifra" or "resultado") cannot collide with the names below.
(function () {
  'use strict';

  const CHAVE_PORTAO = "estacao-cifra:kit-portao";
  const CHAVE_CIFRA = "estacao-cifra:kit-cifra:";

  const formulario = document.querySelector("#formulario");
  const portaoSelect = document.querySelector("#portao");
  const cifra = document.querySelector("#cifra");
  const resultado = document.querySelector("#resultado");
  const estado = document.querySelector("#estado");

  function mostrarEstado(texto, aviso) {
    estado.textContent = texto;
    estado.classList.toggle("aviso", Boolean(aviso));
  }

  // Lembra a mensagem cifrada de cada portão (se o navegador permitir).
  function restaurarCifra() {
    try {
      cifra.value = localStorage.getItem(CHAVE_CIFRA + portaoSelect.value) || "";
    } catch (erro) {
      // Sem localStorage: segue sem lembrar a mensagem.
    }
  }

  // Lembra o último portão escolhido (se o navegador permitir).
  try {
    const salvo = localStorage.getItem(CHAVE_PORTAO);
    if (["1", "2", "3", "4"].includes(salvo)) {
      portaoSelect.value = salvo;
    }
  } catch (erro) {
    // Sem localStorage: segue sem lembrar o portão.
  }

  restaurarCifra();

  portaoSelect.addEventListener("change", () => {
    try {
      localStorage.setItem(CHAVE_PORTAO, portaoSelect.value);
    } catch (erro) {
      // Sem localStorage: segue sem lembrar o portão.
    }
    resultado.textContent = "";
    restaurarCifra();
  });

  cifra.addEventListener("input", () => {
    try {
      localStorage.setItem(CHAVE_CIFRA + portaoSelect.value, cifra.value);
    } catch (erro) {
      // Sem localStorage: segue sem lembrar a mensagem.
    }
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    resultado.textContent = "";

    const portao = Number(portaoSelect.value);
    const nomeFuncao = "decodificarPortao" + portao;

    if (cifra.value.trim() === "") {
      mostrarEstado("Cole uma mensagem cifrada antes de executar.", false);
      cifra.focus();
      return;
    }

    // typeof is safe even if decoder.js failed to load or has a syntax error.
    if (typeof decodificar !== "function") {
      mostrarEstado("Não achei a função decodificar. Confira se o decoder.js está na mesma pasta e sem erro de digitação. O Console do navegador (F12 ou Ctrl+Shift+J, aba Console) mostra o erro.", true);
      return;
    }

    let texto;
    try {
      texto = decodificar(cifra.value, portao);
    } catch (erro) {
      mostrarEstado("Sua função parou com um erro. Abra o Console do navegador (F12 ou Ctrl+Shift+J, aba Console) para localizar a linha.", true);
      console.error(erro);
      return;
    }

    if (typeof texto !== "string" || texto.trim() === "") {
      mostrarEstado("A saída está vazia. Faça a função " + nomeFuncao + " retornar uma string com texto.", true);
      return;
    }

    resultado.textContent = texto;

    if (/undefined|NaN/.test(texto)) {
      mostrarEstado("Atenção: a saída tem undefined ou NaN. Alguma conta levou a posição para fora do alfabeto. Imprima a posição com console.log e veja no Console do navegador (F12 ou Ctrl+Shift+J, aba Console) para achar o erro.", true);
    } else if (texto === cifra.value) {
      mostrarEstado("Atenção: a saída está igual à mensagem cifrada. Sua função " + nomeFuncao + " ainda não decodificou nada.", true);
    } else {
      mostrarEstado("Saída pronta. Copie o texto acima e confira no portão.", false);
    }
  });
})();
