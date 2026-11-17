import { GATE_GUIDES } from './gates.js';
import { PUZZLES } from './puzzles.mjs';
import { answerDigest, normalizeAnswer, readProgress } from './validation.mjs';
import { createWheel } from './wheel.mjs';
import { encodeResult } from './codigo.mjs';
import { linkTerms } from './glossario.mjs';

const total = GATE_GUIDES.length;
const storageKey = 'estacao-cifra:gate:v1';
const statsKey = 'estacao-cifra:stats:v1';
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

const SVG_NS = 'http://www.w3.org/2000/svg';

let stage = 0;
let view = 0;
let checking = false;
let lastOpened = -1;
let freshStamp = false;
let enterTimer = 0;
let enterTarget = null;
let celebrate = false;
let legacyStats = false;
// Per gate: wrong attempts and the set of hint indexes opened while the gate was current.
let stats = emptyStats();

function emptyStats() {
  return { wrong: Array(total).fill(0), hints: Array.from({ length: total }, () => []) };
}

// Accepts missing or corrupt JSON; hints may be index arrays or plain counts.
function parseStats(raw) {
  const result = emptyStats();
  try {
    const data = JSON.parse(raw);
    for (let i = 0; i < total; i += 1) {
      const wrong = Math.trunc(Number(data.wrong[i]));
      if (Number.isFinite(wrong) && wrong > 0) result.wrong[i] = wrong;
      const hints = data.hints[i];
      if (Array.isArray(hints)) {
        result.hints[i] = [...new Set(hints.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < 50))];
      } else if (Number.isInteger(hints) && hints > 0) {
        result.hints[i] = Array.from({ length: Math.min(hints, 50) }, (_, n) => n);
      }
    }
  } catch {
    return emptyStats();
  }
  return result;
}

function element(tag, value) {
  const item = document.createElement(tag);
  if (value !== undefined) item.textContent = value;
  return item;
}

// Decorative icon from the inline sprite in index.html; the text next to it carries the meaning.
function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', `icon icon-${name}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

function setLabel(target, name, text) {
  target.replaceChildren(icon(name), element('span', text));
}

function announce(text = '') {
  if (text) setLabel(announcement, 'stamp', text);
  else announcement.replaceChildren();
}

// Restarts a one-shot CSS animation class on an element.
function replay(target, className) {
  target.classList.remove(className);
  void target.offsetWidth;
  target.classList.add(className);
}

function enter(target) {
  clearTimeout(enterTimer);
  if (enterTarget && enterTarget !== target) enterTarget.classList.remove('is-entering');
  enterTarget = target;
  replay(target, 'is-entering');
  enterTimer = setTimeout(() => target.classList.remove('is-entering'), 700);
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
    const state = element('small');
    setLabel(state, { open: 'check', current: 'route', locked: 'dash' }[button.dataset.state], status);
    label.append(element('b', `Portão ${index + 1}`), state);
    button.append(number, label);
    button.addEventListener('click', () => openView(index));
    const entry = element('li');
    entry.append(button);
    if (index === lastOpened && index < stage) {
      const stamp = element('span', 'Aberto');
      stamp.className = freshStamp ? 'route-stamp is-new' : 'route-stamp';
      stamp.setAttribute('aria-hidden', 'true');
      entry.append(stamp);
    }
    return entry;
  });
  route.replaceChildren(...entries);
  freshStamp = false;
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
  setLabel(byId('copy'), 'copy', 'Copiar mensagem');

  byId('instructions').replaceChildren(...guide.instructions.map(line => element('li', line)));
  const hintGate = view;
  byId('hints').replaceChildren(...guide.hints.map(({ title, text, code }, hintIndex) => {
    const hint = element('details');
    hint.addEventListener('toggle', () => {
      // Only hints opened on the current gate count; reviewing old gates does not.
      if (!hint.open || hintGate !== stage || stage === total) return;
      if (stats.hints[hintGate].includes(hintIndex)) return;
      stats.hints[hintGate].push(hintIndex);
      saveStats();
    });
    const body = element('div');
    body.className = 'hint-body';
    body.append(element('p', text));
    if (code) {
      const snippet = element('pre');
      snippet.append(element('code', code));
      body.append(snippet);
    }
    const summary = element('summary');
    summary.append(icon('hint'), ' ', element('span', title));
    hint.append(summary, body);
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
    link.append(' ', icon('external'), note);
    item.append(link);
    return item;
  }));

  answerForm.reset();
  answer.style.height = '';
  answer.removeAttribute('aria-invalid');
  answerStatus.textContent = '';
  // A hidden form never fires animationend, so drop one-shot classes here.
  answer.classList.remove('is-wrong');
  answerStatus.classList.remove('is-fresh');
  answerForm.hidden = reviewing;
  byId('review').hidden = !reviewing;
  setLabel(byId('return'), 'back', stage === total ? 'Voltar ao encerramento' : 'Voltar ao portão atual');
  linkTerms([byId('gate-brief'), byId('concept-text'), byId('instructions'), byId('hints')]);
}

