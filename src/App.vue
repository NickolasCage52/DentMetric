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

        <!-- Graphics mode: fullscreen layout, dropdowns для класса и детали, без отдельных экранов -->
        <div v-if="calcMode === 'graphics'" ref="graphicsRoot" class="graphics-fullscreen-wrapper">
          <!-- Header: назад, селекты, fullscreen, сброс -->
          <header class="graphics-header shrink-0 flex items-center gap-2 px-2 py-1.5 border-b border-white/10 bg-black/60">
            <button @click="closeEditor" class="text-metric-silver hover:text-white p-1.5 rounded border border-white/10 shrink-0" aria-label="Назад">←</button>
            <div class="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
              <select
                v-model="graphicsSelectedClassId"
                :disabled="isLockedSelection"
                @change="onGraphicsClassChange"
                class="graphics-select flex-1 min-w-0 max-w-[140px] bg-[#151515] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-white focus:border-metric-green/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                <option v-for="cls in graphicsData.carClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
              </select>
              <select
                v-model="graphicsSelectedPartId"
                :disabled="isLockedSelection"
                @change="onGraphicsPartChange"
                class="graphics-select flex-1 min-w-0 max-w-[160px] bg-[#151515] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-white focus:border-metric-green/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                <option v-for="part in graphicsPartsList" :key="part.id" :value="part.id">{{ part.name }}</option>
              </select>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button @click="resetGraphics" class="text-xs text-red-400 px-2 py-1 hover:text-red-300 shrink-0">Сброс</button>
            </div>
          </header>
          <!-- Stage: на шаге conditions — превью детали (фикс. высота); на edit — flex-1 -->
          <div
            class="graphics-stage-area flex flex-col w-full border-b border-white/10"
            :class="graphicsWizardStep === 'conditions' ? 'graphics-stage-preview shrink-0' : 'flex-1 min-h-0'"
          >
            <div
              id="canvas-wrapper"
              class="canvas-editor-wrap relative w-full overflow-hidden"
              :class="graphicsWizardStep === 'conditions' ? 'h-[40vh] min-h-[200px] max-h-[45vh]' : 'flex-1 min-h-0'"
              style="background-color: #0b0f14"
            >
              <div ref="konvaContainer" id="konva-container" class="absolute inset-0 w-full h-full" style="background-color: #0b0f14"></div>
              <!-- Режим "только просмотр": перехват всех кликов/тапов по канвасу (доп. к setEditorInteractive). -->
              <div
                v-if="graphicsWizardStep === 'conditions'"
                class="absolute inset-0 z-10 cursor-default pointer-events-auto"
                aria-label="Режим просмотра"
              ></div>
              <!-- Бейдж "Просмотр" на шаге conditions -->
              <div
                v-if="graphicsWizardStep === 'conditions'"
                class="absolute top-2 left-2 z-20 px-2 py-1 rounded-md bg-black/60 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-metric-silver pointer-events-none"
              >
                Просмотр
              </div>
              <!-- HUD Цена: сумма всех вмятин (без условий), всегда виден на шаге edit -->
              <div
                v-if="graphicsWizardStep === 'edit'"
                class="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/55 backdrop-blur-sm border border-white/10 text-[11px] font-medium pointer-events-none"
              >
                <svg class="w-3.5 h-3.5 text-metric-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="text-gray-400">Цена:</span>
                <span :class="basePriceTotal > 0 ? 'text-metric-green font-bold' : 'text-gray-500'">
                  {{ basePriceTotal > 0 ? formatCurrency(Math.round(basePriceTotal / 100) * 100) + ' ₽' : '---' }}
                </span>
              </div>
              <!-- D-pad и Zoom: только на шаге edit -->
              <div v-if="graphicsWizardStep === 'edit'" class="absolute inset-0 pointer-events-none p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex flex-col justify-end">
                <div class="flex items-end justify-between gap-1 pointer-events-none">
                  <div class="pointer-events-auto grid grid-cols-[28px_28px_28px] grid-rows-[28px_28px_28px] gap-0.5 rounded bg-black/35 backdrop-blur-sm border border-white/10 p-0.5 place-items-center shrink-0">
                    <span class="w-7 h-7"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(0, -40)" aria-label="Вверх" :disabled="editorZoom <= 1.01">↑</button>
                    <span class="w-7 h-7"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(-40, 0)" aria-label="Влево" :disabled="editorZoom <= 1.01">←</button>
                    <span class="w-7 h-7"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(40, 0)" aria-label="Вправо" :disabled="editorZoom <= 1.01">→</button>
                    <span class="w-7 h-7"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(0, 40)" aria-label="Вниз" :disabled="editorZoom <= 1.01">↓</button>
                    <span class="w-7 h-7"></span>
                  </div>
                  <div class="pointer-events-auto flex items-center gap-1 rounded bg-black/35 backdrop-blur-sm border border-white/10 p-1 max-w-[180px] min-w-0">
                    <button type="button" class="shrink-0 min-w-[32px] min-h-[32px] w-8 h-8 p-0.5 rounded border border-white/20 flex items-center justify-center text-metric-green font-bold text-sm hover:bg-white/10 hover:border-metric-green/50 active:scale-95" @click="editorZoomOut" aria-label="Уменьшить">−</button>
                    <input type="range" min="0.5" max="3" step="0.05" v-model.number="editorZoom" class="flex-1 min-w-0 w-[100px] max-w-[120px] h-1 rounded-full appearance-none bg-white/10 accent-[#88E523] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#88E523] [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#88E523] [&::-moz-range-thumb]:border-0" @input="editorZoomInput" />
                    <button type="button" class="shrink-0 min-w-[32px] min-h-[32px] w-8 h-8 p-0.5 rounded border border-white/20 flex items-center justify-center text-metric-green font-bold text-sm hover:bg-white/10 hover:border-metric-green/50 active:scale-95" @click="editorZoomIn" aria-label="Увеличить">+</button>
                    <span class="shrink-0 text-[10px] font-mono text-metric-green w-7 text-right">{{ Math.round(editorZoom * 100) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Controls-area: шаг edit — размещение; шаг conditions — только условия + "Назад" -->
          <div
            ref="graphicsControlsAreaRef"
            class="graphics-controls-area shrink-0 overflow-y-auto border-t border-white/10 bg-black/80"
            :style="controlsAreaKeyboardStyle"
          >
            <!-- Шаг "Условия": primary "Назад к редактированию", ConditionsPanel -->
            <template v-if="graphicsWizardStep === 'conditions'">
              <div class="p-2 mb-2 flex flex-col gap-2" ref="conditionsSectionRef">
                <button
                  type="button"
                  @click="backToEdit"
                  class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90 transition-opacity"
                >
                  <span aria-hidden="true">✎</span>
                  <span>Назад к редактированию</span>
                </button>
              </div>
              <div class="mx-2 mb-2">
                <ConditionsPanel
                  :model="form"
                  :initial-data="initialData"
                  :disabled="false"
                  compact
                  :open-when-formed="true"
                />
              </div>
            </template>

            <!-- Шаг "Размещение": тип вмятины, поворот/удалить, размеры, кнопка ГОТОВО -->
            <template v-else>
            <!-- Выбор типа вмятины -->
            <div class="grid grid-cols-2 gap-2 p-2">
              <button @click="openSizeMenu('circle')" class="card-metallic p-2.5 rounded-xl flex items-center gap-2 active:scale-95 hover:border-metric-green/30 transition-all">
                <div class="w-5 h-5 rounded-full border-2 border-metric-green bg-metric-green/20 shrink-0"></div>
                <div class="text-left min-w-0">
                  <div class="font-bold text-[10px] text-white">Вмятина</div>
                  <div class="text-[9px] text-gray-500">Круг/Овал</div>
                </div>
              </button>
              <button @click="openSizeMenu('strip')" class="card-metallic p-2.5 rounded-xl flex items-center gap-2 active:scale-95 hover:border-metric-green/30 transition-all">
                <div class="w-5 h-2 bg-metric-silver rotate-45 rounded-sm shrink-0"></div>
                <div class="text-left min-w-0">
                  <div class="font-bold text-[10px] text-white">Полоса</div>
                  <div class="text-[9px] text-gray-500">Царапина</div>
                </div>
              </button>
            </div>
            <!-- Поворот / Удалить / Свободное растяжение -->
            <div class="grid grid-cols-3 gap-2 px-2 pb-2 text-[11px]">
              <button type="button" class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 hover:border-metric-green/30 transition-all" @click="rotateLeft">
                <span class="text-base">⟲ -15°</span>
                <span class="text-[9px] text-gray-500">Повернуть</span>
              </button>
              <button type="button" class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 hover:border-metric-green/30 transition-all" @click="rotateRight">
                <span class="text-base">⟳ +15°</span>
                <span class="text-[9px] text-gray-500">Повернуть</span>
              </button>
              <button type="button" class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 hover:border-red-400/60 transition-all" @click="deleteCurrent">
                <span class="text-base text-red-400">✕</span>
                <span class="text-[9px] text-gray-500">Удалить</span>
              </button>
            </div>
            <div class="px-2 pb-2 flex items-center gap-2">
              <label class="flex items-center gap-2 cursor-pointer text-[10px] text-gray-400">
                <input type="checkbox" v-model="freeStretchMode" @change="onFreeStretchChange" class="rounded border-white/20 bg-[#151515] text-metric-green focus:ring-metric-green/50" />
                <span>Свободное растяжение (неправильная форма)</span>
              </label>
            </div>
            <!-- Размеры (мм): keyboard-aware -->
            <div
              v-if="selectedDentSize"
              ref="dimensionsPanelRef"
              :class="{ 'dimensions-panel-keyboard-open': isKeyboardOpen }"
              :style="dimensionsPanelKeyboardStyle"
              class="mx-2 mb-2 rounded-xl bg-black/35 border border-white/10 p-2.5 transition-[bottom] duration-200"
            >
              <div class="text-[10px] uppercase font-bold text-metric-green tracking-widest mb-2">Размеры (мм)</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] text-gray-500 mb-1">{{ selectedDentSize.type === 'circle' ? 'Ширина' : 'Длина' }}</label>
                  <input
                    v-model.number="sizeWidthMm"
                    type="number"
                    min="0.1"
                    max="2000"
                    step="0.5"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    enterkeyhint="done"
                    class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-1.5 text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none"
                    @focus="onDimensionsInputFocus"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-gray-500 mb-1">{{ selectedDentSize.type === 'circle' ? 'Высота' : 'Ширина' }}</label>
                  <input
                    v-model.number="sizeHeightMm"
                    type="number"
                    min="0.1"
                    max="2000"
                    step="0.5"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    enterkeyhint="done"
                    class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-1.5 text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none"
                    @focus="onDimensionsInputFocus"
                  />
                </div>
              </div>
            </div>
            <!-- Кнопка перехода на шаг "Условия": активна, если есть хотя бы одна вмятина. -->
            <div class="mx-2 mb-2">
              <button
                type="button"
                @click="goToConditionsStep"
                :disabled="!canGoToConditions"
                :title="canGoToConditions ? '' : 'Добавьте хотя бы одну вмятину'"
                class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                :class="canGoToConditions ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
              >
                <span>Перейти к условиям и коэффициентам</span>
              </button>
              <p v-if="!canGoToConditions" class="text-[10px] text-gray-500 mt-1 text-center">Добавьте хотя бы одну вмятину</p>
            </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Total price overlay (graphics step 3) -->
    <div
      v-if="currentTab === 'calc' && calcMode === 'graphics' && graphicsStep === 3"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 card-metallic rounded-2xl p-4 relative overflow-hidden text-center max-w-[90%]"
    >
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

    <!-- Size menu modal (graphics): по центру экрана; teleport в graphicsRoot при step 3 для fullscreen -->
    <Teleport :to="sizeMenuPortalTarget" :disabled="!sizeMenuPortalTarget">
      <div
        v-if="showSizeMenu"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        @click.self="showSizeMenu = false"
      >
        <div class="bg-[#151F2E] w-full max-w-md rounded-2xl p-5 border border-white/10 shadow-2xl space-y-4 pb-8 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 class="text-white font-bold text-lg pl-1">
            Выберите размер ({{ activeToolType === 'circle' ? 'Круг/Овал' : 'Полоса' }})
          </h3>
          <button @click="showSizeMenu = false" class="text-gray-400 p-2 text-xl">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          <button
            v-for="s in (activeToolType === 'circle' ? graphicsCircleSizes : initialData.stripSizes)"
            :key="s.code"
            @click="confirmAddShape(s.code)"
            class="card-metallic p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-metric-green/50"
          >
            <span class="text-metric-green font-bold text-base">{{ s.code }}</span>
            <span class="text-gray-400 text-xs text-center leading-tight">{{ s.name }}</span>
          </button>
        </div>
      </div>
      </div>
    </Teleport>

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
import { initKonva, destroyKonva, addDent, resetDents, rotateSelected, deleteSelected, setZoomCentered, getZoom, resizeStage, scheduleFit, panBy, setSelectedDentSizeMm, setKeepRatio, setEditorInteractive } from './graphics/konvaEditor';
import { initialData } from './data/initialData';
import { CAR_PARTS } from './data/carParts';
import { getPartsByClass } from './data/partsCatalog';
import { circleSizesWithArea } from './data/dentSizes';
import { applyConditionsToBase } from './utils/priceCalc';
import ConditionsPanel from './components/ConditionsPanel.vue';

// Tabs & mode
const currentTab = ref('calc');
const calcMode = ref('standard');
const graphicsStep = ref(1);
/** Шаг визарда в режиме Графика: 'edit' — размещение вмятины, 'conditions' — выбор коэффициентов. Переход только по кнопке "ГОТОВО". */
const graphicsWizardStep = ref('edit');

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
    console.error('Failed to load settings', e);
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

/** Блокировка выбора типа авто и детали на шаге "Условия". */
const isLockedSelection = computed(() => graphicsWizardStep.value === 'conditions');

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

function onGraphicsClassChange() {
  if (graphicsWizardStep.value === 'conditions') return;
  const cls = graphicsData.carClasses.find((c) => c.id === graphicsSelectedClassId.value);
  graphicsState.selectedClass = cls || null;
  const list = graphicsPartsList.value;
  graphicsState.selectedPart = list[0] || null;
  graphicsSelectedPartId.value = graphicsState.selectedPart?.id || '';
  nextTick(() => setTimeout(initKonvaEditor, 50));
}

function onGraphicsPartChange() {
  if (graphicsWizardStep.value === 'conditions') return;
  const part = graphicsPartsList.value.find((p) => p.id === graphicsSelectedPartId.value);
  graphicsState.selectedPart = part || null;
  nextTick(() => setTimeout(initKonvaEditor, 50));
}

const showSizeMenu = ref(false);
const activeToolType = ref(null);
const konvaContainer = ref(null);
const graphicsRoot = ref(null);
const editorZoom = ref(1);
/** Выбранная вмятина: размеры в мм для панели «Размеры (мм)». null если ничего не выбрано. */
const selectedDentSize = ref(null);
const sizeWidthMm = ref(0);
const sizeHeightMm = ref(0);
let sizeApplyTimeout = null;

/** Keyboard-aware: высота клавиатуры (px) для панели размеров на мобилке */
const keyboardInset = ref(0);
const isKeyboardOpen = computed(() => keyboardInset.value > 0);
let keyboardInsetRaf = null;
function updateKeyboardInset() {
  if (keyboardInsetRaf) return;
  keyboardInsetRaf = requestAnimationFrame(() => {
    keyboardInsetRaf = null;
    const vv = window.visualViewport;
    if (!vv) {
      keyboardInset.value = 0;
      return;
    }
    const inset = window.innerHeight - vv.height - (vv.offsetTop || 0);
    keyboardInset.value = Math.max(0, Math.round(inset));
  });
}
/** Стили панели размеров при открытой клавиатуре: фиксируем над клавиатурой */
const dimensionsPanelKeyboardStyle = computed(() => {
  if (!isKeyboardOpen.value) return undefined;
  const px = keyboardInset.value;
  return {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: `calc(12px + env(safe-area-inset-bottom, 0px) + ${px}px)`,
    maxHeight: `calc(100vh - ${px}px - 24px)`,
    zIndex: 1000,
    overflow: 'auto'
  };
});
let dimensionsScrollGuard = false;
/** При фокусе на input размеров — плавно поднять поле в зону видимости (над клавиатурой), без множественных скачков */
function onDimensionsInputFocus(event) {
  const el = event?.target;
  if (!el || !el.scrollIntoView) return;
  if (dimensionsScrollGuard) return;
  dimensionsScrollGuard = true;
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setTimeout(() => { dimensionsScrollGuard = false; }, 600);
    }, 150);
  });
}
watch(selectedDentSize, (info) => {
  if (info) {
    sizeWidthMm.value = Math.round(info.widthMm * 10) / 10;
    sizeHeightMm.value = Math.round(info.heightMm * 10) / 10;
  }
}, { immediate: true });

