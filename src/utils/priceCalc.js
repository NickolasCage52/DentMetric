import { normalizeNumber } from './validation';

/** Шаг округления цен: все цены кратны 100 (без десятков, единиц, копеек). */
export const PRICE_ROUND_STEP = 100;

/** Округлить цену до шага 100. */
export function roundPrice(v) {
  return Math.round((normalizeNumber(v, 0)) / PRICE_ROUND_STEP) * PRICE_ROUND_STEP;
}

/**
 * Базовая цена от массива вмятин: сумма базовых цен (каждая вмятина считается отдельно).
 * Защита от NaN/undefined в price.
 *
 * @param {Array<{ price: number }>} dents - массив вмятин с полем price
 * @returns {number} базовая сумма
 */
export function calcBasePriceFromDents(dents) {
  if (!dents || !Array.isArray(dents) || dents.length === 0) return 0;
  const total = dents.reduce((sum, dent) => sum + normalizeNumber(dent?.price, 0), 0);
  return Math.max(0, total);
}

/**
 * Расчёт цены одной вмятины по таблице коэффициентов (без разборки).
 * Порядок: basePrice *= repairType *= complexity *= material *= carClass.
 * Разборка добавляется один раз к итогу в calcTotalPrice.
 *
 * @param {{ price: number, type?: string, sizeCode?: string }} dent - вмятина (price = база, sizeCode для матрицы)
 * @param {{ repairCode, riskCode, materialCode, carClassCode, disassemblyCode }} conditions
 * @param {object} initialData
 * @returns {number}
 */
function calculateDentPrice(dent, conditions, initialData) {
  const basePrice = normalizeNumber(dent?.price, 0);
  if (basePrice <= 0) return 0;
  if (!conditions || !initialData) return basePrice;

  const repCoeff = initialData.repairTypes.find((r) => r.code === conditions.repairCode)?.mult ?? 1.0;
  const matCoeff = initialData.materials.find((m) => m.code === conditions.materialCode)?.mult ?? 1.0;
  const carClassCoeff = initialData.carClasses.find((c) => c.code === conditions.carClassCode)?.mult ?? 1.0;
  const riskObj = initialData.risks.find((r) => r.code === conditions.riskCode);
  const kKey = riskObj ? riskObj.matrixKey : 'K2';
  const sizeCode = dent?.sizeCode ?? (dent?.type === 'circle' ? 'S2' : 'STRIP_DEFAULT');
  const matrixRow = initialData.complexityMatrix?.[sizeCode] ?? initialData.complexityMatrix?.['STRIP_DEFAULT'] ?? { [kKey]: 1.0 };
  const compCoeff = matrixRow[kKey] ?? 1.0;

  let price = basePrice;
  price *= repCoeff;
  price *= compCoeff;
  price *= matCoeff;
  price *= carClassCoeff;
  return Math.max(0, price);
}

/**
 * Итоговая цена: каждая вмятина считается отдельно, затем суммируется.
 * Единый источник истины для режима Графика (HUD, Итого, MainButton).
 *
 * @param {Array<{ price: number, type?: string, sizeCode?: string }>} dents - массив вмятин
 * @param {{ repairCode, riskCode, materialCode, carClassCode, disassemblyCode }} conditions - условия
 * @param {object} initialData - initialData
 * @param {number} [roundStep=100]
 * @returns {number} итоговая цена
 */
export function calcTotalPrice(dents, conditions, initialData, roundStep = 100) {
  if (!dents || !Array.isArray(dents) || dents.length === 0) return 0;
  const base = calcBasePriceFromDents(dents);
  if (base <= 0) return 0;

  const hasConditions =
    conditions &&
    conditions.repairCode &&
    conditions.riskCode &&
    conditions.materialCode &&
    conditions.carClassCode &&
    conditions.disassemblyCode;
  if (!hasConditions) {
    return Math.round(base / roundStep) * roundStep;
  }

  const dentsTotal = dents.reduce((sum, dent) => sum + calculateDentPrice(dent, conditions, initialData), 0);
  const disCost = initialData.disassembly.find((d) => d.code === conditions.disassemblyCode)?.price ?? 0;
  const total = dentsTotal + disCost;
  return Math.round(total / roundStep) * roundStep;
}

