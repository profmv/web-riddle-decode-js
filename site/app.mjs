import { GATE_GUIDES } from './gates.js';
import { PUZZLES } from './puzzles.mjs';
import { answerDigest, normalizeAnswer, readProgress } from './validation.mjs';
import { createWheel } from './wheel.mjs';

const total = GATE_GUIDES.length;
const storageKey = 'estacao-cifra:gate:v1';
const byId = id => document.getElementById(id);
const bootStatus = byId('boot-status');
const game = byId('game');
const route = byId('route');
const workbench = byId('workbench');
const completion = byId('completion');
const ciphertext = byId('ciphertext');
const copyStatus = byId('copy-status');
const answerForm = byId('answer-form');
const answer = byId('answer');
const answerStatus = byId('answer-status');
const submit = byId('submit');
const reset = byId('reset');
const resetDialog = byId('reset-dialog');
const announcement = byId('announcement');
const wheelFigure = byId('wheel');
const wheel = createWheel(wheelFigure);

let stage = 0;
let view = 0;
let checking = false;

function element(tag, value) {
  const item = document.createElement(tag);
  if (value !== undefined) item.textContent = value;
  return item;
}

function renderRoute() {
  const entries = GATE_GUIDES.map(({ title }, index) => {
    const button = element('button');
    button.type = 'button';
    button.className = 'route-button';
    button.disabled = index > stage;
    button.dataset.state = index < stage ? 'open' : index === stage ? 'current' : 'locked';
    if (index === view) button.setAttribute('aria-current', 'step');

    const status = { open: 'Aberto', current: 'Em curso', locked: 'Fechado' }[button.dataset.state];
    button.setAttribute('aria-label', `Portão ${index + 1}: ${title}. ${status}.`);
    const number = element('span', String(index + 1).padStart(2, '0'));
    number.className = 'route-number';
    const label = element('span');
    label.append(element('b', `Portão ${index + 1}`), element('small', status));
    button.append(number, label);
    button.addEventListener('click', () => openView(index));
    const entry = element('li');
    entry.append(button);
    return entry;
  });
  route.replaceChildren(...entries);
}