watch([sizeWidthMm, sizeHeightMm], () => {
  if (!selectedDentSize.value) return;
  if (sizeApplyTimeout) clearTimeout(sizeApplyTimeout);
  sizeApplyTimeout = setTimeout(() => {
    const w = Number(sizeWidthMm.value);
    const h = Number(sizeHeightMm.value);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      sizeApplyTimeout = null;
      return;
    }
    const cur = selectedDentSize.value;
    if (cur && Math.abs(cur.widthMm - w) < 0.01 && Math.abs(cur.heightMm - h) < 0.01) {
      sizeApplyTimeout = null;
      return;
    }
    setSelectedDentSizeMm(w, h);
    sizeApplyTimeout = null;
  }, 150);
});

// Computed
const currentSizeList = computed(() =>
  form.shape === 'circle' ? initialData.circleSizes : initialData.stripSizes
);

/** В графике для круга: мм-размеры для кроссовера, иначе legacy circleSizes */
const graphicsCircleSizes = computed(() => {
  const part = graphicsState.selectedPart;
  if (part?.realSizeMm && part?.asset?.type === 'image') {
    return circleSizesWithArea;
  }
  return initialData.circleSizes;
});

/** Teleport target for size menu: inside graphicsRoot when in graphics mode */
const sizeMenuPortalTarget = computed(() => {
  if (calcMode.value === 'graphics' && graphicsRoot.value) return graphicsRoot.value;
  return typeof document !== 'undefined' ? document.body : null;
});

