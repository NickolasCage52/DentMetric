<template>
  <div class="p-2 space-y-2">
    <!-- Выбор типа вмятины -->
    <div class="grid grid-cols-2 gap-2">
      <button
        @click="$emit('add-type', 'circle')"
        class="card-metallic p-2.5 rounded-xl flex items-center gap-2 active:scale-95 hover:border-metric-green/30 transition-all"
      >
        <div class="w-5 h-5 rounded-full border-2 border-metric-green bg-metric-green/20 shrink-0"></div>
        <div class="text-left min-w-0">
          <div class="font-bold text-[10px] text-white">Вмятина</div>
          <div class="text-[9px] text-gray-500">Круг/Овал</div>
        </div>
      </button>
      <button
        @click="$emit('add-type', 'strip')"
        class="card-metallic p-2.5 rounded-xl flex items-center gap-2 active:scale-95 hover:border-metric-green/30 transition-all"
      >
        <div class="w-5 h-2 bg-metric-silver rotate-45 rounded-sm shrink-0"></div>
        <div class="text-left min-w-0">
          <div class="font-bold text-[10px] text-white">Полоса</div>
          <div class="text-[9px] text-gray-500">Царапина</div>
        </div>
      </button>
    </div>
    <!-- Предварительная цена -->
    <div class="text-center text-[11px] text-gray-400">
      Предварительно: {{ previewPrice > 0 ? '~ ' + formatPrice(previewPrice) + ' ₽' : '—' }}
    </div>
    <!-- Кнопка перехода -->
    <button
      type="button"
      @click="$emit('next')"
      :disabled="!canNext"
      :title="canNext ? '' : 'Добавьте хотя бы одну вмятину'"
      class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      :class="canNext ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
    >
      <span>Продолжить → Размеры</span>
    </button>
    <p v-if="!canNext" class="text-[10px] text-gray-500 text-center">Добавьте хотя бы одну вмятину</p>
  </div>
</template>

<script setup>
const props = defineProps({
  previewPrice: { type: Number, default: 0 },
  canNext: { type: Boolean, default: false }
});

defineEmits(['add-type', 'next']);

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>
