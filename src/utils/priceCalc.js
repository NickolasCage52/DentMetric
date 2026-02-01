/**
 * Общая логика расчёта итоговой цены с учётом условий/коэффициентов.
 * Используется в режимах Стандарт, Время и Графика (единая формула).
 *
 * @param {number} basePrice - базовая цена (от размера / часов / суммы вмятин)
 * @param {{ repairCode, riskCode, materialCode, carClassCode, disassemblyCode }} conditions - выбранные условия
 * @param {object} initialData - initialData (repairTypes, risks, materials, carClasses, disassembly, complexityMatrix)
 * @param {string} [sizeCodeForMatrix] - код размера для матрицы сложности (S2, S4, ...). Для Графика/Время передать 'STRIP_DEFAULT'
 * @param {number} [roundStep=500] - шаг округления (500 для Стандарт, 100 для Время/Графика)
 * @returns {number} итоговая цена (округлённая)
 */
export function applyConditionsToBase(basePrice, conditions, initialData, sizeCodeForMatrix = 'STRIP_DEFAULT', roundStep = 500) {
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
