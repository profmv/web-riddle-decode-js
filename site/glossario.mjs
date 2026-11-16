// Inline glossary: wraps the first use of a term in a button that opens a small paper-slip popover.
// Student-facing text stays in Brazilian Portuguese; code and comments stay in English.

export const GLOSSARY = [
  {
    term: 'String',
    match: ['string', 'strings'],
    text: 'Um texto em JavaScript: uma sequência de caracteres entre aspas.',
    code: 'const nome = "SOL"'
  },
  {
    term: 'Vetor',
    match: ['vetor', 'vetores'],
    text: 'Uma lista de valores guardada em uma só variável, escrita entre colchetes.',
    code: 'const chave = [2, 5, 1]'
  },
  {
    term: 'Índice',
    match: ['índice', 'índices'],
    text: 'A posição de um item em uma sequência. A contagem começa no zero, não no um.',
    code: 'const lista = ["a", "b"]\nlista[0] // "a"'
  },
  {
    term: 'Laço',
    match: ['laço', 'laços'],
    text: 'Um trecho de código que se repete, por exemplo uma vez para cada letra do texto.',
    code: 'for (const letra of "SOL") {\n  console.log(letra)\n}'
  },
  {
    term: 'Função',
    match: ['função', 'funções'],
    text: 'Um trecho de código com nome que recebe valores e devolve um resultado. Você escreve uma vez e usa quantas vezes quiser.',
    code: 'function dobro(n) {\n  return n * 2\n}'
  },
  {
    term: 'Deslocamento',
    match: ['deslocamento', 'deslocamentos'],
    text: 'Quantas posições a letra anda no alfabeto. Voltar com deslocamento 3 transforma D em A.'
  },
  {
    term: 'Resto da divisão',
    match: ['resto fica'],
    text: 'O operador % devolve o que sobra de uma divisão. Em 7 % 3 o resultado é 1, porque 7 = 2 x 3 + 1.',
    code: '7 % 3 // 1'
  },
  {
    term: 'Math.floor()',
    match: ['Math.floor()'],
    text: 'Arredonda um número para baixo, até o inteiro menor ou igual a ele. Math.floor(2.9) dá 2.',
    code: 'Math.floor(7 / 4) // 1'
  },
  {
    term: 'indexOf',
    match: ['indexOf'],
    text: 'Método de string que devolve a posição de um caractere, ou -1 se ele não existir.',
    code: '"ABC".indexOf("B") // 1'
  },
  {
    term: 'Contador',
    match: ['contador'],
    text: 'Uma variável que começa em um valor e aumenta aos poucos, para registrar quantas vezes algo aconteceu.',
    code: 'let contador = 0\ncontador++'
  },
  {
    term: 'Caractere',
    match: ['caractere', 'caracteres'],
    text: 'Um símbolo do texto: uma letra, um espaço ou um sinal de pontuação.'
  },
  {
    term: 'Bloco',
    match: ['bloco', 'blocos'],
    text: 'Aqui, um grupo de quatro letras seguidas que usam o mesmo acréscimo de deslocamento, como no terceiro portão.'
  },
  {
    term: 'Arredondar',
    match: ['arredondar', 'arredonde'],
    text: 'Trocar um número pelo inteiro vizinho. Arredondar para baixo é ficar com o menor: 2,9 vira 2.'
  },
  {
    term: 'Cifra',
    match: ['cifra', 'cifrar', 'cifrado'],
    text: 'Uma regra para esconder uma mensagem. Cifrar é aplicar a regra; decodificar é desfazê-la.'
  },
  {
    term: 'Decodificar',
    match: ['decodificar', 'decodificação'],
    text: 'Desfazer a cifra para recuperar a mensagem original.'
  },
  {
    term: 'Método',
    match: ['método', 'métodos'],
    text: 'Uma função que pertence a um tipo de dado e é chamada com um ponto depois do valor.',
    code: '"sol".toUpperCase() // "SOL"'
  }
];