function renderGate() {
  const guide = GATE_GUIDES[view];
  const reviewing = view < stage;
  byId('gate-label').textContent = `Portão ${String(view + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  byId('gate-title').textContent = guide.title;
  byId('gate-brief').textContent = guide.brief;
  byId('gate-topic').textContent = guide.topic;
  byId('concept-title').textContent = guide.concept.title;
  byId('concept-text').textContent = guide.concept.text;
  wheelFigure.hidden = view !== 0;
  if (view === 0) wheel.start();
  else wheel.stop();
  ciphertext.textContent = PUZZLES[view].text;
  copyStatus.textContent = '';
  copyStatus.classList.add('sr-only');
  byId('copy').textContent = 'Copiar mensagem';

  byId('instructions').replaceChildren(...guide.instructions.map(line => element('li', line)));
  byId('hints').replaceChildren(...guide.hints.map(({ title, text, code }) => {
    const hint = element('details');
    const body = element('div');
    body.className = 'hint-body';
    body.append(element('p', text));
    if (code) {
      const snippet = element('pre');
      snippet.append(element('code', code));
      body.append(snippet);
    }
    hint.append(element('summary', title), body);
    return hint;
  }));
  byId('references').replaceChildren(...guide.links.map(({ label, url }) => {
    const item = element('li');
    const link = element('a', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const note = element('span', ' (abre em nova aba)');
    note.className = 'sr-only';
    link.append(note);
    item.append(link);
    return item;
  }));

  answerForm.reset();
  answer.style.height = '';
  answer.removeAttribute('aria-invalid');
  answerStatus.textContent = '';
  answerForm.hidden = reviewing;
  byId('review').hidden = !reviewing;
  byId('return').textContent = stage === total ? 'Voltar ao encerramento' : 'Voltar ao portão atual';
}

function openView(index, { focus = true } = {}) {
  if (checking || index > stage) return;
  view = index;
  announcement.textContent = '';
  renderRoute();
  workbench.hidden = view === total;
  completion.hidden = view !== total;
  if (view !== total) renderGate();
  else wheel.stop();
  if (focus) byId(view === total ? 'completion-title' : 'gate-title').focus();
}

function storageUnavailable() {
  byId('storage-note').textContent = 'O navegador bloqueou o salvamento. Mantenham esta aba aberta para continuar.';
}

function saveStage() {
  try {
    localStorage.setItem(storageKey, String(stage));
  } catch {
    storageUnavailable();
  }
}

async function copyCiphertext() {
  const copiedView = view;
  try {
    await navigator.clipboard.writeText(ciphertext.textContent);
    if (view !== copiedView) return;
    byId('copy').textContent = 'Mensagem copiada';
    copyStatus.classList.add('sr-only');
    copyStatus.textContent = 'Mensagem copiada. Cole no seu projeto do VS Code.';
  } catch {
    if (view !== copiedView) return;
    const range = document.createRange();
    range.selectNodeContents(ciphertext);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.classList.remove('sr-only');
    copyStatus.textContent = 'Mensagem selecionada. Use Ctrl+C ou o menu de cópia.';
  }
}

function showAnswerError(message) {
  answerStatus.textContent = message;
  answer.setAttribute('aria-invalid', 'true');
  answer.focus();
}

function growAnswer() {
  answer.style.height = 'auto';
  answer.style.height = `${answer.scrollHeight + 2}px`;
}

// Builds specific feedback for a wrong answer using only digests (no plaintext on the site).
async function explainMismatch(value) {
  if (/undefined|NaN/.test(value)) {
    return 'A resposta tem "undefined" ou "NaN". Alguma conta levou a posição para fora do alfabeto. Imprimam a posição com console.log para achar a linha.';
  }
  const puzzle = PUZZLES[stage];
  if (puzzle.layers) {
    const digest = await answerDigest(value);
    if (digest === puzzle.layers.order) {
      return 'As duas camadas foram desfeitas, mas na ordem trocada. Qual etapa da cifra mexeu por último no texto? Desfaçam essa primeiro.';
    }
    if (digest === puzzle.layers.noReverse) {
      return 'O giro já foi desfeito. Falta desfazer a inversão das letras dentro de cada trecho.';
    }
  }
  const words = normalizeAnswer(value).split(' ');
  const hits = await Promise.all(puzzle.words.map(async (expected, index) =>
    index < words.length && await answerDigest(`${stage}:${index}:${words[index]}`) === expected));
  const matched = hits.filter(Boolean).length;
  const parts = [`${matched} de ${puzzle.words.length} palavras conferem.`];
  if (words.length !== puzzle.words.length) {
    parts.push(`A resposta tem ${words.length} palavras e a mensagem tem ${puzzle.words.length}.`);
  } else {
    parts.push(`A primeira diferença está na palavra ${hits.indexOf(false) + 1}.`);
  }
  parts.push(matched === 0 ? 'Revisem o deslocamento e a pontuação.' : GATE_GUIDES[stage].retry);
  return parts.join(' ');
}

async function checkAnswer(event) {
  event.preventDefault();
  if (checking || view !== stage || stage === total) return;
  const value = answer.value;
  if (!normalizeAnswer(value)) {
    showAnswerError('Cole uma mensagem decifrada para testar.');
    return;
  }

  checking = true;
  submit.disabled = true;
  reset.disabled = true;
  let matches = false;
  try {
    matches = await answerDigest(value) === PUZZLES[stage].digest;
    if (!matches) showAnswerError(await explainMismatch(value));
  } catch {
    answerStatus.textContent = 'O navegador não conseguiu conferir a mensagem. Atualizem a página e tentem novamente.';
    answer.focus();
  } finally {
    checking = false;
    submit.disabled = false;
    reset.disabled = false;
  }

  if (matches) {
    stage += 1;
    saveStage();
    openView(stage);
    announcement.textContent = `Portão ${stage} aberto!${stage < total ? ' Troquem os papéis na equipe e sigam para o próximo.' : ''}`;
  }
}

function start() {
  if (!globalThis.crypto?.subtle) {
    bootStatus.textContent = 'Abra a atividade pelo GitHub Pages ou pelo servidor local para conferir as mensagens.';
    return;
  }
  try {
    stage = readProgress(localStorage.getItem(storageKey), total);
  } catch {
    storageUnavailable();
  }
  byId('copy').addEventListener('click', copyCiphertext);
  answerForm.addEventListener('submit', checkAnswer);
  answer.addEventListener('input', () => {
    growAnswer();
    answer.removeAttribute('aria-invalid');
    answerStatus.textContent = '';
  });
  byId('return').addEventListener('click', () => openView(stage));
  byId('review-final').addEventListener('click', () => openView(total - 1));
  reset.addEventListener('click', () => {
    resetDialog.returnValue = '';
    resetDialog.showModal();
  });
  resetDialog.addEventListener('close', () => {
    if (resetDialog.returnValue !== 'reset') return;
    stage = 0;
    saveStage();
    openView(stage);
    announcement.textContent = 'Percurso reiniciado.';
  });
  openView(stage, { focus: false });
  bootStatus.hidden = true;
  game.hidden = false;
}

start();
