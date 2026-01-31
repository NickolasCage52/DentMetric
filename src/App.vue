<template>
  <div class="max-w-md mx-auto relative h-screen flex flex-col bg-black text-white pb-[env(safe-area-inset-bottom)]">
    <!-- Tab: Calc -->
    <div v-if="currentTab === 'calc'" class="flex flex-col h-full">
      <div class="p-4 space-y-4 shrink-0 z-20 bg-black">
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

      <div class="flex-1 overflow-y-auto p-4 pt-0 pb-24">
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

        <!-- Graphics mode -->
        <div v-if="calcMode === 'graphics'" class="h-full flex flex-col">
          <div v-if="graphicsStep === 1" class="space-y-4 animate-fade-in pt-4">
            <h2 class="text-xl font-bold text-center mb-4 text-white">Выберите класс</h2>
            <button
              v-for="cls in graphicsData.carClasses"
              :key="cls.id"
              @click="selectGraphicsClass(cls)"
              class="w-full card-metallic p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-transform border border-white/5 hover:border-metric-green/50"
            >
              <span class="text-4xl">{{ cls.icon }}</span>
              <span class="font-bold text-lg tracking-wide">{{ cls.name }}</span>
            </button>
          </div>
          <div v-if="graphicsStep === 2" class="animate-fade-in h-full flex flex-col pt-4 p-4">
            <div class="flex items-center justify-between mb-4">
              <button @click="graphicsStep = 1" class="text-sm text-metric-silver hover:text-white px-2">← Назад</button>
              <h2 class="text-xl font-bold text-white">Выберите деталь</h2>
              <div class="w-8"></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="part in graphicsData.partsList"
                :key="part.id"
                @click="selectGraphicsPart(part)"
                class="aspect-square card-metallic border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/5 hover:border-metric-green/30"
              >
                <div class="text-metric-green text-opacity-80 font-black text-2xl">
                  <span v-if="part.icon === 'door'">🚪</span>
                  <span v-else-if="part.icon === 'hood'">🚘</span>
                  <span v-else-if="part.icon === 'fender'">🚙</span>
                  <span v-else-if="part.icon === 'trunk'">📦</span>
                  <span v-else-if="part.icon === 'roof'">🏠</span>
                  <span v-else>🔧</span>
                </div>
                <span class="font-medium text-sm">{{ part.name }}</span>
              </button>
            </div>
          </div>
          <div v-if="graphicsStep === 3" ref="graphicsRoot" class="relative flex flex-col h-full animate-fade-in pt-1 px-3 pb-2 graphics-step3-root">
            <div class="flex justify-between items-center mb-1">
              <button @click="closeEditor" class="text-xs text-metric-silver px-2 py-1 rounded border border-white/10 hover:text-white">← Назад</button>
              <span class="text-xs text-metric-green font-bold uppercase tracking-widest">{{ graphicsState.selectedPart?.name }} • {{ graphicsState.selectedClass?.name }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="toggleFullscreen"
                  class="text-metric-silver hover:text-white p-1.5 rounded border border-white/10 hover:border-white/20 transition-colors"
                  :aria-label="isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'"
                >
                  <svg v-if="!isFullscreen" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                  <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 8h2v-3h3v-2h-5v5zm2-8V5h-2v5h5V8h-3z"/></svg>
                </button>
                <button @click="resetGraphics" class="text-xs text-red-400 px-2 py-1 hover:text-red-300">Сброс</button>
              </div>
            </div>
            <!-- A) Фон редактора: DOM (без konva-bg) + Konva bgRect в konvaEditor.js -->
            <div
              id="canvas-wrapper"
              class="canvas-editor-wrap flex-1 relative w-full min-h-[300px] overflow-hidden rounded-xl border border-white/10 shadow-2xl"
              style="background-color: #0b0f14"
            >
              <div ref="konvaContainer" id="konva-container" class="absolute inset-0 w-full h-full" style="background-color: #0b0f14"></div>
              <!-- Camera controls overlay: D-pad + Zoom компактнее и ниже -->
              <div class="absolute inset-0 pointer-events-none p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex flex-col justify-end">
                <div class="flex items-end justify-between gap-1 pointer-events-none">
                  <!-- D-pad: 28px ячейки; только блок ловит клики -->
                  <div class="pointer-events-auto grid grid-cols-[28px_28px_28px] grid-rows-[28px_28px_28px] gap-0.5 rounded bg-black/35 backdrop-blur-sm border border-white/10 p-0.5 place-items-center shrink-0">
                    <span class="w-7 h-7" aria-hidden="true"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(0, -40)" aria-label="Вверх" :disabled="editorZoom <= 1.01">↑</button>
                    <span class="w-7 h-7" aria-hidden="true"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(-40, 0)" aria-label="Влево" :disabled="editorZoom <= 1.01">←</button>
                    <span class="w-7 h-7" aria-hidden="true"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(40, 0)" aria-label="Вправо" :disabled="editorZoom <= 1.01">→</button>
                    <span class="w-7 h-7" aria-hidden="true"></span>
                    <button type="button" class="min-w-[28px] min-h-[28px] w-7 h-7 rounded border flex items-center justify-center text-metric-green font-bold text-xs hover:bg-white/10 hover:border-metric-green/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors" :class="editorZoom <= 1.01 ? 'border-white/5 text-gray-500' : 'border-white/20'" @click="editorPan(0, 40)" aria-label="Вниз" :disabled="editorZoom <= 1.01">↓</button>
                    <span class="w-7 h-7" aria-hidden="true"></span>
                  </div>
                  <!-- Zoom: компактнее; только блок ловит клики -->
                  <div class="pointer-events-auto flex items-center gap-1 rounded bg-black/35 backdrop-blur-sm border border-white/10 p-1 max-w-[180px] min-w-0">
                    <button type="button" class="shrink-0 min-w-[32px] min-h-[32px] w-8 h-8 p-0.5 rounded border border-white/20 flex items-center justify-center text-metric-green font-bold text-sm hover:bg-white/10 hover:border-metric-green/50 active:scale-95" @click="editorZoomOut" aria-label="Уменьшить">−</button>
                    <input type="range" min="0.5" max="3" step="0.05" v-model.number="editorZoom" class="flex-1 min-w-0 w-[100px] max-w-[120px] h-1 rounded-full appearance-none bg-white/10 accent-[#88E523] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#88E523] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#88E523] [&::-moz-range-thumb]:border-0" @input="editorZoomInput" />
                    <button type="button" class="shrink-0 min-w-[32px] min-h-[32px] w-8 h-8 p-0.5 rounded border border-white/20 flex items-center justify-center text-metric-green font-bold text-sm hover:bg-white/10 hover:border-metric-green/50 active:scale-95" @click="editorZoomIn" aria-label="Увеличить">+</button>
                    <span class="shrink-0 text-[10px] font-mono text-metric-green w-7 text-right">{{ Math.round(editorZoom * 100) }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Размеры (мм): только при выбранной вмятине; keyboard-aware на мобилке -->
            <div
              v-if="selectedDentSize"
              ref="dimensionsPanelRef"
              :class="{ 'dimensions-panel-keyboard-open': isKeyboardOpen }"
              :style="dimensionsPanelKeyboardStyle"
              class="mt-1.5 rounded-xl bg-black/35 border border-white/10 p-2.5 transition-[bottom] duration-200"
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
                    inputmode="decimal"
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
                    inputmode="decimal"
                    enterkeyhint="done"
                    class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-1.5 text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none"
                    @focus="onDimensionsInputFocus"
                  />
                </div>
              </div>
              <div v-if="isKeyboardOpen" class="mt-3 flex justify-end">
                <button type="button" class="text-metric-green text-sm font-medium px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/5 active:opacity-90" @click="closeDimensionsKeyboard">Готово</button>
              </div>
            </div>
            <div class="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              <button type="button" class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 hover:border-metric-green/30 transition-all" @click="rotateLeft">
                <span class="text-base">⟲ -15°</span>
                <span class="text-[9px] text-gray-500">Повернуть</span>
              </button>
              <button type="button" class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 hover:border-metric-green/30 transition-all" @click="rotateRight">
                <span class="text-base">⟳ +15°</span>
                <span class="text-[9px] text-gray-500">Повернуть</span>
              </button>
              <button type="button" class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 hover:border-red-400/60 transition-all" @click="deleteCurrent">
                <span class="text-base text-red-400">✕</span>
                <span class="text-[9px] text-gray-500">Удалить</span>
              </button>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-3">
              <button @click="openSizeMenu('circle')" class="card-metallic p-3 rounded-xl flex items-center gap-3 active:scale-95 hover:border-metric-green/30 transition-all">
                <div class="w-6 h-6 rounded-full border-2 border-metric-green bg-metric-green/20"></div>
                <div class="text-left">
                  <div class="font-bold text-xs text-white">Вмятина</div>
                  <div class="text-[9px] text-gray-500">Круг/Овал</div>
                </div>
              </button>
              <button @click="openSizeMenu('strip')" class="card-metallic p-3 rounded-xl flex items-center gap-3 active:scale-95 hover:border-metric-green/30 transition-all">
                <div class="w-6 h-2 bg-metric-silver rotate-45 rounded-sm"></div>
                <div class="text-left">
                  <div class="font-bold text-xs text-white">Полоса</div>
                  <div class="text-[9px] text-gray-500">Царапина</div>
                </div>
              </button>
            </div>
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
import { initKonva, destroyKonva, addDent, resetDents, rotateSelected, deleteSelected, setZoomCentered, getZoom, resizeStage, scheduleFit, panBy, setSelectedDentSizeMm } from './graphics/konvaEditor';
import { initialData } from './data/initialData';
import { CAR_PARTS } from './data/carParts';
import { getPartsByClass } from './data/partsCatalog';
import { circleSizesWithArea } from './data/dentSizes';

// Tabs & mode
const currentTab = ref('calc');
const calcMode = ref('standard');
const graphicsStep = ref(1);

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
  ],
  get partsList() {
    if (graphicsState.selectedClass?.id === 'crossover') {
      return getPartsByClass('crossover');
    }
    return Object.values(CAR_PARTS);
  }
};

