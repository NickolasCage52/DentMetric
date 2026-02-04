/**
 * Guards для DentMetric: защита от NaN, undefined, отрицательных значений.
 * Используется в konvaEditor, priceCalc, GraphicsWizard.
 */

/** Нормализовать число: NaN/undefined → fallback. */
export function normalizeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : (Number.isFinite(Number(fallback)) ? Number(fallback) : 0);
}

/** Ограничить значение в диапазоне [min, max]. */
export function clamp(value, min, max) {
  const n = normalizeNumber(value, min);
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) ? max : Infinity;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/** Минимальные размеры вмятины в мм. */
export const SIZE_MM_MIN = 0.1;
export const SIZE_MM_MAX = 2000;

/** Санитизация состояния вмятины: width/height > 1, rotation в диапазоне, scale не отрицательный. */
export function sanitizeDentState(dent) {
  if (!dent || typeof dent !== 'object') return null;
  const safe = { ...dent };
  safe.widthMm = clamp(safe.widthMm ?? safe.width, SIZE_MM_MIN, SIZE_MM_MAX);
  safe.heightMm = clamp(safe.heightMm ?? safe.height, SIZE_MM_MIN, SIZE_MM_MAX);
  if (safe.rotation != null) safe.rotation = clamp(safe.rotation, -360, 360);
  if (safe.scaleX != null) safe.scaleX = Math.max(0.01, Math.abs(normalizeNumber(safe.scaleX, 1)));
  if (safe.scaleY != null) safe.scaleY = Math.max(0.01, Math.abs(normalizeNumber(safe.scaleY, 1)));
  if (safe.price != null) safe.price = Math.max(0, normalizeNumber(safe.price, 0));
  return safe;
}

/** Безопасный пересчёт цены: сумма базовых цен вмятин (каждая считается отдельно). */
export function safeRecalcPrice(state) {
  if (!state) return 0;
  const dents = Array.isArray(state.dents) ? state.dents : [];
  if (dents.length === 0) return 0;
  const total = dents.reduce((sum, dent) => sum + normalizeNumber(dent?.price, 0), 0);
  return Math.max(0, total);
}
