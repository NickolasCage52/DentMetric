<template>
  <div class="p-2 space-y-2">
    <button
      type="button"
      @click="$emit('back-to-edit')"
      class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity"
    >
      <span aria-hidden="true">✎</span>
      <span>Назад к редактированию</span>
    </button>
    <div class="mx-0">
      <ConditionsPanel
        :model="model"
        :initial-data="initialData"
        :disabled="false"
        compact
        :open-when-formed="true"
      />
    </div>
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
    <button
      type="button"
      @click="$emit('calculate')"
      class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity"
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
