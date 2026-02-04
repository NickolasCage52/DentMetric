<template>
  <div class="max-w-md mx-auto relative h-screen flex flex-col bg-black text-white pb-[env(safe-area-inset-bottom)]">
    <!-- Tab: Calc -->
    <div v-if="currentTab === 'calc'" class="flex flex-col h-full">
      <div v-if="calcMode !== 'graphics'" class="p-4 space-y-4 shrink-0 z-20 bg-black">
        <div class="flex justify-center pt-2 pb-2">
          <img src="/logo.png" alt="DentMetric" class="w-full max-w-[320px] h-auto object-contain drop-shadow-2xl" onerror="this.style.display='none'">
        </div>
        <div class="card-metallic rounded-2xl p-4 relative overflow-hidden text-center">
          <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div class="text-[11px] uppercase font-bold text-gray-400 tracking-widest mb-1">Итоговая оценка</div>
          <div
            class="text-5xl font-black transition-all duration-300"
            :class="totalPrice > 0 ? 'text-metric-green drop-shadow-[0_0_15px_rgba(136,229,35,0.3)]' : 'text-gray-600'"
          >
            {{ totalPrice > 0 ? formatCurrency(totalPrice) : '---' }}
            <span v-if="totalPrice > 0" class="text-2xl align-top">₽</span>
          </div>
          <div
            class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-4 blur-xl transition-all duration-300"
            :class="totalPrice > 0 ? 'bg-metric-green/10' : 'bg-transparent'"
          ></div>
        </div>
        <div class="flex space-x-1 bg-[#151515] p-1 rounded-xl border border-[#333]">
          <button
            @click="setMode('standard')"
            class="flex-1 py-3 text-xs font-bold rounded-lg transition-all uppercase tracking-wide"
            :class="calcMode === 'standard' ? 'bg-metric-green text-black shadow-neon' : 'text-gray-400 hover:text-white'"
          >
            Стандарт
          </button>
          <button
            @click="setMode('time')"
            class="flex-1 py-3 text-xs font-bold rounded-lg transition-all uppercase tracking-wide"
            :class="calcMode === 'time' ? 'bg-metric-green text-black shadow-neon' : 'text-gray-400 hover:text-white'"
          >
            Время
          </button>
          <button
            @click="setMode('graphics')"
            class="flex-1 py-3 text-xs font-bold rounded-lg transition-all uppercase tracking-wide"
            :class="calcMode === 'graphics' ? 'bg-metric-green text-black shadow-neon' : 'text-gray-400 hover:text-white'"
          >
            Графика
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 pt-0 pb-24" :class="{ 'overflow-hidden h-0': calcMode === 'graphics' }">
        <!-- Standard mode -->
        <div v-if="calcMode === 'standard'" class="space-y-4">
          <div class="card-metallic rounded-2xl p-5">
            <div class="mb-5">
              <div class="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Тип повреждения</div>
              <div class="flex space-x-3">
                <div
                  @click="setShape('circle')"
                  class="flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border"
                  :class="form.shape === 'circle' ? 'bg-[#222] border-metric-green shadow-neon' : 'bg-[#151515] border-white/5 hover:border-white/10'"
                >
                  <div
                    class="w-4 h-4 rounded-full border-2 mb-2 shadow-[0_0_5px_currentColor]"
                    :class="form.shape === 'circle' ? 'border-metric-green bg-metric-green' : 'border-gray-500'"
                  ></div>
                  <span class="text-xs font-bold uppercase" :class="form.shape === 'circle' ? 'text-white' : 'text-gray-400'">Круг/Овал</span>
                </div>
                <div
                  @click="setShape('strip')"
                  class="flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border"
                  :class="form.shape === 'strip' ? 'bg-[#222] border-metric-green shadow-neon' : 'bg-[#151515] border-white/5 hover:border-white/10'"
                >
                  <div
                    class="w-6 h-2 rounded-sm mb-3 shadow-[0_0_5px_currentColor]"
                    :class="form.shape === 'strip' ? 'bg-metric-green' : 'bg-gray-500'"
                  ></div>
                  <span class="text-xs font-bold uppercase" :class="form.shape === 'strip' ? 'text-white' : 'text-gray-400'">Полоса</span>
                </div>
              </div>
              <br />
              <div class="mb-2">
                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Размер</label>
                <div class="relative group">
                  <select
                    v-model="form.sizeCode"
                    required
                    class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                  >
                    <option :value="null" disabled selected>Выберите размер</option>
                    <option v-for="size in currentSizeList" :key="size.code" :value="size.code">{{ size.name }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-metallic rounded-2xl p-5">
            <div class="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Технология</div>
            <div class="relative">
              <select
                v-model="form.repairCode"
                required
                class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
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
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Сложность</label>
              <div class="relative">
                <select
                  v-model="form.riskCode"
                  required
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                >
                  <option :value="null" disabled selected>Выберите сложность</option>
                  <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Материал</label>
              <div class="relative">
                <select
                  v-model="form.materialCode"
                  required
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                >
                  <option :value="null" disabled selected>Выберите материал</option>
                  <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Класс авто</label>
              <div class="relative">
                <select
                  v-model="form.carClassCode"
                  required
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
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
                v-model="form.disassemblyCode"
                required
                class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
              >
                <option :value="null" disabled selected>Выберите арматурные работы</option>
                <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <button
            @click="resetForm"
            class="w-full py-4 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-900/10 border border-transparent hover:border-red-900/20 rounded-xl transition-all flex items-center justify-center space-x-2 opacity-80 hover:opacity-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Сбросить параметры</span>
          </button>
        </div>

        <!-- Time mode -->
        <div v-if="calcMode === 'time'" class="space-y-4">
          <div class="card-metallic rounded-2xl p-5">
            <div class="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Специалист</div>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <select
                  v-model="form.masterIndex"
                  required
                  @change="updateRateFromMaster"
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                >
                  <option :value="null" disabled selected>Выберите специалиста</option>
                  <option v-for="(m, idx) in userSettings.masters" :key="idx" :value="idx">{{ m.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div class="flex items-center bg-[#151515] border border-[#333] rounded-xl px-4 min-w-[100px] justify-center shadow-inner">
                <span class="text-sm font-bold" :class="userSettings.hourlyRate > 0 ? 'text-metric-green' : 'text-gray-600'">
                  {{ userSettings.hourlyRate > 0 ? formatCurrency(userSettings.hourlyRate) : '---' }}
                </span>
              </div>
            </div>
          </div>
          <div class="card-metallic rounded-2xl p-5">
            <div class="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Технология</div>
            <div class="relative">
              <select
                v-model="form.repairCode"
                required
                class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
              >
                <option :value="null" disabled selected>Выберите технологию</option>
                <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div class="card-metallic rounded-2xl p-5">
            <div class="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Трудозатраты (Часы)</div>
            <input
              type="number"
              v-model.number="form.hours"
              min="0"
              step="0.5"
              placeholder="Введите часы"
              inputmode="decimal"
              class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-xl font-bold shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none transition-colors placeholder-gray-600"
            >
          </div>
          <div class="card-metallic rounded-2xl p-5 space-y-4">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Условия</div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Сложность</label>
              <div class="relative">
                <select
                  v-model="form.riskCode"
                  required
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                >
                  <option :value="null" disabled selected>Выберите сложность</option>
                  <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Материал</label>
              <div class="relative">
                <select
                  v-model="form.materialCode"
                  required
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                >
                  <option :value="null" disabled selected>Выберите материал</option>
                  <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Класс авто</label>
              <div class="relative">
                <select
                  v-model="form.carClassCode"
                  required
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
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
                v-model="form.disassemblyCode"
                required
                class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
              >
                <option :value="null" disabled selected>Выберите арматурные работы</option>
                <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <button
            @click="resetForm"
            class="w-full py-4 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-900/10 border border-transparent hover:border-red-900/20 rounded-xl transition-all flex items-center justify-center space-x-2 opacity-80 hover:opacity-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Сбросить параметры</span>
          </button>
        </div>

        <!-- Graphics mode: wizard из 4 шагов -->
        <GraphicsWizard
          v-if="calcMode === 'graphics'"
          v-model:selected-class-id="graphicsSelectedClassId"
          v-model:selected-part-id="graphicsSelectedPartId"
          :form="form"
          :initial-data="initialData"
          :user-settings="userSettings"
          :car-classes="graphicsData.carClasses"
          :parts-list="graphicsPartsList"
          :selected-part="graphicsState.selectedPart"
          :circle-sizes="graphicsCircleSizes"
          :strip-sizes="graphicsStripSizes"
          @close="closeEditor"
          @dents-change="(d) => graphicsState.dents = d"
        />
      </div>
    </div>

    <!-- Tab: Settings -->
    <div v-if="currentTab === 'settings'" class="p-4 space-y-4 overflow-y-auto pb-24">
      <div class="card-metallic rounded-2xl p-5">
        <h2 class="text-xl font-bold mb-1 text-white">Настройки</h2>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-3">
        <div class="flex justify-between items-center mb-4">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Мастера</div>
          <button @click="addMaster" class="text-xs text-metric-green border border-metric-green px-2 py-1 rounded hover:bg-metric-green hover:text-black transition-colors">+ Добавить</button>
        </div>
        <div class="space-y-3">
          <div v-for="(m, idx) in userSettings.masters" :key="idx" class="flex gap-2 items-center">
            <input v-model="m.name" placeholder="Имя" class="flex-1 bg-[#151515] border border-[#333] rounded-lg p-2 text-sm text-white focus:border-metric-green outline-none">
            <input type="number" v-model.number="m.rate" placeholder="₽/час" class="w-20 bg-[#151515] border border-[#333] rounded-lg p-2 text-sm text-right text-white focus:border-metric-green outline-none">
            <button @click="removeMaster(idx)" class="text-red-500 p-2 hover:bg-red-900/20 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <div class="text-[10px] font-bold text-metric-green uppercase mb-4 tracking-widest">Круг/Овал (База)</div>
        <div v-for="size in initialData.circleSizes" :key="size.code" class="flex items-center justify-between mb-3 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
          <div class="flex flex-col">
            <span class="font-bold text-sm text-gray-300">{{ size.code }}</span>
            <span class="text-xs text-gray-500">{{ size.name }}</span>
          </div>
          <input type="number" v-model.number="userSettings.prices[size.code]" inputmode="numeric" class="w-28 bg-[#151515] border border-[#333] rounded-lg p-2 text-right font-medium text-white shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none">
        </div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <div class="text-[10px] font-bold text-metric-green uppercase mb-4 tracking-widest">Полосы (База)</div>
        <div v-for="size in initialData.stripSizes" :key="size.code" class="flex items-center justify-between mb-3 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
          <div class="flex flex-col">
            <span class="font-bold text-sm text-gray-300">{{ size.code }}</span>
            <span class="text-xs text-gray-500">{{ size.name }}</span>
          </div>
          <input type="number" v-model.number="userSettings.prices[size.code]" inputmode="numeric" class="w-28 bg-[#151515] border border-[#333] rounded-lg p-2 text-right font-medium text-white shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none">
        </div>
      </div>
      <div class="flex flex-col space-y-3 pt-4">
        <button @click="saveSettings" class="w-full bg-metric-green text-black font-bold py-3.5 rounded-xl active:opacity-90 transition-opacity shadow-[0_0_15px_rgba(136,229,35,0.4)]">Сохранить настройки</button>
        <button @click="resetDefaults" class="w-full text-gray-400 text-sm font-medium py-3 hover:text-white transition-colors">Сбросить к стандартным</button>
      </div>
    </div>

    <!-- Tab: Info -->
    <div v-if="currentTab === 'info'" class="p-4 space-y-3 overflow-y-auto pb-24">
      <div class="flex items-center justify-center pb-4">
        <div class="px-5 py-1.5 rounded-full border border-white/10 bg-[#1a1a1a] shadow-lg">
          <span class="text-[10px] font-bold uppercase text-metric-green tracking-widest">Инструкция & FAQ</span>
        </div>
      </div>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">ℹ️</span>
            <span class="font-bold text-sm text-white">О приложении</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <ul class="space-y-2 list-disc pl-4 marker:text-metric-green">
            <li>Калькулятор считает стоимость ремонта одной вмятины.</li>
            <li>Поддерживает три режима: <span class="text-white font-bold">Стандартный</span>, <span class="text-white font-bold">По времени</span> и <span class="text-white font-bold">Графика</span>.</li>
            <li>Одна строка расчёта = одно повреждение. Пакетные скидки не учитываются.</li>
          </ul>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">🛠️</span>
            <span class="font-bold text-sm text-white">Как пользоваться</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <ol class="space-y-3 list-decimal pl-4 marker:text-metric-green marker:font-bold">
            <li>Выберите режим расчета (сверху).</li>
            <li>Укажите тип повреждения (Круг/Овал или Полоса).</li>
            <li>Выберите размер (S2-S11 или LS1-LS8). Это база цены.</li>
            <li>Настройте коэффициенты (Сложность, Материал, Класс, Разборка).</li>
            <li>Итоговая цена обновится автоматически.</li>
          </ol>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">📖</span>
            <span class="font-bold text-sm text-white">Расшифровка параметров</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4 space-y-5">
          <div>
            <div class="font-bold text-metric-green text-[10px] uppercase mb-1 tracking-widest">РАЗМЕР</div>
            <div class="text-gray-400 leading-snug">S (Круг) и LS (Полоса). Является основой базовой цены.</div>
          </div>
          <div>
            <div class="font-bold text-metric-green text-[10px] uppercase mb-2 tracking-widest">СЛОЖНОСТЬ (K)</div>
            <div class="space-y-1.5">
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K1:</span><span>Лёгкая</span></div>
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K2:</span><span>Средняя</span></div>
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K3:</span><span>Сложная — заломы, плохой доступ.</span></div>
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K4:</span><span>Экстра — острые складки, ребра.</span></div>
            </div>
          </div>
          <div>
            <div class="font-bold text-metric-green text-[10px] uppercase mb-1 tracking-widest">КЛАСС АВТО</div>
            <div class="text-gray-400 leading-snug">Стандарт (x1.0), Премиум/Новый (x1.2).</div>
          </div>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">⏱️</span>
            <span class="font-bold text-sm text-white">Режим «По времени»</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <p class="mb-4 leading-snug">Используется для нестандартных или очень сложных случаев.</p>
          <div class="bg-[#151515] border border-white/10 rounded-lg p-3 font-mono text-xs text-metric-green flex items-center justify-center">
            Цена = (Часы × Ставка) × Коэффициенты
          </div>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">🎨</span>
            <span class="font-bold text-sm text-white">Графический режим</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <p class="mb-2">Расчет на основе площади и расположения повреждения.</p>
          <ol class="space-y-2 list-decimal pl-4 marker:text-metric-green marker:font-bold">
            <li>Выберите класс авто и деталь.</li>
            <li>Добавьте вмятину (Круг) или полосу.</li>
            <li>Перетаскивайте и меняйте размер фигуры.</li>
            <li><b class="text-white">Сложные зоны:</b> Если фигура пересекает красную зону (ребро), цена автоматически увеличивается.</li>
          </ol>
        </div>
      </details>
      <div class="border border-red-500/30 bg-red-900/10 rounded-2xl p-4 flex gap-4 items-start mt-4">
        <div class="text-2xl pt-1">⚠️</div>
        <div>
          <div class="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">Важно</div>
          <div class="text-sm text-gray-300 leading-relaxed">
            Цена является ориентировочной. Окончательная стоимость может меняться после живого осмотра и дефектовки мастером.
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom tabs -->
    <div class="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-[#222] flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="switchTab(tab.id)"
        class="flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300"
        :class="currentTab === tab.id ? 'text-metric-green scale-105' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">{{ tab.icon }}</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { deleteSelected } from './graphics/konvaEditor';
import { initialData } from './data/initialData';
import { CAR_PARTS } from './data/carParts';
import { getPartsByClass } from './data/partsCatalog';
import { circleSizesWithArea, stripSizesWithArea } from './data/dentSizes';
import { applyConditionsToBase, calcBasePriceFromDents, calcTotalPrice } from './utils/priceCalc';
import ConditionsPanel from './components/ConditionsPanel.vue';
import GraphicsWizard from './components/graphics/GraphicsWizard.vue';

// Tabs & mode
const currentTab = ref('calc');
const calcMode = ref('standard');

const tabs = [
  { id: 'calc', label: 'Калькулятор', icon: '🧮' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
  { id: 'info', label: 'Инфо', icon: 'ℹ️' }
];

// Form (standard / time)
const form = reactive({
  shape: 'circle',
  sizeCode: null,
  repairCode: null,
  riskCode: null,
  materialCode: null,
  carClassCode: null,
  disassemblyCode: null,
  hours: null,
  masterIndex: null
});

// User settings
const buildDefaultPrices = () => {
  const p = {};
  initialData.circleSizes.forEach(s => { p[s.code] = s.basePrice; });
  initialData.stripSizes.forEach(s => { p[s.code] = s.basePrice; });
  return p;
};

const userSettings = reactive({
  prices: buildDefaultPrices(),
  masters: JSON.parse(JSON.stringify(initialData.defaultMasters)),
  hourlyRate: 0
});

const saved = localStorage.getItem('dentRepairSettings_v5');
if (saved) {
  try {
    const p = JSON.parse(saved);
    if (p.prices) Object.assign(userSettings.prices, p.prices);
    if (p.masters) userSettings.masters = p.masters;
  } catch (e) {
    if (import.meta.env?.DEV) console.error('Failed to load settings', e);
  }
}

// Graphics state
const graphicsState = reactive({
  selectedClass: null,
  selectedPart: null,
  dents: []
});

const graphicsData = {
  carClasses: [
    { id: 'sedan', name: 'Седан', icon: '🚗' },
    { id: 'crossover', name: 'Кроссовер', icon: '🚙' },
    { id: 'suv', name: 'Внедорожник', icon: '🚜' }
  ]
};

/** Список деталей для выбранного класса (для dropdown). */
const graphicsPartsList = computed(() => {
  if (graphicsState.selectedClass?.id === 'crossover') {
    return getPartsByClass('crossover');
  }
  return Object.values(CAR_PARTS);
});

const graphicsSelectedClassId = ref('crossover');
const graphicsSelectedPartId = ref('hood');

watch([graphicsState.selectedClass, graphicsState.selectedPart], () => {
  if (graphicsState.selectedClass) graphicsSelectedClassId.value = graphicsState.selectedClass.id;
  if (graphicsState.selectedPart) graphicsSelectedPartId.value = graphicsState.selectedPart.id;
}, { immediate: true });

watch([graphicsSelectedClassId, graphicsSelectedPartId], () => {
  ensureGraphicsSelection();
}, { immediate: true });

function ensureGraphicsSelection() {
  const classId = graphicsSelectedClassId.value || graphicsData.carClasses[0]?.id;
  const cls = graphicsData.carClasses.find((c) => c.id === classId) || graphicsData.carClasses[0];
  graphicsState.selectedClass = cls || null;
  const list = cls?.id === 'crossover' ? getPartsByClass('crossover') : Object.values(CAR_PARTS);
  const partId = graphicsSelectedPartId.value;
  let part = list.find((p) => p.id === partId);
  if (!part) part = list[0] || null;
  graphicsState.selectedPart = part;
  if (part) graphicsSelectedPartId.value = part.id;
  if (cls) graphicsSelectedClassId.value = cls.id;
}

// Computed
const currentSizeList = computed(() =>
  form.shape === 'circle' ? initialData.circleSizes : initialData.stripSizes
);

/** В графике для круга: мм-размеры для кроссовера (капот, двери, крыло), иначе legacy */
const graphicsCircleSizes = computed(() => {
  const part = graphicsState.selectedPart;
  if (part?.realSizeMm && part?.asset?.type === 'image') {
    return circleSizesWithArea;
  }
  return initialData.circleSizes;
});

/** В графике для полосы: мм-размеры для кроссовера — единая механика как на капоте */
const graphicsStripSizes = computed(() => {
  const part = graphicsState.selectedPart;
  if (part?.realSizeMm && part?.asset?.type === 'image') {
    return stripSizesWithArea;
  }
  return initialData.stripSizes;
});

const standardPrice = computed(() => {
  if (!form.sizeCode) return 0;
  const base = userSettings.prices[form.sizeCode] || 0;
  return applyConditionsToBase(base, form, initialData, form.sizeCode, 100);
});

const timePrice = computed(() => {
  if (!form.hours) return 0;
  const laborBase = form.hours * userSettings.hourlyRate;
  return applyConditionsToBase(laborBase, form, initialData, 'STRIP_DEFAULT', 100);
});

/** База от вмятин: сумма базовых цен (каждая вмятина отдельно). Единый источник: priceCalc.calcBasePriceFromDents. */
const graphicsBasePrice = computed(() => calcBasePriceFromDents(graphicsState.dents));

/** Итоговая цена в Графике: каждая вмятина отдельно, затем сумма. Единый источник: priceCalc.calcTotalPrice. */
const graphicsPrice = computed(() =>
  calcTotalPrice(graphicsState.dents, form, initialData, 100)
);

const totalPrice = computed(() => {
  if (currentTab.value !== 'calc') return 0;
  if (calcMode.value === 'standard') return standardPrice.value;
  if (calcMode.value === 'time') return timePrice.value;
  if (calcMode.value === 'graphics') return graphicsPrice.value;
  return 0;
});

// Helpers
const formatCurrency = (v) => new Intl.NumberFormat('ru-RU').format(v);

const haptic = (type) => {
  const tg = window.Telegram?.WebApp;
  if (!tg?.HapticFeedback) return;
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
    if (type === 'selection') tg.HapticFeedback.selectionChanged();
    if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
  }
};

const setMode = (mode) => {
  calcMode.value = mode;
  haptic('selection');
  if (mode === 'graphics') {
    if (window.Telegram?.WebApp?.expand) window.Telegram.WebApp.expand();
    ensureGraphicsSelection();
  }
};

const switchTab = (tab) => {
  currentTab.value = tab;
  haptic('selection');
};

const setShape = (s) => {
  form.shape = s;
  form.sizeCode = null;
  haptic('selection');
};

const resetForm = () => {
  form.sizeCode = null;
  form.repairCode = null;
  form.riskCode = null;
  form.materialCode = null;
  form.carClassCode = null;
  form.disassemblyCode = null;
  form.hours = null;
  form.masterIndex = null;
  haptic('selection');
};

const updateRateFromMaster = () => {
  if (form.masterIndex !== null) {
    userSettings.hourlyRate = userSettings.masters[form.masterIndex].rate;
  }
};

const addMaster = () => userSettings.masters.push({ name: '', rate: 0 });
const removeMaster = (i) => userSettings.masters.splice(i, 1);

const saveSettings = () => {
  const dataToSave = { prices: userSettings.prices, masters: userSettings.masters };
  localStorage.setItem('dentRepairSettings_v5', JSON.stringify(dataToSave));
  const tg = window.Telegram?.WebApp;
  if (tg?.showPopup && tg?.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
    tg.showPopup({ title: 'Готово', message: 'Настройки сохранены', buttons: [{ type: 'ok' }] });
  } else {
    alert('Настройки сохранены');
  }
  haptic('success');
};

const resetDefaults = () => {
  if (confirm('Сбросить цены к стандартным?')) {
    Object.assign(userSettings.prices, buildDefaultPrices());
    saveSettings();
  }
};

// Graphics
const closeEditor = () => {
  calcMode.value = 'standard';
  graphicsState.dents = [];
  haptic('selection');
};

// Telegram Main Button
watch(totalPrice, (val) => {
  const btn = window.Telegram?.WebApp?.MainButton;
  if (!btn) return;
  if (val > 0) {
    btn.setText(`ИТОГО: ${formatCurrency(val)} ₽`);
    btn.show();
  } else {
    btn.hide();
  }
});

const handleKeyDown = (e) => {
  if (calcMode.value !== 'graphics') return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = document.activeElement;
    const isEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (typeof active.isContentEditable === 'boolean' && active.isContentEditable));
    if (isEditable) return;
    e.preventDefault();
    deleteSelected();
  }
};

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.MainButton.setParams({ color: '#88E523', text_color: '#000000' });
  }
  window.addEventListener('keydown', handleKeyDown);
});

