// Teacher board: team name + completion code -> a local table of wrong attempts and hints.
// Everything stays in this browser (localStorage). The code only catches typing mistakes.
import { decodeResult, GATES } from '../codigo.mjs';

const STORAGE_KEY = 'estacao-cifra:professor:v1';
const MAX_NAME = 40;

const form = document.querySelector('#team-form');
const nameInput = document.querySelector('#team-name');
const codeInput = document.querySelector('#team-code');
const statusEl = document.querySelector('#form-status');
const summaryEl = document.querySelector('#summary');
const emptyEl = document.querySelector('#empty');
const wrapEl = document.querySelector('#table-wrap');
const rowsEl = document.querySelector('#rows');
const storageNote = document.querySelector('#storage-note');
const clearDialog = document.querySelector('#clear-dialog');

let teams = load();

function sameTeam(a, b) {
  return a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR');
}

function isValidEntry(item) {
  return item && typeof item.name === 'string' && typeof item.code === 'string' && decodeResult(item.code);
}

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(isValidEntry).map((item) => ({ name: item.name.slice(0, MAX_NAME), code: item.code }));
  } catch {
    storageNote.textContent = 'Este navegador bloqueou o armazenamento local. O quadro funciona, mas some ao fechar ou recarregar a página. Use "Imprimir" antes de sair.';
    return [];
  }
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch {
    storageNote.textContent = 'Não foi possível salvar no navegador. O quadro some ao fechar ou recarregar a página. Use "Imprimir" antes de sair.';
  }
}

function sum(list) {
  return list.reduce((total, value) => total + value, 0);
}

function say(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle('is-error', Boolean(isError));
}

function format(number) {
  return number.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function render() {
  const decoded = teams.map((team) => ({ ...team, result: decodeResult(team.code) }));
  const hasTeams = decoded.length > 0;
  emptyEl.hidden = hasTeams;
  wrapEl.hidden = !hasTeams;
  rowsEl.replaceChildren();
  summaryEl.replaceChildren();

  const avgWrong = Array(GATES).fill(0);
  const avgHints = Array(GATES).fill(0);
  if (hasTeams) {
    for (let g = 0; g < GATES; g += 1) {
      avgWrong[g] = sum(decoded.map((t) => t.result.wrong[g])) / decoded.length;
      avgHints[g] = sum(decoded.map((t) => t.result.hints[g])) / decoded.length;
    }
  }
  const worst = Math.max(...avgWrong);
  const hardest = hasTeams && worst > 0 ? avgWrong.map((v) => v === worst) : Array(GATES).fill(false);

  decoded.forEach((team, index) => {
    const row = document.createElement('tr');
    row.append(Object.assign(el('th', team.name), { scope: 'row' }));
    for (let g = 0; g < GATES; g += 1) {
      const cell = el('td', `${team.result.wrong[g]} / ${team.result.hints[g]}`);
      if (hardest[g]) cell.className = 'is-hardest';
      row.append(cell);
    }
    row.append(el('td', String(sum(team.result.wrong))), el('td', String(sum(team.result.hints))));
    const action = document.createElement('td');
    const button = el('button', 'Remover', 'button button-small row-remove');
    button.type = 'button';
    button.setAttribute('aria-label', `Remover a equipe ${team.name}`);
    button.addEventListener('click', () => removeTeam(index));
    action.append(button);
    row.append(action);
    rowsEl.append(row);
  });

  const count = decoded.length;
  summaryEl.append(el('p', count === 1 ? '1 equipe concluiu.' : `${count} equipes concluíram.`));
  if (!hasTeams) return;

  const list = el('ul', undefined, 'gate-avg');
  for (let g = 0; g < GATES; g += 1) {
    const item = document.createElement('li');
    if (hardest[g]) item.className = 'is-hardest';
    item.append(el('b', `Portão ${g + 1}`));
    const line = el('span', undefined, 'num');
    line.textContent = `erros: ${format(avgWrong[g])} | dicas: ${format(avgHints[g])}`;
    item.append(line);
    if (hardest[g]) item.append(el('span', 'Mais erros da turma', 'flag'));
    list.append(item);
  }
  const caption = el('p', 'Média por equipe, em cada portão.');
  caption.style.marginTop = 'var(--space-3)';
  summaryEl.append(caption, list);
}

function removeTeam(index) {
  const [gone] = teams.splice(index, 1);
  save();
  render();
  say(`Equipe "${gone.name}" removida.`, false);
  nameInput.focus();
}

function setInvalid(input, invalid) {
  if (invalid) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function parseCode(raw) {
  const digits = raw.replace(/[\s-]/g, '');
  if (!digits) return { error: 'Digite o código da equipe.' };
  if (!/^\d+$/.test(digits)) return { error: 'O código só tem números, traços e espaços. Confira se não há letras.' };
  if (digits.length !== 14) {
    return { error: `O código tem 14 dígitos e você digitou ${digits.length}. Confira com a equipe.` };
  }
  const result = decodeResult(digits);
  if (!result) return { error: 'Código inválido: algum dígito está errado. Peça para a equipe ler o código de novo.' };
  return { digits, result };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim().replace(/\s+/g, ' ');
  setInvalid(nameInput, false);
  setInvalid(codeInput, false);

  if (!name) {
    setInvalid(nameInput, true);
    say('Digite o nome da equipe.', true);
    nameInput.focus();
    return;
  }
  if (name.length > MAX_NAME) {
    setInvalid(nameInput, true);
    say(`O nome da equipe pode ter até ${MAX_NAME} caracteres.`, true);
    nameInput.focus();
    return;
  }
  const parsed = parseCode(codeInput.value);
  if (parsed.error) {
    setInvalid(codeInput, true);
    say(parsed.error, true);
    codeInput.focus();
    return;
  }

  const entry = { name, code: parsed.digits };
  const existing = teams.findIndex((team) => sameTeam(team.name, name));
  if (existing >= 0) {
    teams[existing] = entry;
    say(`A equipe "${name}" já estava no quadro: a linha anterior foi substituída.`, false);
  } else {
    teams.push(entry);
    say(`Equipe "${name}" registrada.`, false);
  }
  save();
  render();
  form.reset();
  nameInput.focus();
});

for (const input of [nameInput, codeInput]) {
  input.addEventListener('input', () => setInvalid(input, false));
}

document.querySelector('#print').addEventListener('click', () => window.print());

document.querySelector('#clear').addEventListener('click', () => {
  if (typeof clearDialog.showModal === 'function') clearDialog.showModal();
  else if (window.confirm('Limpar o painel? Todas as equipes serão apagadas deste navegador.')) clearAll();
});

clearDialog.addEventListener('close', () => {
  if (clearDialog.returnValue === 'clear') clearAll();
  clearDialog.returnValue = '';
});

function clearAll() {
  teams = [];
  save();
  render();
  say('Painel limpo.', false);
  nameInput.focus();
}

render();
