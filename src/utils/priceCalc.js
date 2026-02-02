/** Шаг округления цен: все цены кратны 100 (без десятков, единиц, копеек). */
export const PRICE_ROUND_STEP = 100;

/** Округлить цену до шага 100. */
export function roundPrice(v) {
  return Math.round((v || 0) / PRICE_ROUND_STEP) * PRICE_ROUND_STEP;
}

/**
 * Базовая цена от массива вмятин (первая — полная, каждая следующая — 0.5×).
 *
 * @param {Array<{ price: number }>} dents - массив вмятин с полем price
 * @returns {number} базовая сумма
 */
export function calcBasePriceFromDents(dents) {
  if (!dents || dents.length === 0) return 0;
  const sorted = [...dents].sort((a, b) => (b.price || 0) - (a.price || 0));
  let total = sorted[0].price || 0;
  for (let i = 1; i < sorted.length; i++) {
    total += (sorted[i].price || 0) * 0.5;
  }
  return total;
}

/**
 * Итоговая цена: база от вмятин × коэффициенты.
 * Единый источник истины для режима Графика (HUD, Итого, MainButton).
 *
 * @param {Array<{ price: number }>} dents - массив вмятин
 * @param {{ repairCode, riskCode, materialCode, carClassCode, disassemblyCode }} conditions - условия
 * @param {object} initialData - initialData
 * @param {string} [sizeCodeForMatrix='STRIP_DEFAULT']
 * @param {number} [roundStep=100]
 * @returns {number} итоговая цена
 */
export function calcTotalPrice(dents, conditions, initialData, sizeCodeForMatrix = 'STRIP_DEFAULT', roundStep = 100) {
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
  return applyConditionsToBase(base, conditions, initialData, sizeCodeForMatrix, roundStep);
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

  const riskObj = initialData.risks.find((r) => r.code === riskCode);
  const kKey = riskObj ? riskObj.matrixKey : 'K2';
  const matrixRow = initialData.complexityMatrix[sizeCodeForMatrix] ?? initialData.complexityMatrix['STRIP_DEFAULT'];
  const compMult = matrixRow[kKey] ?? 1.0;
  const repMult = initialData.repairTypes.find((r) => r.code === repairCode)?.mult ?? 1.0;
  const matMult = initialData.materials.find((m) => m.code === materialCode)?.mult ?? 1.0;
  const clsMult = initialData.carClasses.find((c) => c.code === carClassCode)?.mult ?? 1.0;
  const disCost = initialData.disassembly.find((d) => d.code === disassemblyCode)?.price ?? 0;

  const total = basePrice * repMult * matMult * compMult * clsMult + disCost;
  return Math.round(total / roundStep) * roundStep;
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
  const matrixRow = initialData.complexityMatrix[sizeCodeForMatrix] ?? initialData.complexityMatrix['STRIP_DEFAULT'];
  const compMult = matrixRow[kKey] ?? 1.0;
  const repObj = initialData.repairTypes.find((r) => r.code === repairCode);
  const repMult = repObj?.mult ?? 1.0;
  const matObj = initialData.materials.find((m) => m.code === materialCode);
  const matMult = matObj?.mult ?? 1.0;
  const clsObj = initialData.carClasses.find((c) => c.code === carClassCode);
  const clsMult = clsObj?.mult ?? 1.0;
  const disObj = initialData.disassembly.find((d) => d.code === disassemblyCode);
  const disCost = disObj?.price ?? 0;

  items.push({ name: 'Базовая стоимость', value: `${(Math.round(basePrice / 100) * 100).toLocaleString('ru-RU')} ₽` });
  if (repObj) items.push({ name: repObj.name, value: `×${repMult}` });
  if (matObj) items.push({ name: matObj.name, value: `×${matMult}` });
  if (riskObj) items.push({ name: riskObj.name, value: `×${compMult}` });
  if (clsObj) items.push({ name: clsObj.name, value: `×${clsMult}` });
  if (disCost > 0 && disObj) items.push({ name: disObj.name, value: `+${roundPrice(disCost).toLocaleString('ru-RU')} ₽` });

  return items;
}