const showSizeMenu = ref(false);
const activeToolType = ref(null);
const konvaContainer = ref(null);
const graphicsRoot = ref(null);
const isFullscreen = ref(false);
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
/** При фокусе на input размеров — поднять поле в зону видимости (над клавиатурой) */
function onDimensionsInputFocus(event) {
  const el = event?.target;
  if (!el || !el.scrollIntoView) return;
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }, 200);
  });
}
function closeDimensionsKeyboard() {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) active.blur();
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

/** Teleport target for size menu: inside graphicsRoot when step 3 so popup is visible in fullscreen */
const sizeMenuPortalTarget = computed(() => {
  if (graphicsStep.value === 3 && graphicsRoot.value) return graphicsRoot.value;
  return typeof document !== 'undefined' ? document.body : null;
});

const standardPrice = computed(() => {
  if (!form.sizeCode || !form.repairCode || !form.riskCode || !form.materialCode || !form.carClassCode || !form.disassemblyCode) return 0;
  const base = userSettings.prices[form.sizeCode] || 0;
  const riskObj = initialData.risks.find(r => r.code === form.riskCode);
  const kKey = riskObj ? riskObj.matrixKey : 'K2';
  const matrixRow = initialData.complexityMatrix[form.sizeCode] || initialData.complexityMatrix['STRIP_DEFAULT'];
  const compMult = matrixRow[kKey] || 1.0;
  const repMult = initialData.repairTypes.find(r => r.code === form.repairCode)?.mult || 1.0;
  const matMult = initialData.materials.find(m => m.code === form.materialCode)?.mult || 1.0;
  const clsMult = initialData.carClasses.find(c => c.code === form.carClassCode)?.mult || 1.0;
  const disCost = initialData.disassembly.find(d => d.code === form.disassemblyCode)?.price || 0;
  const total = (base * repMult * matMult * compMult * clsMult) + disCost;
  return Math.round(total / 500) * 500;
});

