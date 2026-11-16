export function normalizeAnswer(answer) {
  return answer.normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/\s+/g, ' ').toUpperCase();
}

export async function answerDigest(answer) {
  const bytes = new TextEncoder().encode(normalizeAnswer(answer));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function readProgress(value, total) {
  const index = Number(value);
  return String(index) === value && Number.isInteger(index) && index >= 0 && index <= total ? index : 0;
}
