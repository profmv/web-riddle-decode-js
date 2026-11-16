// =====================================================================
// PAINEL - liga a página aos botões. Já está pronto.
// Quem quiser pode melhorar, mas o desafio principal fica em cifra.js.
// Nada é guardado no navegador: ao fechar a aba, tudo some.
// =====================================================================

(function () {
  "use strict";

  const campoTexto = document.getElementById("texto");
  const campoChave = document.getElementById("chave");
  const saida = document.getElementById("resultado");
  const estado = document.getElementById("estado");

  // Mostra uma mensagem de estado. tipo: "ok", "aviso" ou "erro".
  function avisar(mensagem, tipo) {
    estado.textContent = mensagem;
    estado.dataset.tipo = tipo || "";
  }

  // Normaliza o texto como o seu programa faz, se prepararTexto existir.
  function normalizar(texto) {
    return typeof prepararTexto === "function" ? prepararTexto(texto) : texto;
  }

  // Executa uma função de cifra e devolve o texto ou null se der erro.
  function executar(nome, funcao, texto, chave) {
    try {
      return String(funcao(texto, chave));
    } catch (erro) {
      console.error(erro);
      avisar(
        "A função " + nome + " deu erro: " + erro.message +
          ". Abra o Console do navegador (F12) para ver os detalhes.",
        "erro"
      );
      return null;
    }
  }

  // Confere o resultado e devolve um aviso, ou "" se está tudo certo.
  function conferir(nome, entrada, resultado) {
    if (resultado === "") {
      return "A função " + nome + " ainda devolve texto vazio.";
    }
    if (/undefined|NaN/.test(resultado)) {
      return "O resultado de " + nome + " contém undefined ou NaN. Revisem as contas.";
    }
    if (resultado === entrada) {
      return "O resultado de " + nome + " é igual ao texto de entrada. Nada foi alterado.";
    }
    return "";
  }

  function rodar(nome, funcao) {
    const texto = campoTexto.value;
    const chave = campoChave.value;
    const resultado = executar(nome, funcao, texto, chave);
    if (resultado === null) {
      saida.textContent = "";
      return;
    }
    saida.textContent = resultado;
    const aviso = conferir(nome, texto, resultado);
    if (aviso) {
      avisar(aviso, "aviso");
    } else {
      avisar("Pronto: " + nome + " executada.", "ok");
    }
  }

  function testarIdaEVolta() {
    const texto = campoTexto.value;
    const chave = campoChave.value;
    const cifrado = executar("cifrar", cifrar, texto, chave);
    if (cifrado === null) {
      return;
    }
    const volta = executar("decifrar", decifrar, cifrado, chave);
    if (volta === null) {
      return;
    }
    const esperado = normalizar(texto);
    saida.textContent = cifrado;
    if (volta === esperado) {
      if (cifrado === "" || cifrado === esperado) {
        avisar(
          "A ida e volta fechou, mas a mensagem cifrada está vazia ou igual ao original. Faltam implementar cifrar e decifrar.",
          "aviso"
        );
      } else {
        avisar("Ida e volta correta: decifrar(cifrar(texto)) devolveu o texto.", "ok");
      }
      return;
    }
    avisar(
      "A ida e volta falhou.\nEsperado: " + esperado + "\nObtido:   " + volta,
      "erro"
    );
  }

  document.getElementById("cifrar").addEventListener("click", function () {
    rodar("cifrar", cifrar);
  });
  document.getElementById("decifrar").addEventListener("click", function () {
    rodar("decifrar", decifrar);
  });
  document.getElementById("testar").addEventListener("click", testarIdaEVolta);
})();