function openView(index, { focus = true } = {}) {
  if (checking || index > stage) return;
  view = index;
  announce();
  renderRoute();
  workbench.hidden = view === total;
  completion.hidden = view !== total;
  completion.classList.remove('is-celebrating');
  if (view !== total) renderGate();
  else {
    wheel.stop();
    renderCompletion();
  }
  if (focus) byId(view === total ? 'completion-title' : 'gate-title').focus();
}

function storageUnavailable() {
  byId('storage-note').textContent = 'O navegador bloqueou o salvamento. Mantenham esta aba aberta para continuar.';
}

function saveStage(value = stage) {
  try {
    localStorage.setItem(storageKey, String(value));
  } catch {
    storageUnavailable();
  }
}

function saveStats() {
  try {
    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch {
    storageUnavailable();
  }
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

function renderCompletion() {
  const counts = stats.hints.map(list => list.length);
  byId('summary-list').replaceChildren(...GATE_GUIDES.map((_, index) => {
    const item = element('li');
    item.append(
      element('b', `Portão ${index + 1}`),
      element('span', plural(stats.wrong[index], 'erro', 'erros')),
      element('span', plural(counts[index], 'dica aberta', 'dicas abertas')),
    );
    return item;
  }));
  const wrongTotal = stats.wrong.reduce((sum, n) => sum + n, 0);
  const hintTotal = counts.reduce((sum, n) => sum + n, 0);
  byId('summary-total').textContent = wrongTotal + hintTotal === 0
    ? (legacyStats
      ? 'Parte do percurso foi feita antes do registro de erros e dicas; os números podem estar incompletos.'
      : 'Nenhum erro e nenhuma dica: a equipe decifrou tudo de primeira!')
    : `No total: ${plural(wrongTotal, 'erro', 'erros')} e ${plural(hintTotal, 'dica aberta', 'dicas abertas')}. Errar e pedir ajuda fazem parte de decifrar: cada tentativa ensinou algo.`;
  byId('completion-code').textContent = encodeResult({ wrong: stats.wrong, hints: counts });
  const codeStatus = byId('code-status');
  codeStatus.textContent = '';
  codeStatus.classList.add('sr-only');
  setLabel(byId('copy-code'), 'copy', 'Copiar código');
  if (celebrate) {
    celebrate = false;
    replay(completion, 'is-celebrating');
  }
}

async function copyCode() {
  const code = byId('completion-code');
  const status = byId('code-status');
  try {
    await navigator.clipboard.writeText(code.textContent);
    setLabel(byId('copy-code'), 'check', 'Código copiado');
    status.classList.add('sr-only');
    status.textContent = 'Código copiado. Mostrem ou enviem o código com o nome da equipe.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.classList.remove('sr-only');
    status.textContent = 'Código selecionado. Use Ctrl+C ou o menu de cópia.';
  }
}

const SCRAMBLE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const randomLetter = () => SCRAMBLE_LETTERS[Math.floor(Math.random() * SCRAMBLE_LETTERS.length)];

// Turns the ciphertext into the typed text, left to right. The text comes only from the textarea value.
function decipher(plain) {
  const finalChars = Array.from(plain);
  const startChars = Array.from(ciphertext.textContent);
  ciphertext.setAttribute('aria-hidden', 'true');
  ciphertext.setAttribute('aria-busy', 'true');
  const finish = () => {
    ciphertext.textContent = plain;
    ciphertext.removeAttribute('aria-hidden');
    ciphertext.removeAttribute('aria-busy');
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ciphertext.textContent = plain;
    return new Promise(resolve => setTimeout(() => { finish(); resolve(); }, 400));
  }
  const duration = 1200;
  const settle = 300; // each letter scrambles for this long (3 steps) before it settles
  const step = settle / 3;
  const count = Math.max(finalChars.length, 1);
  const isLetter = char => /\p{L}/u.test(char);
  const picks = finalChars.map(() => [randomLetter(), randomLetter(), randomLetter()]);
  return new Promise(resolve => {
    const begin = performance.now();
    const frame = now => {
      const elapsed = now - begin;
      if (elapsed >= duration) {
        finish();
        resolve();
        return;
      }
      ciphertext.textContent = finalChars.map((char, index) => {
        if (!isLetter(char)) return char;
        const from = (index / count) * (duration - settle);
        const local = elapsed - from;
        if (local >= settle) return char;
        if (local < 0) return startChars[index] ?? picks[index][0];
        return picks[index][Math.min(2, Math.floor(local / step))];
      }).join('');
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

async function copyCiphertext() {
  const copiedView = view;
  try {
    await navigator.clipboard.writeText(ciphertext.textContent);
    if (view !== copiedView) return;
    setLabel(byId('copy'), 'check', 'Mensagem copiada');
    copyStatus.classList.add('sr-only');
    copyStatus.textContent = 'Mensagem copiada. Colem no campo "Mensagem cifrada" da página do kit.';
  } catch {
    if (view !== copiedView) return;
    const range = document.createRange();
    range.selectNodeContents(ciphertext);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.classList.remove('sr-only');
    copyStatus.textContent = 'Mensagem selecionada. Copiem com Ctrl+C ou o menu de cópia e colem no campo "Mensagem cifrada" da página do kit.';
  }
}

function showAnswerError(message) {
  answerStatus.textContent = message;
  answer.setAttribute('aria-invalid', 'true');
  replay(answer, 'is-wrong');
  replay(answerStatus, 'is-fresh');
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

function unlockChecking() {
  checking = false;
  submit.disabled = false;
  reset.disabled = false;
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
    if (!matches) {
      stats.wrong[stage] += 1;
      saveStats();
      showAnswerError(await explainMismatch(value));
    }
  } catch {
    answerStatus.textContent = 'O navegador não conseguiu conferir a mensagem. Atualizem a página e tentem novamente.';
    answer.focus();
  } finally {
    // On a match the controls stay locked until the decipher animation ends.
    if (!matches) unlockChecking();
  }

  if (matches) {
    // Persist first so a refresh during the animation keeps the gate open.
    saveStage(stage + 1);
    try {
      await decipher(value.trim());
    } finally {
      unlockChecking();
    }
    stage += 1;
    lastOpened = stage - 1;
    freshStamp = true;
    celebrate = stage === total;
    openView(stage);
    enter(stage === total ? completion : workbench);
    announce(`Portão ${stage} aberto!${stage < total ? ' Troquem os papéis na equipe e sigam para o próximo.' : ''}`);
  }
}

function start() {
  if (!globalThis.crypto?.subtle) {
    bootStatus.textContent = 'Abra a atividade pelo GitHub Pages ou pelo servidor local para conferir as mensagens.';
    return;
  }
  try {
    stage = readProgress(localStorage.getItem(storageKey), total);
    const rawStats = localStorage.getItem(statsKey);
    stats = parseStats(rawStats);
    // Progress saved before stats existed: the zero counts are unknown, not real.
    legacyStats = stage > 0 && rawStats === null;
  } catch {
    storageUnavailable();
  }
  byId('copy').addEventListener('click', copyCiphertext);
  byId('copy-code').addEventListener('click', copyCode);
  answerForm.addEventListener('submit', checkAnswer);
  answer.addEventListener('animationend', () => answer.classList.remove('is-wrong'));
  answerStatus.addEventListener('animationend', () => answerStatus.classList.remove('is-fresh'));
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
    lastOpened = -1;
    stats = emptyStats();
    legacyStats = false;
    saveStage();
    saveStats();
    openView(stage);
    announce('Percurso reiniciado.');
  });
  openView(stage, { focus: false });
  bootStatus.hidden = true;
  game.hidden = false;
}

start();