const timePrice = computed(() => {
  if (!form.hours || !form.repairCode || !form.riskCode || !form.materialCode || !form.carClassCode || !form.disassemblyCode) return 0;
  const riskObj = initialData.risks.find(r => r.code === form.riskCode);
  const kKey = riskObj ? riskObj.matrixKey : 'K2';
  const compMult = initialData.complexityMatrix['STRIP_DEFAULT'][kKey] || 1.0;
  const repMult = initialData.repairTypes.find(r => r.code === form.repairCode)?.mult || 1.0;
  const matMult = initialData.materials.find(m => m.code === form.materialCode)?.mult || 1.0;
  const clsMult = initialData.carClasses.find(c => c.code === form.carClassCode)?.mult || 1.0;
  const disCost = initialData.disassembly.find(d => d.code === form.disassemblyCode)?.price || 0;
  const laborBase = form.hours * userSettings.hourlyRate;
  const total = (laborBase * repMult * matMult * compMult * clsMult) + disCost;
  return Math.round(total / 100) * 100;
});

const graphicsPrice = computed(() => {
  if (graphicsState.dents.length === 0) return 0;
  const sorted = [...graphicsState.dents].sort((a, b) => b.price - a.price);
  let total = sorted[0].price;
  for (let i = 1; i < sorted.length; i++) {
    total += sorted[i].price * 0.5;
  }
  return Math.round(total / 100) * 100;
});

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
  if (mode === 'graphics' && graphicsStep.value === 3) {
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
const selectGraphicsClass = (cls) => {
  graphicsState.selectedClass = cls;
  graphicsStep.value = 2;
  haptic('selection');
};

const selectGraphicsPart = (part) => {
  graphicsState.selectedPart = part;
  graphicsStep.value = 3;
  haptic('selection');
  nextTick(() => setTimeout(initKonvaEditor, 100));
};

const closeEditor = () => {
  graphicsStep.value = 2;
  graphicsState.dents = [];
  resetDents();
  haptic('selection');
};

const resetGraphics = () => {
  resetDents();
  graphicsState.dents = [];
  selectedDentSize.value = null;
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
    const significant = lastKonvaW === 0 && lastKonvaH === 0 ||
      Math.abs(w - lastKonvaW) > t || Math.abs(h - lastKonvaH) > t;
    if (significant) {
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

// Fullscreen (step 3 graphics only): один раз fit (baseTransform), без дерганий; user zoom/pan сохраняются при resize
function resizeKonvaAfterFullscreen(reason) {
  nextTick(() => {
    scheduleFit(reason);
    editorZoom.value = getZoom();
  });
}

function handleFullscreenResize() {
  if (!isFullscreen.value) return;
  resizeKonvaAfterFullscreen('resize');
}

function enterPseudoFullscreen() {
  if (!graphicsRoot.value) return;
  graphicsRoot.value.classList.add('graphics-fullscreen-pseudo');
  isFullscreen.value = true;
  window.addEventListener('resize', handleFullscreenResize);
  resizeKonvaAfterFullscreen('enter-fullscreen');
}

function exitPseudoFullscreen() {
  window.removeEventListener('resize', handleFullscreenResize);
  if (graphicsRoot.value) graphicsRoot.value.classList.remove('graphics-fullscreen-pseudo');
  isFullscreen.value = false;
  resizeKonvaAfterFullscreen('exit-fullscreen');
}

async function enterNativeFullscreen() {
  if (!graphicsRoot.value) return;
  try {
    await graphicsRoot.value.requestFullscreen();
    isFullscreen.value = true;
    window.addEventListener('resize', handleFullscreenResize);
    resizeKonvaAfterFullscreen('enter-fullscreen');
  } catch (_) {
    enterPseudoFullscreen();
  }
}

async function exitNativeFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch (_) {}
  // fullscreenchange will run and clear state + resize
}

function onFullscreenChange() {
  if (!document.fullscreenElement) {
    window.removeEventListener('resize', handleFullscreenResize);
    isFullscreen.value = false;
    if (graphicsRoot.value) graphicsRoot.value.classList.remove('graphics-fullscreen-pseudo');
    resizeKonvaAfterFullscreen('exit-fullscreen');
  } else {
    resizeKonvaAfterFullscreen('enter-fullscreen');
  }
}

function toggleFullscreen() {
  if (isFullscreen.value) {
    if (document.fullscreenElement) {
      exitNativeFullscreen();
    } else {
      exitPseudoFullscreen();
    }
  } else {
    enterNativeFullscreen();
  }
}

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
  document.addEventListener('fullscreenchange', onFullscreenChange);
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', onVisualViewportResize);
    vv.addEventListener('scroll', onVisualViewportScroll);
    updateKeyboardInset();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  window.removeEventListener('resize', handleFullscreenResize);
  if (graphicsRoot.value) graphicsRoot.value.classList.remove('graphics-fullscreen-pseudo');
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
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

/* Fullscreen: only container (step 3), fallback when Fullscreen API unavailable (e.g. Telegram WebView) */
.graphics-step3-root.graphics-fullscreen-pseudo {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
}
</style>
