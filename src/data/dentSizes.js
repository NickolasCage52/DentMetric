/**
 * Размеры вмятин в мм — источник истины для графического режима (circle/oval).
 * Интеграция с настройками цен: basePrice хранится в initialData / userSettings по code.
 */

/** Размеры для инструмента "Круг/Овал" в мм (w × h). Овал: w — ширина, h — высота. */
export const circleSizesMm = [
  { code: 'S2', name: 'Монета', mm: { w: 25, h: 25 } },
  { code: 'S4', name: 'Яйцо', mm: { w: 45, h: 60 } },
  { code: 'S6', name: 'Апельсин', mm: { w: 90, h: 90 } },
  { code: 'S8', name: 'Ладонь', mm: { w: 85, h: 180 } },
  { code: 'S10', name: 'Футбольный мяч', mm: { w: 220, h: 220 } },
  { code: 'S11', name: 'Два мяча', mm: { w: 440, h: 440 } }
];

/** Площадь в мм² для овала: π * (w/2) * (h/2) — для интерполяции цены */
function ellipseAreaMm2(w, h) {
  return Math.PI * (w / 2) * (h / 2);
}

/** Добавляем areaMm2 к каждому размеру для сортировки и интерполяции */
export const circleSizesWithArea = circleSizesMm.map((s) => ({
  ...s,
  areaMm2: ellipseAreaMm2(s.mm.w, s.mm.h)
}));
