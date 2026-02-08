<template>
  <div class="step1-panel flex flex-col min-h-0">
    <div class="graphics-panel-content p-2 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="text-[11px] text-gray-300 text-left">
          Выберите тип вмятины и разместите её на элементе
        </div>
        <button
          type="button"
          @click="$emit('client')"
          class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
        >
          Клиент
        </button>
      </div>
      <!-- Выбор типа вмятины -->
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="$emit('add-type', 'circle')"
          class="card-metallic p-3.5 min-h-[60px] rounded-xl flex items-center gap-3 active:scale-95 hover:border-metric-green/30 transition-all touch-manipulation"
        >
          <div class="w-6 h-6 rounded-full border-2 border-metric-green bg-metric-green/20 shrink-0"></div>
          <div class="text-left min-w-0">
            <div class="font-bold text-[11px] text-white">Вмятина</div>
            <div class="text-[10px] text-gray-500">Круг/Овал</div>
          </div>
        </button>
        <button
          @click="$emit('add-type', 'strip')"
          class="card-metallic p-3.5 min-h-[60px] rounded-xl flex items-center gap-3 active:scale-95 hover:border-metric-green/30 transition-all touch-manipulation"
        >
          <div class="w-6 h-2.5 bg-metric-silver rotate-45 rounded-sm shrink-0"></div>
          <div class="text-left min-w-0">
            <div class="font-bold text-[11px] text-white">Полоса</div>
            <div class="text-[10px] text-gray-500">Царапина</div>
          </div>
        </button>
      </div>
      <div v-if="selectedDentSize?.freeformEnabled" class="flex items-center justify-between gap-2 mt-1">
        <div class="text-[10px] text-gray-500">
          Свободная форма активна
        </div>
        <button
          type="button"
          @click="$emit('draw-freeform')"
          class="px-3 py-2 min-h-[36px] rounded-lg text-[10px] font-bold uppercase tracking-widest bg-metric-green text-black shadow-[0_0_12px_rgba(136,229,35,0.3)] active:opacity-90"
        >
          Рисовать форму
        </button>
      </div>
      <p v-if="!canNext" class="text-[10px] text-gray-500 text-center">Добавьте хотя бы одну вмятину</p>
    </div>
    <div class="graphics-action-bar wizard-step-controls space-y-2">
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
          @click="$emit('next')"
          :disabled="!canNext"
          :title="canNext ? '' : 'Добавьте хотя бы одну вмятину'"
          class="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 min-h-[44px]"
          :class="canNext ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
        >
          <span>Продолжить → Размеры</span>
        </button>
      </div>
      <button
        type="button"
        class="actionbar-total-btn"
        :class="totalPrice > 0 ? 'actionbar-total-btn--active' : 'actionbar-total-btn--idle'"
        :disabled="totalPrice <= 0"
      >
        <span>ИТОГО: {{ totalPrice > 0 ? formatPrice(totalPrice) + ' ₽' : '—' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  canNext: { type: Boolean, default: false },
  totalPrice: { type: Number, default: 0 },
  selectedDentSize: { type: Object, default: null }
});

defineEmits(['add-type', 'next', 'back', 'draw-freeform', 'client']);

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);

</script>

<style scoped>
@media (max-width: 480px) {
  .wizard-step-controls {
    transform: translateY(-5px);
  }
}
</style>