const POPOVER_ID = 'glossario-pop';
const SKIP = 'code, pre, a, button, summary, .term, [data-no-glossary]';
const GAP = 6;
const MARGIN = 12;
const CLOSE_DELAY = 160;

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word match: the neighbours must not be letters, digits or underscores.
const patterns = GLOSSARY.map(entry => {
  const forms = [...entry.match].sort((a, b) => b.length - a.length).map(escapeRegExp);
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${forms.join('|')})(?![\\p{L}\\p{N}_])`, 'iu');
});

function termKey(index) {
  return String(index);
}

function collectTextNodes(roots) {
  const nodes = [];
  for (const root of roots) {
    if (!root) continue;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        return parent && parent.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
  }
  return nodes;
}

function makeButton(text, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'term';
  button.dataset.term = termKey(index);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', POPOVER_ID);
  button.textContent = text;
  return button;
}

/**
 * Wraps the first occurrence of each glossary term (per call, across all roots) in a term button.
 * Safe to call again: existing term buttons are kept and their terms are not wrapped twice.
 */
export function linkTerms(roots) {
  if (typeof document === 'undefined') return;
  const list = (Array.isArray(roots) ? roots : [roots]).filter(Boolean);
  ensurePopover();

  const done = new Set();
  for (const root of list) {
    for (const existing of root.querySelectorAll('.term')) done.add(existing.dataset.term);
  }

  for (const node of collectTextNodes(list)) {
    if (done.size === GLOSSARY.length) break;
    let current = node;
    while (current) {
      let best = null;
      patterns.forEach((pattern, index) => {
        if (done.has(termKey(index))) return;
        const found = pattern.exec(current.nodeValue);
        if (found && (!best || found.index < best.found.index)) best = { found, index };
      });
      if (!best) break;
      const { found, index } = best;
      const matched = current.splitText(found.index);
      const rest = matched.splitText(found[0].length);
      const button = makeButton(found[0], index);
      matched.replaceWith(button);
      done.add(termKey(index));
      current = rest.nodeValue ? rest : null;
    }
  }
}

// Shared popover state (one open at a time).
let popover = null;
let openButton = null;
let closeTimer = 0;
let wasOpenOnPointerDown = false;
let lastPointerType = 'mouse';
let listening = false;

function ensurePopover() {
  if (popover && popover.isConnected) return;
  popover = document.createElement('div');
  popover.id = POPOVER_ID;
  popover.className = 'term-pop';
  popover.setAttribute('role', 'tooltip');
  popover.dataset.open = 'false';
  document.body.append(popover);
  if (!listening) {
    listening = true;
    bindEvents();
  }
}

function fillPopover(index) {
  const entry = GLOSSARY[index];
  const title = document.createElement('strong');
  title.className = 'term-pop-title';
  title.textContent = entry.term;
  const text = document.createElement('span');
  text.className = 'term-pop-text';
  text.textContent = entry.text;
  popover.replaceChildren(title, text);
  if (entry.code) {
    const pre = document.createElement('pre');
    pre.className = 'term-pop-code';
    const code = document.createElement('code');
    code.textContent = entry.code;
    pre.append(code);
    popover.append(pre);
  }
}

function place(button) {
  const rects = button.getClientRects();
  if (!rects.length) return false;
  const first = rects[0];
  const last = rects[rects.length - 1];
  const viewW = document.documentElement.clientWidth;
  const viewH = window.innerHeight;
  if (last.bottom < 0 || first.top > viewH) return false;

  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  let left = first.left;
  left = Math.min(left, viewW - width - MARGIN);
  left = Math.max(left, MARGIN);

  const roomBelow = viewH - last.bottom;
  const below = roomBelow >= height + GAP || roomBelow >= first.top;
  const top = below ? last.bottom + GAP : first.top - height - GAP;
  popover.style.left = `${Math.round(left)}px`;
  popover.style.top = `${Math.round(Math.max(MARGIN / 2, top))}px`;
  popover.dataset.side = below ? 'below' : 'above';
  return true;
}

function openTerm(button) {
  clearTimeout(closeTimer);
  if (openButton === button) return;
  if (openButton) closeTerm(true);
  ensurePopover();
  fillPopover(Number(button.dataset.term));
  popover.dataset.open = 'true';
  if (!place(button)) {
    popover.dataset.open = 'false';
    return;
  }
  openButton = button;
  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-describedby', POPOVER_ID);
}

function closeTerm(immediate = false) {
  clearTimeout(closeTimer);
  if (!openButton) return;
  openButton.setAttribute('aria-expanded', 'false');
  openButton.removeAttribute('aria-describedby');
  openButton = null;
  popover.dataset.open = 'false';
  if (immediate) popover.dataset.instant = 'true';
  else delete popover.dataset.instant;
}

function scheduleClose() {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => closeTerm(), CLOSE_DELAY);
}

function termFrom(target) {
  return target instanceof Element ? target.closest('.term') : null;
}

function reposition() {
  if (openButton && (!openButton.isConnected || !place(openButton))) closeTerm(true);
}

function bindEvents() {
  document.addEventListener('mouseover', event => {
    const button = termFrom(event.target);
    if (button) openTerm(button);
    else if (popover.contains(event.target)) clearTimeout(closeTimer);
  });
  document.addEventListener('mouseout', event => {
    const leaving = termFrom(event.target) || (popover.contains(event.target) ? popover : null);
    if (!leaving || !openButton) return;
    const into = event.relatedTarget;
    if (into instanceof Node && (leaving.contains(into) || popover.contains(into) || termFrom(into) === openButton)) return;
    // Keep it open while the term itself has keyboard focus.
    if (document.activeElement === openButton && leaving !== popover) return;
    scheduleClose();
  });
  document.addEventListener('focusin', event => {
    const button = termFrom(event.target);
    if (button) openTerm(button);
  });
  document.addEventListener('focusout', event => {
    if (termFrom(event.target) && openButton === termFrom(event.target)) scheduleClose();
  });
  document.addEventListener('pointerdown', event => {
    const button = termFrom(event.target);
    wasOpenOnPointerDown = Boolean(button && button === openButton);
    if (!button && openButton && !popover.contains(event.target)) closeTerm();
  });
  document.addEventListener('click', event => {
    const button = termFrom(event.target);
    if (!button) return;
    // Touch taps toggle; mouse and keyboard activation keep the popover open.
    if (wasOpenOnPointerDown && event.detail > 0 && lastPointerType === 'touch') closeTerm();
    else openTerm(button);
    wasOpenOnPointerDown = false;
  });
  document.addEventListener('pointerdown', event => {
    lastPointerType = event.pointerType;
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && openButton) closeTerm();
  });
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, { capture: true, passive: true });
}
