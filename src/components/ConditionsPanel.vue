<template>
  <div class="conditions-panel">
    <details
      v-if="compact"
      class="card-metallic rounded-xl overflow-hidden border border-white/10"
      :open="openWhenFormed"
    >
      <summary class="flex items-center justify-between p-3 cursor-pointer select-none list-none border-b border-white/5">
        <span class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Условия и коэффициенты</span>
        <svg class="w-4 h-4 text-gray-500 transition-transform duration-200 details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </summary>
      <div class="p-3 space-y-3">
        <template v-if="disabled">
          <p class="text-xs text-gray-500 italic">Сначала разместите и задайте размер вмятины.</p>
        </template>
        <template v-else>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Технология ремонта</label>
              <select :value="model.repairCode" @change="(e) => update('repairCode', e.target.value)" class="conditions-select-compact w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:border-metric-green/50 outline-none disabled:opacity-60">
                <option :value="null" disabled selected>Выберите технологию</option>
                <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Сложность выполнения</label>
              <select :value="model.riskCode" @change="(e) => update('riskCode', e.target.value)" class="conditions-select-compact w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:border-metric-green/50 outline-none disabled:opacity-60">
                <option :value="null" disabled selected>Выберите</option>
                <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Материал панели</label>
              <select :value="model.materialCode" @change="(e) => update('materialCode', e.target.value)" class="conditions-select-compact w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:border-metric-green/50 outline-none disabled:opacity-60">
                <option :value="null" disabled selected>Выберите материал</option>
                <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Класс автомобиля</label>
              <select :value="model.carClassCode" @change="(e) => update('carClassCode', e.target.value)" class="conditions-select-compact w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:border-metric-green/50 outline-none disabled:opacity-60">
                <option :value="null" disabled selected>Выберите класс авто</option>
                <option v-for="c in initialData.carClasses" :key="c.code" :value="c.code">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Арматурные работы</label>
              <select :value="model.disassemblyCode" @change="(e) => update('disassemblyCode', e.target.value)" class="conditions-select-compact w-full bg-[#151515] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:border-metric-green/50 outline-none disabled:opacity-60">
                <option :value="null" disabled selected>Выберите арматурные работы</option>
                <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
            </div>
          </div>
        </template>
      </div>
    </details>

    <template v-else>
      <div class="card-metallic rounded-2xl p-5">
        <div class="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Технология ремонта</div>
        <div class="relative">
          <select
            :value="model.repairCode"
            @change="(e) => update('repairCode', e.target.value)"
            :disabled="disabled"
            class="conditions-select w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors disabled:opacity-60"
          >
            <option :value="null" disabled selected>Выберите технологию</option>
            <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-4">
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Условия</div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Сложность выполнения</label>
          <div class="relative">
            <select
              :value="model.riskCode"
              @change="(e) => update('riskCode', e.target.value)"
              :disabled="disabled"
              class="conditions-select w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors disabled:opacity-60"
            >
              <option :value="null" disabled selected>Выберите</option>
              <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Материал панели</label>
          <div class="relative">
            <select
              :value="model.materialCode"
              @change="(e) => update('materialCode', e.target.value)"
              :disabled="disabled"
              class="conditions-select w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors disabled:opacity-60"
            >
              <option :value="null" disabled selected>Выберите материал</option>
              <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Класс автомобиля</label>
          <div class="relative">
            <select
              :value="model.carClassCode"
              @change="(e) => update('carClassCode', e.target.value)"
              :disabled="disabled"
              class="conditions-select w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors disabled:opacity-60"
            >
              <option :value="null" disabled selected>Выберите класс авто</option>
              <option v-for="c in initialData.carClasses" :key="c.code" :value="c.code">{{ c.name }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
          </div>
        </div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <div class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Дополнительно</div>
        <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Арматурные работы</label>
        <div class="relative">
          <select
            :value="model.disassemblyCode"
            @change="(e) => update('disassemblyCode', e.target.value)"
            :disabled="disabled"
            class="conditions-select w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors disabled:opacity-60"
          >
            <option :value="null" disabled selected>Выберите арматурные работы</option>
            <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Реактивный объект с полями repairCode, riskCode, materialCode, carClassCode, disassemblyCode */
  model: { type: Object, required: true },
  initialData: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  /** Компактный режим (аккордеон для Графика) */
  compact: { type: Boolean, default: false },
  /** Открыть аккордеон по умолчанию (когда вмятина сформирована) */
  openWhenFormed: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

function update(field, value) {
  if (!props.model) return;
  props.model[field] = value;
  emit('update:modelValue', props.model);
}
</script>

<style scoped>
.conditions-panel :deep(.details-chevron) {
  transition: transform 0.2s;
}
details[open] .details-chevron {
  transform: rotate(180deg);
}
</style>
