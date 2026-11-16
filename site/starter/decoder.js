function decodificar(mensagem) {
  // Build your decoder here and return the decoded text.
  return "";
}

const formulario = document.querySelector("#formulario");
const cifra = document.querySelector("#cifra");
const resultado = document.querySelector("#resultado");
const estado = document.querySelector("#estado");

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  resultado.textContent = "";

  if (cifra.value.trim() === "") {
    estado.textContent = "Cole uma mensagem cifrada antes de executar.";
    cifra.focus();
    return;
  }

  let texto;
  try {
    texto = decodificar(cifra.value);
  } catch (erro) {
    estado.textContent = "Sua função parou com um erro. Abra o Console do navegador para localizar a linha.";
    console.error(erro);
    return;
  }

  if (typeof texto !== "string" || texto.trim() === "") {
    estado.textContent = "A saída está vazia. Faça a função decodificar retornar uma string com texto.";
    return;
  }

  resultado.textContent = texto;
  estado.textContent = "Saída pronta. Copie o texto acima e confira no portão.";
});
