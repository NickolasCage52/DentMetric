<template>
  <div class="summary-panel flex flex-col min-h-0">
    <div class="graphics-panel-content p-2 space-y-3">
      <!-- Breakdown -->
      <div class="summary-card rounded-xl bg-black/35 border border-white/10 p-4 space-y-2">
        <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Расчёт стоимости</div>
        <div v-if="freeformUsed" class="summary-row flex justify-between text-[11px]">
          <span class="text-gray-400">Форма:</span>
          <span class="text-white font-medium">Произвольная (расчёт по габаритам круга/овала)</span>
        </div>
        <div v-for="(item, idx) in breakdown" :key="idx" class="summary-row flex justify-between text-[11px]">
          <span class="text-gray-400">{{ item.name }}:</span>
          <span class="text-white font-medium">{{ item.value }}</span>
        </div>
        <div class="border-t border-white/10 pt-2 mt-2 flex justify-between">
          <span class="text-metric-green font-bold text-sm">Итог:</span>
          <span class="text-metric-green font-bold text-lg">{{ formatPrice(totalPrice) }} ₽</span>
        </div>
      </div>
      <div class="summary-card rounded-xl bg-black/35 border border-white/10 p-4 space-y-2">
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Комментарий</div>
        <textarea
          :value="comment"
          @input="$emit('update:comment', $event.target.value)"
          rows="3"
          placeholder="Комментарий к оценке (необязательно)"
          class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm shadow-inner focus:border-metric-green/50 outline-none resize-none"
        ></textarea>
      </div>
    </div>
    <div class="graphics-action-bar space-y-2">
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
          @click="$emit('back-to-edit')"
          class="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity min-h-[44px]"
        >
          <span>Вернуться к редактированию</span>
        </button>
      </div>
      <button
        type="button"
        @click="$emit('save')"
        class="w-full py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl transition-all hover:bg-metric-green/10 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="historySaving"
      >
        {{ historySaving ? 'Сохранение...' : 'Сохранить в историю' }}
      </button>
      <!-- Reset button removed per request -->
    </div>
  </div>
</template>

<script setup>
defineProps({
  breakdown: { type: Array, default: () => [] },
  totalPrice: { type: Number, default: 0 },
  freeformUsed: { type: Boolean, default: false },
  freeformAreaMm2: { type: Number, default: 0 },
  comment: { type: String, default: '' },
  historySaving: { type: Boolean, default: false }
});

defineEmits(['back', 'back-to-edit', 'reset', 'update:comment', 'save']);

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);
const formatArea = (v) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(v));
</script>

<style scoped>
@media (max-width: 480px) {
  .summary-panel {
    padding: 0.35rem !important;
  }
  .summary-panel > * + * {
    margin-top: 0.5rem !important;
  }
  .summary-card {
    padding: 0.5rem !important;
  }
  .summary-row {
    font-size: 10px !important;
  }
}
</style>
