<template>
  <div class="p-2 space-y-2">
    <!-- Свободное растяжение -->
    <div class="flex items-center gap-2">
      <label class="flex items-center gap-2 cursor-pointer text-[10px] text-gray-400">
        <input
          type="checkbox"
          :checked="freeStretch"
          @change="$emit('update:freeStretch', $event.target.checked)"
          class="rounded border-white/20 bg-[#151515] text-metric-green focus:ring-metric-green/50"
        />
        <span>Свободное растяжение (неправильная форма)</span>
      </label>
    </div>
    <!-- Размеры (мм) -->
    <div
      v-if="selectedDentSize"
      class="rounded-xl bg-black/35 border border-white/10 p-2.5"
    >
      <div class="text-[10px] uppercase font-bold text-metric-green tracking-widest mb-2">Размеры (мм)</div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] text-gray-500 mb-1">{{ selectedDentSize.type === 'circle' ? 'Ширина' : 'Длина' }}</label>
          <input
            :value="sizeWidthMm"
            @input="$emit('update:sizeWidthMm', Number($event.target.value))"
            type="number"
            min="0.1"
            max="2000"
            step="0.5"
            inputmode="numeric"
            class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-1.5 text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none"
            @focus="$emit('dimensions-focus')"
          />
        </div>
        <div>
          <label class="block text-[10px] text-gray-500 mb-1">{{ selectedDentSize.type === 'circle' ? 'Высота' : 'Ширина' }}</label>
          <input
            :value="sizeHeightMm"
            @input="$emit('update:sizeHeightMm', Number($event.target.value))"
            type="number"
            min="0.1"
            max="2000"
            step="0.5"
            inputmode="numeric"
            class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-1.5 text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none"
            @focus="$emit('dimensions-focus')"
          />
        </div>
      </div>
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
      class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      :class="canNext ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
    >
      <span>Продолжить → Условия</span>
    </button>
    <p v-if="!canNext" class="text-[10px] text-gray-500 text-center">Размеры должны быть больше 0</p>
  </div>
</template>

<script setup>
defineProps({
  selectedDentSize: { type: Object, default: null },
  sizeWidthMm: { type: Number, default: 0 },
  sizeHeightMm: { type: Number, default: 0 },
  freeStretch: { type: Boolean, default: false },
  previewPrice: { type: Number, default: 0 },
  canNext: { type: Boolean, default: false }
});

defineEmits(['update:freeStretch', 'update:sizeWidthMm', 'update:sizeHeightMm', 'dimensions-focus', 'next']);

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>