/**
 * Общая логика расчёта итоговой цены с учётом условий/коэффициентов.
 * Используется в режимах Стандарт, Время и Графика (единая формула).
 *
 * @param {number} basePrice - базовая цена (от размера / часов / суммы вмятин)
 * @param {{ repairCode, riskCode, materialCode, carClassCode, disassemblyCode }} conditions - выбранные условия
 * @param {object} initialData - initialData (repairTypes, risks, materials, carClasses, disassembly, complexityMatrix)
 * @param {string} [sizeCodeForMatrix] - код размера для матрицы сложности (S2, S4, ...). Для Графика/Время передать 'STRIP_DEFAULT'
 * @param {number} [roundStep=100] - шаг округления (все цены с шагом 100, без десятков/копеек)
 * @returns {number} итоговая цена (округлённая)
 */
export function applyConditionsToBase(basePrice, conditions, initialData, sizeCodeForMatrix = 'STRIP_DEFAULT', roundStep = 100) {
  if (!conditions || !initialData || basePrice <= 0) return 0;
  const { repairCode, riskCode, materialCode, carClassCode, disassemblyCode } = conditions;
  if (!repairCode || !riskCode || !materialCode || !carClassCode || !disassemblyCode) return 0;

  const repCoeff = initialData.repairTypes.find((r) => r.code === repairCode)?.mult ?? 1.0;
  const matCoeff = initialData.materials.find((m) => m.code === materialCode)?.mult ?? 1.0;
  const carClassCoeff = initialData.carClasses.find((c) => c.code === carClassCode)?.mult ?? 1.0;
  const riskObj = initialData.risks.find((r) => r.code === riskCode);
  const kKey = riskObj ? riskObj.matrixKey : 'K2';
  const matrixRow = initialData.complexityMatrix?.[sizeCodeForMatrix] ?? initialData.complexityMatrix?.['STRIP_DEFAULT'] ?? { [kKey]: 1.0 };
  const compCoeff = matrixRow[kKey] ?? 1.0;
  const disCost = initialData.disassembly.find((d) => d.code === disassemblyCode)?.price ?? 0;

  let price = basePrice;
  price *= repCoeff;
  price *= compCoeff;
  price *= matCoeff;
  price *= carClassCoeff;
  price += disCost;
  return Math.round(Math.max(0, price) / roundStep) * roundStep;
}

/**
 * Строит массив строк breakdown для Step 4 (Итог).
 * @param {number} basePrice - базовая стоимость
 * @param {{ repairCode, riskCode, materialCode, carClassCode, disassemblyCode }} conditions
 * @param {object} initialData
 * @param {string} [sizeCodeForMatrix='STRIP_DEFAULT']
 * @returns {Array<{ name: string, value: string }>} массив { name, value }
 */
export function buildBreakdown(basePrice, conditions, initialData, sizeCodeForMatrix = 'STRIP_DEFAULT') {
  const items = [];
  if (!conditions || !initialData || basePrice <= 0) return items;

  const { repairCode, riskCode, materialCode, carClassCode, disassemblyCode } = conditions;
  if (!repairCode || !riskCode || !materialCode || !carClassCode || !disassemblyCode) return items;

  const riskObj = initialData.risks.find((r) => r.code === riskCode);
  const kKey = riskObj ? riskObj.matrixKey : 'K2';
  const matrixRow = initialData.complexityMatrix?.[sizeCodeForMatrix] ?? initialData.complexityMatrix?.['STRIP_DEFAULT'] ?? { [kKey]: 1.0 };
  const compMult = matrixRow[kKey] ?? 1.0;
  const repObj = initialData.repairTypes.find((r) => r.code === repairCode);
  const repMult = repObj?.mult ?? 1.0;
  const matObj = initialData.materials.find((m) => m.code === materialCode);
  const matMult = matObj?.mult ?? 1.0;
  const carClassObj = initialData.carClasses.find((c) => c.code === carClassCode);
  const carClassMult = carClassObj?.mult ?? 1.0;
  const disObj = initialData.disassembly.find((d) => d.code === disassemblyCode);
  const disCost = disObj?.price ?? 0;

  items.push({ name: 'Базовая стоимость', value: `${(Math.round(basePrice / 100) * 100).toLocaleString('ru-RU')} ₽` });
  if (repObj) items.push({ name: repObj.name, value: `×${repMult}` });
  if (matObj) items.push({ name: matObj.name, value: `×${matMult}` });
  if (riskObj) items.push({ name: riskObj.name, value: `×${compMult}` });
  if (carClassObj) items.push({ name: carClassObj.name, value: `×${carClassMult}` });
  if (disCost > 0 && disObj) items.push({ name: disObj.name, value: `+${roundPrice(disCost).toLocaleString('ru-RU')} ₽` });

  return items;
}
