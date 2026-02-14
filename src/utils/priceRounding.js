/**
 * Optional presentation-layer rounding for final prices.
 * Rounds UP (ceil) to nearest step. Engine output is unchanged.
 * @param {number} raw - raw price from engine
 * @param {number} step - 0 = no rounding, else round up to nearest step (10, 50, 100, 500)
 * @returns {number}
 */
export function applyPriceRoundingCeil(raw, step) {
  const v = Number(raw);
  if (!Number.isFinite(v) || v <= 0) return 0;
  if (!step || step <= 0) return v;
  return Math.ceil(v / step) * step;
}

export const PRICE_ROUND_OPTIONS = [
  { value: 0, label: 'Без округления' },
  { value: 10, label: 'До 10 ₽' },
  { value: 50, label: 'До 50 ₽' },
  { value: 100, label: 'До 100 ₽' },
  { value: 500, label: 'До 500 ₽' }
];
