// Completion code shared by the game (encode) and the teacher page (decode).
// Format: 14 digits shown as "NNNN-NNNN-NNNN-NN".
//   digits 1-8   wrong attempts per gate, two digits each (clamped to 0-99)
//   digits 9-12  hints opened per gate, one digit each (clamped to 0-9)
//   digits 13-14 ISO 7064 mod 97-10 check over the first 12 digits
// The check only catches typing mistakes; it is not a proof of completion.

export const GATES = 4;

function check(body) {
  const remainder = Number(BigInt(`${body}00`) % 97n);
  return String(98 - remainder).padStart(2, '0');
}

function clamp(value, max) {
  const number = Math.trunc(Number(value) || 0);
  return Math.min(max, Math.max(0, number));
}

export function encodeResult({ wrong, hints }) {
  const tries = Array.from({ length: GATES }, (_, i) => String(clamp(wrong?.[i], 99)).padStart(2, '0')).join('');
  const help = Array.from({ length: GATES }, (_, i) => String(clamp(hints?.[i], 9))).join('');
  const body = tries + help;
  const digits = body + check(body);
  return digits.match(/.{1,4}/g).join('-');
}

// Returns { wrong: number[4], hints: number[4] } or null when the code is malformed.
export function decodeResult(code) {
  const digits = String(code).replace(/[\s-]/g, '');
  if (!/^\d{14}$/.test(digits)) return null;
  const body = digits.slice(0, 12);
  if (check(body) !== digits.slice(12)) return null;
  const wrong = Array.from({ length: GATES }, (_, i) => Number(body.slice(i * 2, i * 2 + 2)));
  const hints = Array.from({ length: GATES }, (_, i) => Number(body[8 + i]));
  return { wrong, hints };
}