/** В Графике условия (как в Стандарт/Время) применяются к базе от вмятин; используем общий form. */

/** Стиль панели контролов при открытой клавиатуре: поднять над клавиатурой */
const controlsAreaKeyboardStyle = computed(() => {
  if (!isKeyboardOpen.value) return undefined;
  const px = keyboardInset.value;
  return {
    paddingBottom: `calc(12px + env(safe-area-inset-bottom, 0px) + ${px}px)`
  };
});

/** Режим свободного растяжения (неправильная форма) для выбранной вмятины */
const freeStretchMode = ref(false);

function onFreeStretchChange() {
  setKeepRatio(!freeStretchMode.value);
}

const standardPrice = computed(() => {
  if (!form.sizeCode) return 0;
  const base = userSettings.prices[form.sizeCode] || 0;
  return applyConditionsToBase(base, form, initialData, form.sizeCode, 500);
});

const timePrice = computed(() => {
  if (!form.hours) return 0;
  const laborBase = form.hours * userSettings.hourlyRate;
  return applyConditionsToBase(laborBase, form, initialData, 'STRIP_DEFAULT', 100);
});

/** База от вмятин (как раньше: первая + 0.5 за каждую следующую). */
const graphicsBasePrice = computed(() => {
  if (graphicsState.dents.length === 0) return 0;
  const sorted = [...graphicsState.dents].sort((a, b) => b.price - a.price);
  let total = sorted[0].price;
  for (let i = 1; i < sorted.length; i++) {
    total += sorted[i].price * 0.5;
  }
  return total;
});

