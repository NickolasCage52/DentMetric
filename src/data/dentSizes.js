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

/** Размеры для инструмента "Полоса/Царапина" в мм (w × h). Эталон — капот, единая механика для всех модулей кроссовера. */
export const stripSizesMm = [
  { code: 'LS1', name: 'с спич. коробок', mm: { w: 40, h: 20 } },
  { code: 'LS2', name: 'с карандаш', mm: { w: 80, h: 10 } },
  { code: 'LS3', name: 'с линейку', mm: { w: 120, h: 10 } },
  { code: 'LS4', name: 'с книгу', mm: { w: 150, h: 50 } },
  { code: 'LS5', name: 'с ноутбук', mm: { w: 200, h: 100 } },
  { code: 'LS6', name: 'с полдвери', mm: { w: 250, h: 150 } },
  { code: 'LS7', name: 'с дверь', mm: { w: 280, h: 200 } },
  { code: 'LS8', name: 'весь элемент', mm: { w: 300, h: 300 } }
];

/** Площадь в мм² для полосы/царапины: w × h (прямоугольник) */
function rectAreaMm2(w, h) {
  return w * h;
}

/** Полосы с areaMm2 — единая механика калькулятора для капота, дверей, крыла */
export const stripSizesWithArea = stripSizesMm.map((s) => ({
  ...s,
  areaMm2: rectAreaMm2(s.mm.w, s.mm.h)
}));
