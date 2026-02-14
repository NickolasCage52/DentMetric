/**
 * Minimal SVG paths for car body elements (silhouettes).
 * Used in standard mode element selection list. viewBox 0 0 24 24.
 */
const ELEMENT_ICONS = {
  'Капот': 'M3 4h18v14c0 1.1-4 2-9 2s-9-.9-9-2V4z',
  'Крышка багажника': 'M2 6h20v14H2V6z',
  'Крыша': 'M4 2h16l2 6v10H2V8l2-6z',
  'Переднее крыло': 'M3 4h16v14c0 1-3 2-8 2H3V4z',
  'Передняя дверь': 'M5 3h14v16c0 .5-2 1-7 1s-7-.5-7-1V3z',
  'Задняя дверь': 'M5 3h14v16c0 .5-2 1-7 1s-7-.5-7-1V3z',
  'Заднее крыло': 'M5 4h16v14c0 1-3 2-8 2H5V4z',
  'Стойка крыши': 'M9 0h6v24H9z',
  'Порог': 'M0 10h24v4H0z',
  'Бампер': 'M0 8h24v8H0z'
};

export function getElementIconPath(name) {
  return ELEMENT_ICONS[name] || ELEMENT_ICONS['Капот'];
}