/** Итоговая цена в Графике: база от вмятин + те же коэффициенты, что в Стандарт/Время. */
const graphicsPrice = computed(() => {
  const base = graphicsBasePrice.value;
  if (base <= 0) return 0;
  return applyConditionsToBase(base, form, initialData, 'STRIP_DEFAULT', 100);
});

/** Вмятина "сформирована": есть хотя бы одна. */
const graphicsDentFormed = computed(() => graphicsState.dents.length >= 1);

/** Можно перейти на шаг "Условия": есть хотя бы одна вмятина в сцене (валидна, в разрешённой области). */
const canGoToConditions = computed(() => graphicsState.dents.length >= 1);

/** Общая базовая цена всех вмятин (по размеру, без условий). Использует формулу: первая + 0.5×остальные. */
const basePriceTotal = computed(() => graphicsBasePrice.value);

const conditionsSectionRef = ref(null);
const graphicsControlsAreaRef = ref(null);

function goToConditionsStep() {
  if (!canGoToConditions.value) return;
  graphicsWizardStep.value = 'conditions';
  nextTick(() => {
    conditionsSectionRef.value?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  });
}

/** Возврат к редактированию: режим edit + сброс матрицы к начальному виду (fit по ширине, scale/position). */
function backToEdit() {
  graphicsWizardStep.value = 'edit';
  nextTick(() => {
    scheduleFit('back-to-edit');
    editorZoom.value = getZoom();
  });
}

