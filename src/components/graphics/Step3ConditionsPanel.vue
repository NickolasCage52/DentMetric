<template>
  <div class="step3-panel p-2 space-y-2 flex flex-col min-h-0 flex-1">
    <div class="step3-params-wrap mx-0 space-y-2 flex-1 min-h-0 overflow-y-auto">
      <div class="step3-hint rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5">
        <p class="text-[11px] font-medium leading-tight text-gray-200 step3-hint-text">
          <span class="step3-hint-full">Технология, сложность, материал и класс авто — влияют на итог.</span>
          <span class="step3-hint-short">Параметры влияют на итог.</span>
        </p>
      </div>
      <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Условия и коэффициенты</div>
      <div class="space-y-2">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">Технология</label>
          <select :value="model.repairCode" @change="update('repairCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-2.5 py-2 min-h-[40px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите технологию</option>
            <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">Сложность</label>
          <select :value="model.riskCode" @change="update('riskCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-2.5 py-2 min-h-[40px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите сложность</option>
            <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">Материал</label>
          <select :value="model.materialCode" @change="update('materialCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-2.5 py-2 min-h-[40px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите материал</option>
            <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">Класс авто</label>
          <select :value="model.carClassCode" @change="update('carClassCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-2.5 py-2 min-h-[40px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите класс авто</option>
            <option v-for="c in initialData.carClasses" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">Арматурные работы</label>
          <select :value="model.disassemblyCode" @change="update('disassemblyCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-2.5 py-2 min-h-[40px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите арматурные работы</option>
            <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
          </select>
        </div>
      </div>
      <div class="rounded-lg bg-black/35 border border-white/10 p-2 space-y-0.5">
        <div class="flex justify-between text-[11px]">
          <span class="text-gray-400">Базовая стоимость:</span>
          <span class="text-white font-medium">{{ formatPrice(basePrice) }} ₽</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-gray-400">Итоговая стоимость:</span>
          <span class="text-metric-green font-bold">{{ formatPrice(totalPrice) }} ₽</span>
        </div>
      </div>
    </div>
    <div class="step3-footer shrink-0 pt-1.5 pb-1 space-y-0.5">
      <div class="flex items-center gap-2 w-full">
        <button
          type="button"
          @click="$emit('back')"
          class="step-nav-back-btn shrink-0 py-2.5 px-3 rounded-xl text-xs font-medium text-gray-400 hover:text-white border border-white/15 hover:border-white/25 transition-all touch-manipulation min-h-[44px]"
        >
          Назад
        </button>
        <button
          type="button"
          :disabled="!conditionsComplete"
          @click="conditionsComplete && $emit('calculate')"
          class="step3-calc-btn flex-1 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity min-h-[44px]"
          :class="conditionsComplete ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
        >
          <span>Рассчитать стоимость</span>
        </button>
      </div>
      <p v-if="!conditionsComplete" class="text-[10px] text-gray-500 text-center">Выберите все параметры</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  model: { type: Object, required: true },
  initialData: { type: Object, required: true },
  basePrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
});

defineEmits(['back', 'calculate']);

const conditionsComplete = computed(() => {
  const m = props.model;
  if (!m) return false;
  return !!(
    m.repairCode &&
    m.riskCode &&
    m.materialCode &&
    m.carClassCode &&
    m.disassemblyCode
  );
});

function update(field, value) {
  if (props.model) props.model[field] = value;
}

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>

<style scoped>
.step3-hint-short {
  display: none;
}
/* Mobile: компактнее — кнопка «Рассчитать стоимость» всегда видна */
@media (max-width: 480px) {
  .step3-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    padding: 0.3rem;
    gap: 0.25rem;
  }
  .step3-hint {
    padding: 0.2rem 0.4rem !important;
    flex-shrink: 0;
  }
  .step3-hint-text {
    font-size: 9px !important;
    line-height: 1.2;
  }
  .step3-hint-full {
    display: none;
  }
  .step3-hint-short {
    display: inline;
  }
  .step3-params-wrap {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }
  .step3-params-wrap .space-y-2 > * + * {
    margin-top: 0.25rem;
  }
  .step3-select {
    min-height: 34px !important;
    padding: 0.25rem 0.4rem !important;
    font-size: 0.8rem !important;
  }
  .step3-footer {
    flex-shrink: 0;
    padding-top: 0.25rem !important;
    padding-bottom: max(0.3rem, env(safe-area-inset-bottom, 6px)) !important;
  }
  .step3-calc-btn {
    min-height: 42px !important;
    padding: 0.5rem 0.6rem !important;
    font-size: 0.75rem !important;
  }
}
</style>
