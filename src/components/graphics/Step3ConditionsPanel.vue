<template>
  <div class="step3-panel p-2 space-y-2 flex flex-col min-h-0 flex-1">
    <button
      type="button"
      @click="$emit('back-to-edit')"
      class="step3-back-btn w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity shrink-0"
    >
      <span aria-hidden="true">✎</span>
      <span>Назад к редактированию</span>
    </button>
    <div class="step3-params-wrap mx-0 space-y-3 flex-1 min-h-0 overflow-y-auto">
      <div class="rounded-xl bg-black/40 border border-white/10 px-3 py-2.5">
        <p class="text-[13px] font-medium leading-snug text-gray-200">
          Укажите технологию ремонта, сложность, материал и класс автомобиля. От этих параметров зависит итоговая стоимость.
        </p>
      </div>
      <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Условия и коэффициенты</div>
      <div class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Технология</label>
          <select :value="model.repairCode" @change="update('repairCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите технологию</option>
            <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Сложность</label>
          <select :value="model.riskCode" @change="update('riskCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите сложность</option>
            <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Материал</label>
          <select :value="model.materialCode" @change="update('materialCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите материал</option>
            <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Класс авто</label>
          <select :value="model.carClassCode" @change="update('carClassCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите класс авто</option>
            <option v-for="c in initialData.carClasses" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Арматурные работы</label>
          <select :value="model.disassemblyCode" @change="update('disassemblyCode', $event.target.value)" class="step3-select w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green/50 outline-none touch-manipulation">
            <option :value="null" disabled>Выберите арматурные работы</option>
            <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
          </select>
        </div>
      </div>
      <div class="rounded-xl bg-black/35 border border-white/10 p-3 space-y-1">
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
    <div class="step3-footer shrink-0 pt-2 space-y-1">
      <button
        type="button"
        :disabled="!conditionsComplete"
        @click="conditionsComplete && $emit('calculate')"
        class="step3-calc-btn w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity"
        :class="conditionsComplete ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
      >
        <span>Рассчитать стоимость</span>
      </button>
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

defineEmits(['back-to-edit', 'calculate']);

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
/* Mobile: этап 3 — параметры прокручиваются, кнопка всегда видна внизу */
@media (max-width: 480px) {
  .step3-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    padding: 0.5rem;
  }
  .step3-back-btn {
    flex-shrink: 0;
  }
  .step3-params-wrap {
    flex: 1;
    min-height: 0;
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }
  .step3-footer {
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom, 8px);
  }
}
</style>
