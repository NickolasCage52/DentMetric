/**
 * Каталог деталей кузова по классам авто.
 * PartDef: id, name, icon?, classIds, asset, realSizeMm.
 * Реальные размеры (realSizeMm) — в одном месте. TODO: заменить на точные мм при наличии замеров.
 */

/**
 * @typedef {Object} PartDef
 * @property {string} id
 * @property {string} name
 * @property {string} [icon]
 * @property {string[]} classIds - например ['crossover']
 * @property {{ type: 'image', src: string }} asset - путь из public (без leading slash, base добавится в редакторе)
 * @property {{ w: number, h: number }} realSizeMm - реальные габариты детали в мм
 */

const CELL_MM = 30;

/** Детали для класса "Кроссовер" (4 детали с имеющимися ассетами). */
export const CROSSOVER_PARTS = [
  {
    id: 'hood',
    name: 'Капот',
    icon: 'hood',
    classIds: ['crossover'],
    asset: { type: 'image', src: 'parts/crossover/hood.jpg' },
    realSizeMm: { w: 1570, h: 1315 }
  },
  {
    id: 'door_front_left',
    name: 'Левая передняя дверь',
    icon: 'door',
    classIds: ['crossover'],
    asset: { type: 'image', src: 'parts/crossover/door_front_left.jpg' },
    realSizeMm: { w: 1112, h: 950 }
  },
  {
    id: 'door_rear_left',
    name: 'Левая задняя дверь',
    icon: 'door',
    classIds: ['crossover'],
    asset: { type: 'image', src: 'parts/crossover/door_rear_left.jpg' },
    realSizeMm: { w: 1170, h: 790 }
  },
  {
    id: 'fender_rear_right',
    name: 'Заднее правое крыло',
    icon: 'fender',
    classIds: ['crossover'],
    asset: { type: 'image', src: 'parts/crossover/fender_rear_left.jpg' },
    realSizeMm: { w: 585, h: 390 }
  }
];

/**
 * Получить детали по классу авто
 * @param {string} classId - id класса (например 'crossover')
 * @returns {PartDef[]}
 */
export function getPartsByClass(classId) {
  return CROSSOVER_PARTS.filter((p) => p.classIds.includes(classId));
}

export { CELL_MM };