const totalPrice = computed(() => {
  if (currentTab.value !== 'calc') return 0;
  if (calcMode.value === 'standard') return standardPrice.value;
  if (calcMode.value === 'time') return timePrice.value;
  if (calcMode.value === 'graphics') {
    return graphicsWizardStep.value === 'conditions' ? graphicsPrice.value : Math.round(graphicsBasePrice.value / 100) * 100;
  }
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
    graphicsStep.value = 3;
    graphicsWizardStep.value = 'edit';
    nextTick(() => setTimeout(initKonvaEditor, 100));
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
  graphicsStep.value = 1;
  graphicsWizardStep.value = 'edit';
  graphicsState.dents = [];
  resetDents();
  haptic('selection');
};

/** Полный сброс графики и условий: вмятины, режим редактирования, все коэффициенты, HUD. */
const resetGraphics = () => {
  resetDents();
  graphicsState.dents = [];
  selectedDentSize.value = null;
  graphicsWizardStep.value = 'edit';
  form.repairCode = null;
  form.riskCode = null;
  form.materialCode = null;
  form.carClassCode = null;
  form.disassemblyCode = null;
  freeStretchMode.value = false;
  setKeepRatio(true);
  showSizeMenu.value = false;
  haptic('selection');
};

let resizeObserverKonva = null;
let resizeObservedEl = null;
/** Размер контейнера при последнем fit; не вызывать scheduleFit при мелких сдвигах (модалка, скроллбар) */
let lastKonvaW = 0;
let lastKonvaH = 0;
const RESIZE_FIT_THRESHOLD_PX = 5;

const initKonvaEditor = async () => {
  if (!konvaContainer.value || !graphicsState.selectedPart) return;
  if (resizeObserverKonva && resizeObservedEl) {
    resizeObserverKonva.unobserve(resizeObservedEl);
    resizeObserverKonva = null;
    resizeObservedEl = null;
  }
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '';
  await initKonva(
    konvaContainer.value,
    graphicsState.selectedPart,
    userSettings.prices,
    (dents) => { graphicsState.dents = dents; },
    baseUrl,
    (info) => { selectedDentSize.value = info; }
  );
  editorZoom.value = getZoom();
  lastKonvaW = konvaContainer.value.offsetWidth || 0;
  lastKonvaH = konvaContainer.value.offsetHeight || 0;
  resizeObservedEl = konvaContainer.value;
  resizeObserverKonva = new ResizeObserver(() => {
    if (!konvaContainer.value) return;
    const w = konvaContainer.value.offsetWidth || 0;
    const h = konvaContainer.value.offsetHeight || 0;
    const t = RESIZE_FIT_THRESHOLD_PX;
    const widthChanged = lastKonvaW === 0 && lastKonvaH === 0 || Math.abs(w - lastKonvaW) > t;
    if (widthChanged) {
      lastKonvaW = w;
      lastKonvaH = h;
      scheduleFit('resize');
    }
  });
  resizeObserverKonva.observe(resizeObservedEl);
};

const editorZoomInput = () => {
  setZoomCentered(editorZoom.value);
  editorZoom.value = getZoom();
};
const editorZoomIn = () => {
  setZoomCentered(getZoom() + 0.1);
  editorZoom.value = getZoom();
};
const editorZoomOut = () => {
  setZoomCentered(getZoom() - 0.1);
  editorZoom.value = getZoom();
};

const editorPan = (dx, dy) => {
  if (getZoom() <= 1.01) return;
  panBy(dx, dy);
};

const openSizeMenu = (type) => {
  haptic('selection');
  activeToolType.value = type;
  showSizeMenu.value = true;
};

const confirmAddShape = (sizeCode) => {
  if (!graphicsState.selectedPart) return;
  haptic('selection');
  showSizeMenu.value = false;
  const type = activeToolType.value;
  const sizes = type === 'circle' ? graphicsCircleSizes.value : initialData.stripSizes;
  addDent(type, sizeCode, sizes);
};

const rotateLeft = () => rotateSelected(-15);
const rotateRight = () => rotateSelected(15);
const deleteCurrent = () => deleteSelected();

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
  if (calcMode.value !== 'graphics' || graphicsStep.value !== 3) return;
  if (graphicsWizardStep.value === 'conditions') return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = document.activeElement;
    const isEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (typeof active.isContentEditable === 'boolean' && active.isContentEditable));
    if (isEditable) return;
    e.preventDefault();
    deleteSelected();
  }
};

