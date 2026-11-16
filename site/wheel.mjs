// Animated Caesar cipher wheel (inline SVG, no dependencies).
// Usage: const wheel = createWheel(document.getElementById('wheel')); wheel.start();

const SVG_NS = 'http://www.w3.org/2000/svg';
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const N = ALFABETO.length;
const STEP = 360 / N;
const CX = 100;
const CY = 100;

// Radii (viewBox units).
const R_OUTER = 98;
const R_RING_INNER = 76;
const R_DISC = 74;
const R_OUTER_LETTER = 87;
const R_INNER_LETTER = 65;
const R_TICK_INNER = 54;
const R_CENTER = 22;

const SHIFTS = [3, 7, 13, 3, 20, 3];
const MOVE_MS = 1200;
const PAUSE_MS = 2400;
const DEFAULT_SHIFT = 3;

const ARIA_LABEL =
  'Roda de César: o disco interno gira e para quando as letras se alinham. ' +
  'Com deslocamento 3, A vira D.';

function svgEl(name, attrs, parent) {
  const el = document.createElementNS(SVG_NS, name);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  if (parent) parent.appendChild(el);
  return el;
}

function polar(r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
}

function addTicks(parent, rFrom, rTo, className) {
  for (let i = 0; i < N; i++) {
    const [x1, y1] = polar(rFrom, (i + 0.5) * STEP);
    const [x2, y2] = polar(rTo, (i + 0.5) * STEP);
    svgEl('line', {
      class: className,
      x1: x1.toFixed(2),
      y1: y1.toFixed(2),
      x2: x2.toFixed(2),
      y2: y2.toFixed(2),
    }, parent);
  }
}

function addLetters(parent, r, className) {
  for (let i = 0; i < N; i++) {
    const t = svgEl('text', {
      class: className,
      x: CX,
      y: CY - r,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      transform: 'rotate(' + (i * STEP).toFixed(4) + ' ' + CX + ' ' + CY + ')',
    }, parent);
    t.textContent = ALFABETO[i];
  }
}

export function createWheel(container) {
  container.textContent = '';
  container.setAttribute('tabindex', '0');
  container.setAttribute('aria-label', ARIA_LABEL);

  const svg = svgEl('svg', { viewBox: '0 0 200 200', 'aria-hidden': 'true', focusable: 'false' });

  // Fixed outer ring (plain alphabet).
  svgEl('circle', { class: 'wheel-ring', cx: CX, cy: CY, r: R_OUTER }, svg);
  svgEl('circle', { class: 'wheel-ring-edge', cx: CX, cy: CY, r: R_RING_INNER }, svg);
  addTicks(svg, R_OUTER, R_RING_INNER, 'wheel-tick');
  addLetters(svg, R_OUTER_LETTER, 'wheel-letter wheel-letter-outer');

  // Rotating inner disc (cipher alphabet).
  const inner = svgEl('g', { class: 'wheel-inner' }, svg);
  svgEl('circle', { class: 'wheel-disc', cx: CX, cy: CY, r: R_DISC }, inner);
  addTicks(inner, R_DISC, R_TICK_INNER, 'wheel-tick');
  addLetters(inner, R_INNER_LETTER, 'wheel-letter wheel-letter-inner');

  // Center hub with the current shift (does not rotate).
  svgEl('circle', { class: 'wheel-hub', cx: CX, cy: CY, r: R_CENTER }, svg);
  const shiftLabel = svgEl('text', {
    class: 'wheel-shift',
    x: CX,
    y: CY,
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
  }, svg);

  // Alignment window at 12 o'clock around the outer and inner letters.
  svgEl('rect', { class: 'wheel-marker', x: CX - 8.5, y: 3, width: 17, height: 43, rx: 4 }, svg);

  const caption = document.createElement('figcaption');
  caption.className = 'wheel-caption';

  container.appendChild(svg);
  container.appendChild(caption);

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let running = false;
  let timer = null;
  let phase = 'paused'; // 'paused' (letters aligned) or 'moving' (disc turning)
  let index = 0;        // index into SHIFTS of the shift currently shown
  let shift = 0;        // shift the inner disc is currently set to
  let angle = 0;        // cumulative angle in degrees, only ever decreases

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function rotateTo(k) {
    // Always the same direction: add the forward delta (mod 26) to the cumulative angle.
    const delta = (k - shift + N) % N;
    angle -= delta * STEP;
    shift = k;
    inner.style.transform = 'rotate(' + angle + 'deg)';
  }

  function updateText(k) {
    const x = ALFABETO[k % N];
    const y = ALFABETO[(1 + k) % N];
    shiftLabel.textContent = '+' + k;
    caption.textContent =
      'Deslocamento ' + k + ': A vira ' + x + ', B vira ' + y + '. Para decifrar, ' + x + ' volta para A.';
  }

  function canAnimate() {
    return running && !document.hidden && !motionQuery.matches;
  }

  function arrive() {
    phase = 'paused';
    updateText(SHIFTS[index]);
    timer = canAnimate() ? setTimeout(step, PAUSE_MS) : null;
  }

  function step() {
    if (!canAnimate()) {
      timer = null;
      return;
    }
    index = (index + 1) % SHIFTS.length;
    phase = 'moving';
    rotateTo(SHIFTS[index]);
    timer = setTimeout(arrive, MOVE_MS);
  }

  // Resume the loop from whatever phase was interrupted.
  function resume() {
    clearTimer();
    if (!canAnimate()) return;
    if (phase === 'moving') arrive();
    else timer = setTimeout(step, PAUSE_MS);
  }

  function showStatic() {
    clearTimer();
    phase = 'paused';
    index = SHIFTS.indexOf(DEFAULT_SHIFT);
    rotateTo(DEFAULT_SHIFT);
    updateText(DEFAULT_SHIFT);
  }

  function onMotionChange() {
    if (motionQuery.matches) showStatic();
    else resume();
  }

  function onVisibility() {
    if (document.hidden) clearTimer();
    else resume();
  }

  // Initial state: aligned at the gate shift (inline style applied before first transition matters little).
  showStatic();

  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start() {
      if (running) return;
      running = true;
      if (motionQuery.matches) showStatic();
      else resume();
    },
    stop() {
      running = false;
      clearTimer();
    },
  };
}