watch(
  () => calcMode.value === 'graphics',
  (isGraphics) => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('graphics-fullscreen-active', isGraphics);
    if (isGraphics && window.Telegram?.WebApp?.expand) window.Telegram.WebApp.expand();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.text-metric-green { color: #88e523; }
.text-metric-silver { color: #a0aec0; }
.bg-metric-green { background-color: #88e523; }
.border-metric-green { border-color: #88e523; }
/* A) Тёмный фон редактора: перебить любые bg-white/konva-bg (Konva bgRect — страховка в konvaEditor.js) */
/* Матрица без отступов: padding 0, margin 0, width/height 100% */
.canvas-editor-wrap,
#canvas-wrapper,
#konva-container {
  background-color: #0b0f14 !important;
  background-image: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
}
.canvas-editor-wrap.konva-bg { background-image: none !important; }

/* Fullscreen: контейнер графики занимает весь экран (fixed), 100dvh, без прокрутки body */
/* Safe area только на header и controls, НЕ на matrixArea */
.graphics-fullscreen-wrapper {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  padding: 0;
  margin: 0;
  border-radius: 0;
  background: #000;
}

.graphics-header {
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.graphics-stage-area {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
}

.graphics-controls-area {
  flex-shrink: 0;
  max-height: 45vh;
  overflow-y: auto;
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

/* Body без прокрутки при активной графике */
body.graphics-fullscreen-active {
  overflow: hidden;
  height: 100dvh;
}

/* Fullscreen pseudo (кнопка «полноэкранный») */
.graphics-fullscreen-wrapper.graphics-fullscreen-pseudo {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>

<!-- build test -->
