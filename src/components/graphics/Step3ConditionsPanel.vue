<template>
  <div class="step3-panel p-2 space-y-2">
    <button
      type="button"
      @click="$emit('back-to-edit')"
      class="step3-back-btn w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity shrink-0"
    >
      <span aria-hidden="true">✎</span>
      <span>Назад к редактированию</span>
    </button>
    <div class="step3-params-wrap mx-0 space-y-2">
      <ConditionsPanel
        :model="model"
        :initial-data="initialData"
        :disabled="false"
        compact
        :open-when-formed="true"
      />
      <!-- Цены -->
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
    <button
      type="button"
      @click="$emit('calculate')"
      class="step3-calc-btn w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity shrink-0"
    >
      <span>Рассчитать стоимость</span>
    </button>
  </div>
</template>

<script setup>
import ConditionsPanel from '../ConditionsPanel.vue';

defineProps({
  model: { type: Object, required: true },
  initialData: { type: Object, required: true },
  basePrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
});

defineEmits(['back-to-edit', 'calculate']);

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>

<style scoped>
/* Mobile: этап 3 — превью сверху, параметры прокручиваются, кнопка внизу */
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
    overflow-y: auto;
    min-height: 0;
    -webkit-overflow-scrolling: touch;
  }
  .step3-calc-btn {
    flex-shrink: 0;
  }
}
</style>