function onVisualViewportResize() { updateKeyboardInset(); }
function onVisualViewportScroll() { updateKeyboardInset(); }

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.MainButton.setParams({ color: '#88E523', text_color: '#000000' });
  }
  window.addEventListener('keydown', handleKeyDown);
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', onVisualViewportResize);
    vv.addEventListener('scroll', onVisualViewportScroll);
    updateKeyboardInset();
  }
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

/** При смене шага визарда в Графике: отключать/включать интерактивность канваса (режим "только просмотр" на шаге conditions). */
watch(
  graphicsWizardStep,
  (step) => {
    if (calcMode.value !== 'graphics') return;
    nextTick(() => {
      setEditorInteractive(step === 'edit');
      if (step === 'conditions') setTimeout(() => scheduleFit('resize'), 150);
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  const vv = window.visualViewport;
  if (vv) {
    vv.removeEventListener('resize', onVisualViewportResize);
    vv.removeEventListener('scroll', onVisualViewportScroll);
  }
  if (resizeObserverKonva && resizeObservedEl) {
    resizeObserverKonva.unobserve(resizeObservedEl);
    resizeObserverKonva = null;
    resizeObservedEl = null;
  }
  destroyKonva();
});
</script>

<style scoped>
.text-metric-green { color: #88e523; }
.text-metric-silver { color: #a0aec0; }
.bg-metric-green { background-color: #88e523; }
.border-metric-green { border-color: #88e523; }
/* A) Тёмный фон редактора: перебить любые bg-white/konva-bg (Konva bgRect — страховка в konvaEditor.js) */
.canvas-editor-wrap,
#canvas-wrapper,
#konva-container {
  background-color: #0b0f14 !important;
  background-image: none !important;
}
.canvas-editor-wrap.konva-bg { background-image: none !important; }

/* Fullscreen: контейнер графики занимает весь экран (fixed), 100dvh, без прокрутки body */
.graphics-fullscreen-wrapper {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  width: 100%;
  overflow: hidden;
  padding-top: env(safe-area-inset-top, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: #000;
}

.graphics-header {
  flex-shrink: 0;
}

.graphics-stage-area {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.graphics-controls-area {
  flex-shrink: 0;
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
