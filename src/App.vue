<template>
  <div ref="appRootRef" class="app-root max-w-md mx-auto relative h-screen flex flex-col bg-black text-white pb-[env(safe-area-inset-bottom)]">
    <!-- Home -->
    <div v-if="currentSection === 'home'" class="flex flex-col h-full px-4 pt-5 pb-24">
      <div class="flex items-start justify-between">
        <div class="flex-1"></div>
        <button
          type="button"
          @click="showLockedStub('Раздел в разработке 🔒')"
          class="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
          aria-label="Профиль"
        >
          👤
        </button>
      </div>
      <div class="flex justify-center pt-4 pb-3">
        <img src="/logo.png" alt="DentMetric" class="w-full max-w-[260px] h-auto object-contain drop-shadow-2xl" onerror="this.style.display='none'">
      </div>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button
          @click="openMetricMenu"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 border border-metric-green/40 shadow-neon"
        >
          <div class="text-xl">🧮</div>
          <div class="text-sm font-bold">Метрика</div>
          <div class="text-[10px] text-gray-500">Расчёт стоимости</div>
        </button>
        <button
          @click="switchSection('analytics')"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 opacity-70"
        >
          <div class="text-xl">📊</div>
          <div class="text-sm font-bold">Аналитика 🔒</div>
          <div class="text-[10px] text-gray-500">В разработке</div>
        </button>
        <button
          @click="switchSection('history')"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 border border-white/10"
        >
          <div class="text-xl">🗂️</div>
          <div class="text-sm font-bold">История оценок</div>
          <div class="text-[10px] text-gray-500">Сохранённые расчёты</div>
        </button>
        <button
          @click="switchSection('journal')"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 opacity-70"
        >
          <div class="text-xl">📓</div>
          <div class="text-sm font-bold">Журнал записи 🔒</div>
          <div class="text-[10px] text-gray-500">В разработке</div>
        </button>
      </div>
      <div class="mt-auto pt-6"></div>
    </div>

    <!-- Section: Metric Menu -->
    <div v-else-if="currentSection === 'metric-menu'" class="flex flex-col h-full px-4 pt-5 pb-24">
      <div class="flex items-start justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <div class="flex-1"></div>
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px]"
        >
          ✕
        </button>
      </div>
      <div class="flex items-center justify-center pb-3 pt-2">
        <div class="px-5 py-1.5 rounded-full border border-white/10 bg-[#1a1a1a] shadow-lg">
          <span class="text-[10px] font-bold uppercase text-metric-green tracking-widest">Метрика</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button
          @click="selectMetricMode('standard')"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 border border-metric-green/40 shadow-neon"
        >
          <div class="text-xl">⚡</div>
          <div class="text-sm font-bold">Быстрый расчёт</div>
          <div class="text-[10px] text-gray-500">Короткий расчёт</div>
        </button>
        <button
          @click="selectMetricMode('graphics')"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 border border-white/10 hover:border-metric-green/40 transition-colors"
        >
          <div class="text-xl">🎨</div>
          <div class="text-sm font-bold">Детализация</div>
          <div class="text-[10px] text-gray-500">Графический режим</div>
        </button>
        <button
          @click="selectMetricMode('time')"
          class="card-metallic rounded-2xl p-4 flex flex-col items-start gap-2 opacity-70"
        >
          <div class="text-xl">⏱️</div>
          <div class="text-sm font-bold">ГРАД 🔒</div>
          <div class="text-[10px] text-gray-500">В разработке</div>
        </button>
      </div>
    </div>

    <!-- Section: Metric -->
    <div v-else-if="currentSection === 'metric'" class="flex flex-col h-full">
      <div v-if="calcMode !== 'graphics'" class="p-4 space-y-3 shrink-0 z-20 bg-black">
        <div class="flex items-center justify-center">
          <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain drop-shadow-2xl" onerror="this.style.display='none'">
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 pt-0 pb-24" :class="{ 'overflow-hidden h-0': calcMode === 'graphics' }">
        <!-- Standard mode -->
        <div v-if="calcMode === 'standard'" class="flex flex-col min-h-full">
          <div class="flex items-center justify-center pb-2">
            <StepDots :current-step="quickStep" :total-steps="3" />
          </div>

          <div class="space-y-4 pb-4">
            <div v-if="quickStep === 1" class="space-y-4">
              <div class="card-metallic rounded-2xl p-5 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Данные клиента</div>
                  <div v-if="userSettings.clientRequired" class="text-[10px] text-red-400 uppercase tracking-widest">обязательно</div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="estimateDraft.clientName" @focus="scrollFieldIntoView" placeholder="Имя" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.clientCompany" @focus="scrollFieldIntoView" placeholder="Компания" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.clientPhone" @focus="scrollFieldIntoView" placeholder="Тел" inputmode="tel" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.carBrand" @focus="scrollFieldIntoView" placeholder="Марка" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.carModel" @focus="scrollFieldIntoView" placeholder="Модель" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.inspectDate" @focus="scrollFieldIntoView" type="date" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.inspectTime" @focus="scrollFieldIntoView" type="time" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                </div>
                <p v-if="userSettings.clientRequired && !clientDataValid" class="text-[10px] text-gray-500 text-center">Заполните имя и телефон</p>
              </div>
            </div>

            <div v-else-if="quickStep === 2" class="space-y-4">
              <div class="space-y-3">
                <div
                  v-for="(dent, idx) in estimateDraft.quickDents"
                  :key="dent.id"
                  class="card-metallic rounded-2xl p-5 space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <div class="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Вмятина {{ idx + 1 }}</div>
                    <button
                      type="button"
                      @click="removeQuickDent(dent.id)"
                      class="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-2 py-1"
                    >
                      Удалить
                    </button>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Сторона</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        @click="setQuickDentSide(dent, 'left')"
                        class="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-all"
                        :class="dent.panelSide === 'left' ? 'bg-metric-green text-black border-metric-green shadow-neon' : 'bg-[#151515] border-white/10 text-gray-400'"
                      >
                        Левая
                      </button>
                      <button
                        type="button"
                        @click="setQuickDentSide(dent, 'right')"
                        class="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-all"
                        :class="dent.panelSide === 'right' ? 'bg-metric-green text-black border-metric-green shadow-neon' : 'bg-[#151515] border-white/10 text-gray-400'"
                      >
                        Правая
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Элемент</label>
                    <div class="relative">
                      <select
                        v-model="dent.panelElement"
                        @change="onQuickDentElementChange(dent)"
                        class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                      >
                        <option :value="null" disabled selected>Выберите элемент</option>
                        <option v-for="part in (dent.panelSide === 'right' ? quickPartsRight : quickPartsLeft)" :key="part" :value="part">
                          {{ part }}
                        </option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-3">
                    <div
                      @click="setQuickDentShape(dent, 'circle')"
                      class="flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border"
                      :class="dent.shape === 'circle' ? 'bg-[#222] border-metric-green shadow-neon' : 'bg-[#151515] border-white/5 hover:border-white/10'"
                    >
                      <div
                        class="w-4 h-4 rounded-full border-2 mb-2 shadow-[0_0_5px_currentColor]"
                        :class="dent.shape === 'circle' ? 'border-metric-green bg-metric-green' : 'border-gray-500'"
                      ></div>
                      <span class="text-xs font-bold uppercase" :class="dent.shape === 'circle' ? 'text-white' : 'text-gray-400'">Круг/Овал</span>
                    </div>
                    <div
                      @click="setQuickDentShape(dent, 'strip')"
                      class="flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border"
                      :class="dent.shape === 'strip' ? 'bg-[#222] border-metric-green shadow-neon' : 'bg-[#151515] border-white/5 hover:border-white/10'"
                    >
                      <div
                        class="w-6 h-2 rounded-sm mb-3 shadow-[0_0_5px_currentColor]"
                        :class="dent.shape === 'strip' ? 'bg-metric-green' : 'bg-gray-500'"
                      ></div>
                      <span class="text-xs font-bold uppercase" :class="dent.shape === 'strip' ? 'text-white' : 'text-gray-400'">Полоса</span>
                    </div>
                  </div>

                  <div class="mb-2">
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Размер</label>
                    <div class="relative group">
                      <select
                        v-model="dent.sizeCode"
                        required
                        @change="syncQuickDentMmFromSizeCode(dent)"
                        class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors"
                      >
                        <option :value="null" disabled selected>Выберите размер</option>
                        <option v-for="size in getSizeListForShape(dent.shape)" :key="size.code" :value="size.code">{{ size.name }}</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Длина (мм)</label>
                      <input
                        v-model.number="dent.sizeLengthMm"
                        @input="syncQuickDentSizeFromMm(dent)"
                        @focus="scrollFieldIntoView"
                        type="number"
                        min="0.1"
                        step="0.5"
                        inputmode="decimal"
                        class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none transition-colors"
                      >
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Ширина (мм)</label>
                      <input
                        v-model.number="dent.sizeWidthMm"
                        @input="syncQuickDentSizeFromMm(dent)"
                        @focus="scrollFieldIntoView"
                        type="number"
                        min="0.1"
                        step="0.5"
                        inputmode="decimal"
                        class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none transition-colors"
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Технология</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.repairCode"
                          required
                          class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Сложность</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.riskCode"
                          required
                          class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Материал</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.materialCode"
                          required
                          class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Класс авто</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.carClassCode"
                          required
                          class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="c in initialData.carClasses" :key="c.code" :value="c.code">{{ c.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Арматурные работы</label>
                    <div class="relative">
                      <select
                        v-model="dent.conditions.disassemblyCode"
                        required
                        class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors"
                      >
                        <option :value="null" disabled selected>Выберите</option>
                        <option v-for="d in initialData.disassembly" :key="d.code" :value="d.code">{{ d.name }}</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>Подитог:</span>
                    <span class="text-white font-medium">{{ formatCurrency(getQuickDentTotal(dent.id)) }} ₽</span>
                  </div>
                </div>

                <button
                  type="button"
                  @click="addQuickDent"
                  class="w-full py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl transition-all hover:bg-metric-green/10 min-h-[44px]"
                >
                  + Добавить вмятину
                </button>
              </div>
            </div>

            <div v-else-if="quickStep === 3" class="space-y-4">
              <div class="card-metallic rounded-2xl p-5 space-y-2" v-if="quickLineItems.length">
                <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Вмятины</div>
                <div v-for="(item, idx) in quickLineItems" :key="item.dent.id" class="border-b border-white/10 pb-2 mb-2 last:mb-0 last:pb-0 last:border-0">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-gray-400">Вмятина {{ idx + 1 }} · {{ getQuickDentLabel(item.dent) }}</span>
                    <span class="text-white font-medium">{{ formatCurrency(item.appliedTotal) }} ₽</span>
                  </div>
                  <div class="text-[10px] text-gray-500">
                    Размер: {{ Number(item.dent.sizeLengthMm || 0).toFixed(1) }}×{{ Number(item.dent.sizeWidthMm || 0).toFixed(1) }} мм
                    <span v-if="item.discount">· -50% доп. вмятина</span>
                  </div>
                </div>
                <div class="border-t border-white/10 pt-2 mt-2 flex justify-between">
                  <span class="text-metric-green font-bold text-sm">Итог:</span>
                  <span class="text-metric-green font-bold text-lg">{{ formatCurrency(quickTotal) }} ₽</span>
                </div>
              </div>

              <div v-if="quickLineItems.length" class="space-y-3">
                <div
                  v-for="(dentItem, idx) in quickLineItems"
                  :key="dentItem.dent.id"
                  class="card-metallic rounded-2xl p-5 space-y-2"
                >
                  <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Расчёт стоимости · Вмятина {{ idx + 1 }}</div>
                  <div v-for="(line, lineIdx) in dentItem.breakdown" :key="lineIdx" class="flex justify-between text-[11px]">
                    <span class="text-gray-400">{{ line.name }}:</span>
                    <span class="text-white font-medium">{{ line.value }}</span>
                  </div>
                  <div class="border-t border-white/10 pt-2 mt-2 flex justify-between text-[11px]">
                    <span class="text-gray-400">Итог по вмятине:</span>
                    <span class="text-white font-medium">{{ formatCurrency(dentItem.total) }} ₽</span>
                  </div>
                  <div v-if="dentItem.discount" class="flex justify-between text-[11px]">
                    <span class="text-gray-400">Итог с 50%:</span>
                    <span class="text-white font-medium">{{ formatCurrency(dentItem.appliedTotal) }} ₽</span>
                  </div>
                </div>
              </div>

              <div class="card-metallic rounded-2xl p-5 space-y-2">
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Комментарий</div>
                <textarea
                  v-model="estimateDraft.comment"
                  @focus="scrollFieldIntoView"
                  rows="3"
                  placeholder="Комментарий к оценке (необязательно)"
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-sm shadow-inner focus:border-metric-green/50 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="mt-2 px-2 py-2">
            <div v-if="quickStep < 3" class="flex gap-2">
              <button
                type="button"
                @click="goQuickBack"
                class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 rounded-xl min-h-[44px]"
              >
                Назад
              </button>
              <button
                type="button"
                @click="goQuickNext"
                :disabled="(quickStep === 1 && !clientDataValid) || (quickStep === 2 && !quickStep2Valid)"
                class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl transition-all hover:bg-metric-green/10 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
            <div v-else class="space-y-2">
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="goQuickBack"
                  class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 rounded-xl min-h-[44px]"
                >
                  Назад
                </button>
                <button
                  type="button"
                  @click="saveCurrentEstimate('quick')"
                  class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl transition-all hover:bg-metric-green/10 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isSavingHistory || !quickStep3Ready"
                >
                  {{ isSavingHistory ? 'Сохранение...' : 'Сохранить в историю' }}
                </button>
              </div>
              <button
                type="button"
                @click="showLockedStub('Раздел в разработке 🔒')"
                class="w-full py-3 text-xs font-bold uppercase tracking-widest text-black bg-metric-green rounded-xl active:opacity-90 transition-opacity"
                :disabled="!quickStep3Ready"
              >
                Записать на ремонт
              </button>
            </div>
          </div>
        </div>

        <!-- Time mode (locked) -->
        <div v-if="calcMode === 'time'" class="space-y-4">
          <div class="card-metallic rounded-2xl p-5 text-center text-gray-400">
            <div class="text-lg mb-2">🔒</div>
            <div class="text-sm">Раздел в разработке</div>
          </div>
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
        :estimate-draft="estimateDraft"
        :history-saving="isSavingHistory"
          :client-required="userSettings.clientRequired"
          :client-valid="clientDataValid"
        @home="goHome"
          @close="closeEditor"
          @dents-change="(d) => graphicsState.dents = d"
        @save-history="saveCurrentEstimate('detail')"
        />
      </div>
    </div>

    <!-- Section: Settings -->
    <div v-else-if="currentSection === 'history'" class="p-4 space-y-4 overflow-y-auto pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-8 w-auto object-contain" onerror="this.style.display='none'">
        <button
          type="button"
          @click="clearHistoryConfirm"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px]"
          :disabled="historyItems.length === 0"
        >
          Очистить
        </button>
      </div>

      <div v-if="selectedHistory" class="space-y-3">
        <div class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-xs text-gray-400 uppercase tracking-widest">Сохранённая оценка</div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Дата:</span>
            <span class="text-white font-medium">{{ formatDateTime(selectedHistory.createdAt) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Режим:</span>
            <span class="text-white font-medium">{{ selectedHistory.mode === 'detail' ? 'Детализация' : 'Быстрый расчёт' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Элемент:</span>
            <span class="text-white font-medium">{{ selectedHistory.element || '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Итог:</span>
            <span class="text-metric-green font-bold">{{ formatCurrency(selectedHistory.total || 0) }} ₽</span>
          </div>
        </div>

        <div v-if="!isEditingHistory" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Клиент</div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
            <div>Имя: <span class="text-white">{{ selectedHistory.client?.name || '—' }}</span></div>
            <div>Компания: <span class="text-white">{{ selectedHistory.client?.company || '—' }}</span></div>
            <div>Тел: <span class="text-white">{{ selectedHistory.client?.phone || '—' }}</span></div>
            <div>Марка: <span class="text-white">{{ selectedHistory.client?.brand || '—' }}</span></div>
            <div>Модель: <span class="text-white">{{ selectedHistory.client?.model || '—' }}</span></div>
            <div>Дата: <span class="text-white">{{ selectedHistory.client?.date || '—' }}</span></div>
            <div>Время: <span class="text-white">{{ selectedHistory.client?.time || '—' }}</span></div>
          </div>
        </div>

        <div v-else class="card-metallic rounded-2xl p-4 space-y-3">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Редактирование</div>
          <div class="grid grid-cols-2 gap-2">
            <input v-model="historyEditDraft.clientName" placeholder="Имя" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.clientCompany" placeholder="Компания" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.clientPhone" placeholder="Тел" inputmode="tel" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.carBrand" placeholder="Марка" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.carModel" placeholder="Модель" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.inspectDate" type="date" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.inspectTime" type="time" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
          </div>
          <textarea
            v-model="historyEditDraft.comment"
            rows="3"
            placeholder="Комментарий (необязательно)"
            class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm shadow-inner focus:border-metric-green/50 outline-none resize-none"
          ></textarea>
          <div class="flex gap-2">
            <button
              type="button"
              @click="cancelHistoryEdit"
              class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 rounded-xl min-h-[44px]"
            >
              Отмена
            </button>
            <button
              type="button"
              @click="saveHistoryEdit"
              class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUpdatingHistory"
            >
              {{ isUpdatingHistory ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>

        <div v-if="selectedHistory.dents?.items?.length" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Вмятины</div>
          <div v-for="dent in selectedHistory.dents.items" :key="dent.id" class="text-[11px] text-gray-400 flex justify-between">
            <span>
              {{ dent.type }} · {{ dent.bboxMm?.width?.toFixed?.(1) || '—' }}×{{ dent.bboxMm?.height?.toFixed?.(1) || '—' }} мм
              <span v-if="dent.panelElement">· {{ (dent.panelSide || 'left') + ':' }}{{ dent.panelElement }}</span>
            </span>
            <span v-if="dent.areaMm2" class="text-white">{{ Math.round(dent.areaMm2) }} мм²</span>
          </div>
        </div>

        <div v-if="selectedHistory.breakdown?.length" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Расчёт</div>
          <div v-for="(item, idx) in selectedHistory.breakdown" :key="idx" class="flex justify-between text-[11px]">
            <span class="text-gray-400">{{ item.name }}:</span>
            <span class="text-white font-medium">{{ item.value }}</span>
          </div>
        </div>

        <div v-if="selectedHistory.comment && !isEditingHistory" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Комментарий</div>
          <div class="text-sm text-gray-300">{{ selectedHistory.comment }}</div>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="selectedHistoryId = null"
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 rounded-xl min-h-[44px]"
          >
            Назад к списку
          </button>
          <button
            v-if="!isEditingHistory"
            type="button"
            @click="startHistoryEdit"
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl min-h-[44px]"
          >
            Редактировать
          </button>
          <button
            type="button"
            @click="deleteHistoryConfirm(selectedHistory.id)"
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-red-400 border border-red-500/40 rounded-xl min-h-[44px]"
          >
            Удалить
          </button>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div v-if="historyItems.length === 0" class="card-metallic rounded-2xl p-6 text-center text-gray-400 w-full">
          <div class="text-2xl mb-2">🗂️</div>
          <div class="text-sm">История пуста</div>
        </div>
        <button
          v-for="item in historyItems"
          :key="item.id"
          @click="selectedHistoryId = item.id"
          class="card-metallic rounded-2xl p-4 text-left border border-white/10 hover:border-metric-green/40 transition-colors w-full"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-bold text-white">{{ item.element || 'Без элемента' }}</div>
              <div class="text-[10px] text-gray-500">
                {{ formatDateTime(item.createdAt) }} · {{ item.mode === 'detail' ? 'Детализация' : 'Быстрый' }}
              </div>
            </div>
            <div class="text-metric-green font-bold">{{ formatCurrency(item.total || 0) }} ₽</div>
          </div>
          <div class="mt-2 text-[11px] text-gray-400">
            {{ item.client?.phone || item.client?.name || 'Без клиента' }}
          </div>
        </button>
      </div>
    </div>

    <!-- Section: Settings -->
    <div v-else-if="currentSection === 'settings'" class="p-4 space-y-4 overflow-y-auto pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain" onerror="this.style.display='none'">
        <div class="w-[70px]"></div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <h2 class="text-xl font-bold mb-1 text-white">Настройки</h2>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-3">
        <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Обязательные поля</div>
        <div class="flex items-center justify-between gap-2">
          <div class="text-sm text-gray-300">Данные клиента обязательны</div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="userSettings.clientRequired" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>
        <div class="text-[10px] text-gray-500">Если включено, потребуется заполнить имя и телефон на шаге клиента.</div>
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

    <!-- Section: Info -->
    <div v-else-if="currentSection === 'info'" class="p-4 space-y-3 overflow-y-auto pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain" onerror="this.style.display='none'">
        <div class="w-[70px]"></div>
      </div>
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
            <li>Поддерживает режимы: <span class="text-white font-bold">Быстрый расчёт</span> и <span class="text-white font-bold">Детализация</span>.</li>
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
            <li>Выберите режим расчета в меню «Метрика».</li>
            <li>Укажите тип повреждения (Круг/Овал или Полоса).</li>
            <li>Выберите размер или укажите длину/ширину в мм.</li>
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
            <span class="font-bold text-sm text-white">Режим «Град»</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <p class="leading-snug">Раздел в разработке 🔒</p>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">🎨</span>
            <span class="font-bold text-sm text-white">Детализация (Графика)</span>
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

    <!-- Locked sections -->
    <div v-else class="p-4 flex flex-col h-full pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain" onerror="this.style.display='none'">
        <div class="w-[70px]"></div>
      </div>
      <div class="card-metallic rounded-2xl p-6 text-center text-gray-400 mt-6">
        <div class="text-2xl mb-2">🔒</div>
        <div class="text-sm">Раздел в разработке</div>
      </div>
    </div>

    <!-- Bottom tabs -->
    <div ref="bottomNavRef" class="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-[#222] flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-[200] shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      <button
        @click="switchSection('history')"
        class="flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300"
        :class="currentSection === 'history' ? 'text-metric-green scale-105' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">🗂️</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">История</span>
      </button>
      <button
        @click="switchSection('settings')"
        class="flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300"
        :class="currentSection === 'settings' ? 'text-metric-green scale-105' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">⚙️</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Настройки</span>
      </button>
      <button
        @click="openMetricMenu"
        class="flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300"
        :class="currentSection === 'metric' || currentSection === 'metric-menu' ? 'text-metric-green scale-105' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">🧮</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Метрика</span>
      </button>
      <button
        @click="switchSection('info')"
        class="flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300"
        :class="currentSection === 'info' ? 'text-metric-green scale-105' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">ℹ️</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Инфо</span>
      </button>
      <button
        @click="goHome"
        class="flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300"
        :class="currentSection === 'home' ? 'text-metric-green scale-105' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">🏠</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Домой</span>
      </button>
    </div>
    <div
      v-if="toast.visible"
      class="fixed left-1/2 -translate-x-1/2 z-[300] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl"
      :class="toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-[#111] text-metric-green border border-metric-green/40'"
      style="bottom: calc(16px + env(safe-area-inset-bottom, 0px));"
    >
      {{ toast.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { deleteSelected } from './graphics/konvaEditor';
import { initialData } from './data/initialData';
import { CAR_PARTS } from './data/carParts';
import { getPartsByClass } from './data/partsCatalog';
import { circleSizesMm, stripSizesMm, circleSizesWithArea, stripSizesWithArea } from './data/dentSizes';
import { applyConditionsToBase, calcBasePriceFromDents, calcTotalPrice, buildBreakdown, roundPrice } from './utils/priceCalc';
import { getBasePriceByMm, getSizeCodeForMatrix } from './utils/priceAdapter';
import GraphicsWizard from './components/graphics/GraphicsWizard.vue';
import StepDots from './components/graphics/StepDots.vue';
import { useHistoryStore } from './features/history/historyStore';

// Sections & mode
const currentSection = ref('home');
const calcMode = ref('standard');
const quickStep = ref(1);
const appRootRef = ref(null);
const bottomNavRef = ref(null);
let footerResizeObserver = null;
const updateFooterHeight = () => {
  const root = appRootRef.value;
  const nav = bottomNavRef.value;
  if (!root || !nav) return;
  const h = Math.round(nav.getBoundingClientRect().height || 0);
  if (h > 0) root.style.setProperty('--app-footer-height', `${h}px`);
};

// Form (standard)
const form = reactive({
  shape: 'circle',
  sizeCode: null,
  repairCode: null,
  riskCode: null,
  materialCode: null,
  carClassCode: null,
  disassemblyCode: null
});

const estimateDraft = reactive({
  clientName: '',
  clientCompany: '',
  clientPhone: '',
  carBrand: '',
  carModel: '',
  inspectDate: '',
  inspectTime: '',
  element: null,
  sizeLengthMm: null,
  sizeWidthMm: null,
  comment: '',
  breakdown: [],
  quickDents: []
});

const { historyItems, loadHistory, saveEstimate, updateEstimate, deleteEstimate, clearHistory } = useHistoryStore();
const selectedHistoryId = ref(null);
const selectedHistory = computed(() => historyItems.value.find((item) => item.id === selectedHistoryId.value) || null);
const isSavingHistory = ref(false);
const toast = reactive({ visible: false, text: '', type: 'success', timeoutId: null });
const skipNextAutoFill = ref(false);
const isEditingHistory = ref(false);
const isUpdatingHistory = ref(false);
const historyEditDraft = reactive({
  clientName: '',
  clientCompany: '',
  clientPhone: '',
  carBrand: '',
  carModel: '',
  inspectDate: '',
  inspectTime: '',
  comment: ''
});

const quickPartsLeft = [
  'Капот',
  'Крышка багажника',
  'Крыша',
  'Переднее крыло',
  'Передняя дверь',
  'Задняя дверь',
  'Заднее крыло',
  'Стойка крыши',
  'Порог'
];
const quickPartsRight = [...quickPartsLeft];

const clientDataValid = computed(() => {
  if (!userSettings.clientRequired) return true;
  return Boolean(String(estimateDraft.clientName || '').trim() && String(estimateDraft.clientPhone || '').trim());
});

function normalizePanelElement(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.includes(':')) {
    const [side, ...rest] = value.split(':');
    return { side: side === 'right' ? 'right' : 'left', element: rest.join(':') };
  }
  return { side: 'left', element: String(value) };
}

function createQuickDent(panelElement = null) {
  const normalized = normalizePanelElement(panelElement);
  return {
    id: `quick_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    shape: 'circle',
    sizeCode: null,
    sizeLengthMm: null,
    sizeWidthMm: null,
    panelSide: normalized?.side || 'left',
    panelElement: normalized?.element || null,
    conditions: {
      repairCode: null,
      riskCode: null,
      materialCode: null,
      carClassCode: null,
      disassemblyCode: null
    }
  };
}

function addQuickDent() {
  const panel = getQuickDefaultPanel();
  estimateDraft.quickDents.push(createQuickDent(panel?.element ? `${panel.side}:${panel.element}` : null));
  haptic('selection');
}

function removeQuickDent(id) {
  estimateDraft.quickDents = estimateDraft.quickDents.filter((d) => d.id !== id);
  haptic('selection');
}

function setQuickDentShape(dent, shape) {
  dent.shape = shape;
  dent.sizeCode = null;
  dent.sizeLengthMm = null;
  dent.sizeWidthMm = null;
  haptic('selection');
}

function getQuickDefaultPanel() {
  const last = estimateDraft.quickDents[estimateDraft.quickDents.length - 1];
  if (last?.panelElement) return { side: last.panelSide || 'left', element: last.panelElement };
  return { side: 'left', element: quickPartsLeft.length ? quickPartsLeft[0] : null };
}

function onQuickDentElementChange(dent) {
  if (dent?.panelElement && !dent.panelSide) dent.panelSide = 'left';
  haptic('selection');
}

function setQuickDentSide(dent, side) {
  if (!dent) return;
  dent.panelSide = side === 'right' ? 'right' : 'left';
  if (!dent.panelElement) {
    dent.panelElement = dent.panelSide === 'right' ? quickPartsRight[0] : quickPartsLeft[0];
  }
  haptic('selection');
}

function normalizeQuickDentPanel(dent) {
  if (!dent) return;
  if (dent.panelElement && typeof dent.panelElement === 'string' && dent.panelElement.includes(':')) {
    const parsed = normalizePanelElement(dent.panelElement);
    dent.panelSide = parsed?.side || dent.panelSide || 'left';
    dent.panelElement = parsed?.element || null;
  }
  if (!dent.panelSide) dent.panelSide = 'left';
  if (!dent.panelElement) {
    dent.panelElement = dent.panelSide === 'right' ? quickPartsRight[0] : quickPartsLeft[0];
  }
}

function getSizeListForShape(shape) {
  return shape === 'circle' ? initialData.circleSizes : initialData.stripSizes;
}

function syncQuickDentMmFromSizeCode(dent) {
  if (!dent.sizeCode) return;
  const sizes = dent.shape === 'circle' ? circleSizesMm : stripSizesMm;
  const size = sizes.find((s) => s.code === dent.sizeCode);
  if (!size?.mm) return;
  dent.sizeLengthMm = size.mm.w;
  dent.sizeWidthMm = size.mm.h;
}

function syncQuickDentSizeFromMm(dent) {
  const sizeCode = getSizeCodeFromMm(dent.shape, dent.sizeLengthMm, dent.sizeWidthMm);
  if (sizeCode) dent.sizeCode = sizeCode;
}

function ensureInspectDateTime() {
  if (skipNextAutoFill.value) {
    skipNextAutoFill.value = false;
    return;
  }
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  if (!estimateDraft.inspectDate) {
    estimateDraft.inspectDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  if (!estimateDraft.inspectTime) {
    estimateDraft.inspectTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}
ensureInspectDateTime();

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
  hourlyRate: 0,
  clientRequired: false
});

const saved = localStorage.getItem('dentRepairSettings_v5');
if (saved) {
  try {
    const p = JSON.parse(saved);
    if (p.prices) Object.assign(userSettings.prices, p.prices);
    if (p.masters) userSettings.masters = p.masters;
    if (typeof p.clientRequired === 'boolean') userSettings.clientRequired = p.clientRequired;
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

watch(
  () => graphicsState.selectedPart,
  (part) => {
    if (part?.name) estimateDraft.element = part.name;
  },
  { immediate: true }
);

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

const quickDentTotals = computed(() => estimateDraft.quickDents.map((dent) => {
  const w = Number(dent.sizeLengthMm) || 0;
  const h = Number(dent.sizeWidthMm) || 0;
  const shape = dent.shape === 'circle' ? 'circle' : 'strip';
  const sizes = shape === 'circle' ? circleSizesWithArea : stripSizesWithArea;
  const base = (w > 0 && h > 0) ? getBasePriceByMm(shape, w, h, sizes, userSettings.prices) : 0;
  const sizeCodeForMatrix = getSizeCodeForMatrix(shape, w, h, sizes);
  const total = base > 0 ? applyConditionsToBase(base, dent.conditions, initialData, sizeCodeForMatrix) : 0;
  const breakdown = base > 0 ? buildBreakdown(base, dent.conditions, initialData, sizeCodeForMatrix) : [];
  return { dent, sizeCode: dent.sizeCode, base, total, breakdown };
}));

const quickLineItems = computed(() => {
  const list = quickDentTotals.value.filter((d) => d.total > 0).sort((a, b) => b.total - a.total);
  return list.map((item, idx) => {
    const applied = idx === 0 ? item.total : roundPrice(item.total * 0.5);
    return { ...item, appliedTotal: applied, discount: idx > 0 };
  });
});

const quickTotal = computed(() => {
  if (quickLineItems.value.length === 0) return 0;
  const sum = quickLineItems.value.reduce((acc, item, idx) => acc + (idx === 0 ? item.total : item.total * 0.5), 0);
  return roundPrice(sum);
});

/** База от вмятин: сумма базовых цен (каждая вмятина отдельно). Единый источник: priceCalc.calcBasePriceFromDents. */
const graphicsBasePrice = computed(() => calcBasePriceFromDents(graphicsState.dents));

/** Итоговая цена в Графике: каждая вмятина отдельно, затем сумма. Единый источник: priceCalc.calcTotalPrice. */
const graphicsPrice = computed(() =>
  calcTotalPrice(graphicsState.dents, form, initialData, 100)
);

const totalPrice = computed(() => {
  if (currentSection.value !== 'metric') return 0;
  if (calcMode.value === 'standard') return quickTotal.value;
  if (calcMode.value === 'graphics') return graphicsPrice.value;
  return 0;
});

const quickBreakdownItems = computed(() => {
  const items = quickLineItems.value.map((item, idx) => ({
    name: `Вмятина ${idx + 1}${item.discount ? ' (50%)' : ''}`,
    value: `${formatCurrency(item.appliedTotal)} ₽`
  }));
  return items;
});

const quickStep2Valid = computed(() => {
  if (estimateDraft.quickDents.length === 0) return false;
  return estimateDraft.quickDents.every((d) =>
    d.sizeCode &&
    d.conditions?.repairCode &&
    d.conditions?.riskCode &&
    d.conditions?.materialCode &&
    d.conditions?.carClassCode &&
    d.conditions?.disassemblyCode
  );
});

const quickStep3Ready = computed(() => quickTotal.value > 0);

const getQuickDentTotal = (dentId) => {
  const item = quickDentTotals.value.find((d) => d.dent.id === dentId);
  return item?.total || 0;
};

const getQuickDentLabel = (dent) => (dent.shape === 'circle' ? 'Круг/Овал' : 'Полоса');

// Helpers
const formatCurrency = (v) => new Intl.NumberFormat('ru-RU').format(v);
const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
};

if (import.meta.env?.DEV) {
  const compareQuickAndDetailForSameInput = (shape, widthMm, heightMm, conditions) => {
    const sizes = shape === 'circle' ? circleSizesWithArea : stripSizesWithArea;
    const base = getBasePriceByMm(shape, widthMm, heightMm, sizes, userSettings.prices);
    const sizeCodeForMatrix = getSizeCodeForMatrix(shape, widthMm, heightMm, sizes);
    const quickTotal = applyConditionsToBase(base, conditions, initialData, sizeCodeForMatrix);
    const detailTotal = applyConditionsToBase(base, conditions, initialData, sizeCodeForMatrix);
    if (quickTotal !== detailTotal) {
      console.warn('[Pricing mismatch]', { shape, widthMm, heightMm, base, sizeCodeForMatrix, quickTotal, detailTotal });
    }
  };
  // Example usage in console:
  // compareQuickAndDetailForSameInput('circle', 120, 300, form);
}

watch([quickBreakdownItems, calcMode], () => {
  if (calcMode.value !== 'standard') return;
  estimateDraft.breakdown = quickBreakdownItems.value;
});

const haptic = (type) => {
  const tg = window.Telegram?.WebApp;
  if (!tg?.HapticFeedback) return;
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
    if (type === 'selection') tg.HapticFeedback.selectionChanged();
    if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
  }
};

const showLockedStub = (message = 'Раздел в разработке 🔒') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.showPopup && tg?.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
    tg.showPopup({ title: 'В разработке', message, buttons: [{ type: 'ok' }] });
  } else {
    alert(message);
  }
  haptic('selection');
};

function showToast(text, type = 'success', duration = 1800) {
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  toast.text = text;
  toast.type = type;
  toast.visible = true;
  toast.timeoutId = setTimeout(() => {
    toast.visible = false;
    toast.timeoutId = null;
  }, duration);
}

function startHistoryEdit() {
  if (!selectedHistory.value) return;
  const client = selectedHistory.value.client || {};
  historyEditDraft.clientName = client.name || '';
  historyEditDraft.clientCompany = client.company || '';
  historyEditDraft.clientPhone = client.phone || '';
  historyEditDraft.carBrand = client.brand || '';
  historyEditDraft.carModel = client.model || '';
  historyEditDraft.inspectDate = client.date || '';
  historyEditDraft.inspectTime = client.time || '';
  historyEditDraft.comment = selectedHistory.value.comment || '';
  isEditingHistory.value = true;
}

function cancelHistoryEdit() {
  isEditingHistory.value = false;
}

async function saveHistoryEdit() {
  if (!selectedHistory.value || isUpdatingHistory.value) return;
  isUpdatingHistory.value = true;
  try {
    updateEstimate(selectedHistory.value.id, {
      client: {
        name: historyEditDraft.clientName,
        company: historyEditDraft.clientCompany,
        phone: historyEditDraft.clientPhone,
        brand: historyEditDraft.carBrand,
        model: historyEditDraft.carModel,
        date: historyEditDraft.inspectDate,
        time: historyEditDraft.inspectTime
      },
      comment: historyEditDraft.comment
    });
    isEditingHistory.value = false;
    showToast('История обновлена ✅', 'success', 1800);
  } catch (e) {
    showToast('Не удалось обновить историю', 'error', 2200);
  } finally {
    isUpdatingHistory.value = false;
  }
}

function resetDraftState() {
  form.shape = 'circle';
  form.sizeCode = null;
  form.repairCode = null;
  form.riskCode = null;
  form.materialCode = null;
  form.carClassCode = null;
  form.disassemblyCode = null;

  estimateDraft.clientName = '';
  estimateDraft.clientCompany = '';
  estimateDraft.clientPhone = '';
  estimateDraft.carBrand = '';
  estimateDraft.carModel = '';
  estimateDraft.inspectDate = '';
  estimateDraft.inspectTime = '';
  estimateDraft.element = null;
  estimateDraft.sizeLengthMm = null;
  estimateDraft.sizeWidthMm = null;
  estimateDraft.comment = '';
  estimateDraft.breakdown = [];
  estimateDraft.quickDents = [];
  quickStep.value = 1;

  graphicsState.dents = [];
  graphicsState.selectedClass = null;
  graphicsState.selectedPart = null;
  graphicsSelectedClassId.value = graphicsData.carClasses[0]?.id || null;
  graphicsSelectedPartId.value = graphicsPartsList.value?.[0]?.id || null;
  skipNextAutoFill.value = true;
}

function buildEstimatePayload(mode) {
  const client = {
    name: estimateDraft.clientName,
    company: estimateDraft.clientCompany,
    phone: estimateDraft.clientPhone,
    brand: estimateDraft.carBrand,
    model: estimateDraft.carModel,
    date: estimateDraft.inspectDate,
    time: estimateDraft.inspectTime
  };
  const conditions = {
    repairCode: form.repairCode,
    riskCode: form.riskCode,
    materialCode: form.materialCode,
    carClassCode: form.carClassCode,
    disassemblyCode: form.disassemblyCode
  };
  const firstQuick = estimateDraft.quickDents?.[0];
  const quickElement = firstQuick?.panelElement ? `${firstQuick.panelSide || 'left'}:${firstQuick.panelElement}` : null;
  const element = quickElement || graphicsState.selectedPart?.name || null;
  const vehicleClass = graphicsState.selectedClass?.name || null;
  if (mode === 'detail') {
    const dentItems = (graphicsState.dents || []).map((d) => ({
      id: d.id,
      type: d.type,
      bboxMm: d.bboxMm,
      areaMm2: d.areaMm2,
      conditions: conditions
    }));
    return {
      mode: 'detail',
      client,
      vehicleClass,
      element,
      dents: { count: dentItems.length, items: dentItems },
      breakdown: estimateDraft.breakdown || [],
      total: totalPrice.value,
      comment: estimateDraft.comment || ''
    };
  }
  const dentItems = (estimateDraft.quickDents || []).map((d) => ({
    id: d.id,
    type: d.shape,
    sizeCode: d.sizeCode,
    bboxMm: {
      width: Number(d.sizeLengthMm) || 0,
      height: Number(d.sizeWidthMm) || 0
    },
    panelSide: d.panelSide || 'left',
    panelElement: d.panelElement || null,
    conditions: d.conditions
  }));
  return {
    mode: 'quick',
    client,
    vehicleClass: null,
    element,
    dents: { count: dentItems.length, items: dentItems },
    breakdown: estimateDraft.breakdown || [],
    total: quickTotal.value,
    comment: estimateDraft.comment || ''
  };
}

async function saveCurrentEstimate(modeOverride) {
  if (isSavingHistory.value) return;
  const mode = modeOverride || (calcMode.value === 'graphics' ? 'detail' : 'quick');
  if (totalPrice.value <= 0) return;
  isSavingHistory.value = true;
  try {
    const payload = buildEstimatePayload(mode);
    saveEstimate(payload);
    showToast('Сохранено в историю ✅', 'success', 1800);
    resetDraftState();
    if (calcMode.value === 'graphics') closeEditor();
    setTimeout(() => {
      currentSection.value = 'history';
    }, 400);
  } catch (e) {
    showToast('Не удалось сохранить в историю', 'error', 2200);
  } finally {
    isSavingHistory.value = false;
  }
}

function clearHistoryConfirm() {
  if (historyItems.value.length === 0) return;
  if (confirm('Очистить всю историю?')) clearHistory();
}

function deleteHistoryConfirm(id) {
  if (!id) return;
  if (confirm('Удалить оценку из истории?')) {
    deleteEstimate(id);
    if (selectedHistoryId.value === id) selectedHistoryId.value = null;
  }
}

const setMode = (mode) => {
  if (mode === 'time') {
    showLockedStub('Раздел в разработке 🔒');
    return;
  }
  calcMode.value = mode;
  if (mode === 'standard') quickStep.value = 1;
  haptic('selection');
  if (mode === 'graphics') {
    if (window.Telegram?.WebApp?.expand) window.Telegram.WebApp.expand();
    ensureGraphicsSelection();
  }
};

const openMetricMenu = () => {
  if (calcMode.value === 'graphics') closeEditor();
  currentSection.value = 'metric-menu';
  haptic('selection');
};

const selectMetricMode = (mode) => {
  if (mode === 'time') {
    showLockedStub('Раздел в разработке 🔒');
    return;
  }
  if (currentSection.value !== 'metric') {
    currentSection.value = 'metric';
    ensureInspectDateTime();
  }
  if (calcMode.value === 'graphics' && mode !== 'graphics') {
    closeEditor();
  }
  setMode(mode);
};

const switchSection = (section) => {
  if (section === 'analytics' || section === 'journal') {
    currentSection.value = section;
    showLockedStub('Раздел в разработке 🔒');
    return;
  }
  if (section !== 'metric' && calcMode.value === 'graphics') closeEditor();
  currentSection.value = section;
  haptic('selection');
  if (section === 'metric') {
    ensureInspectDateTime();
  }
};

const goQuickBack = () => {
  if (quickStep.value <= 1) {
    openMetricMenu();
    return;
  }
  quickStep.value -= 1;
};

const goQuickNext = () => {
  if (quickStep.value === 1 && !clientDataValid.value) return;
  if (quickStep.value === 2 && !quickStep2Valid.value) return;
  if (quickStep.value < 3) quickStep.value += 1;
};

const goHome = () => {
  if (calcMode.value === 'graphics') closeEditor();
  currentSection.value = 'home';
  haptic('selection');
};

const addMaster = () => userSettings.masters.push({ name: '', rate: 0 });
const removeMaster = (i) => userSettings.masters.splice(i, 1);

const saveSettings = () => {
  const dataToSave = {
    prices: userSettings.prices,
    masters: userSettings.masters,
    clientRequired: userSettings.clientRequired
  };
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
    userSettings.clientRequired = false;
    saveSettings();
  }
};

function scrollFieldIntoView(e) {
  const el = e?.target || e;
  if (!el?.scrollIntoView) return;
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  });
}

function getSizeCodeFromMm(shape, lengthMm, widthMm) {
  const l = Number(lengthMm);
  const w = Number(widthMm);
  if (!Number.isFinite(l) || !Number.isFinite(w) || l <= 0 || w <= 0) return null;
  const sizes = shape === 'circle' ? circleSizesMm : stripSizesMm;
  const area = shape === 'circle'
    ? Math.PI * (l / 2) * (w / 2)
    : l * w;
  let closest = sizes[0];
  let minDist = Math.abs((closest?.mm?.w || 0) * (closest?.mm?.h || 0) - area);
  sizes.forEach((s) => {
    const sArea = (s.mm?.w || 0) * (s.mm?.h || 0);
    const dist = Math.abs(sArea - area);
    if (dist < minDist) {
      minDist = dist;
      closest = s;
    }
  });
  return closest?.code || null;
}


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
  if (calcMode.value === 'graphics') {
    btn.hide();
    return;
  }
  if (val > 0) {
    btn.setText(`ИТОГО: ${formatCurrency(val)} ₽`);
    btn.show();
  } else {
    btn.hide();
  }
});

watch(selectedHistoryId, () => {
  isEditingHistory.value = false;
});

watch(quickStep, (step) => {
  if (step === 2 && estimateDraft.quickDents.length === 0) {
    addQuickDent();
  }
  if (step === 2 && estimateDraft.quickDents.length > 0) {
    estimateDraft.quickDents.forEach((dent) => normalizeQuickDentPanel(dent));
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
  updateFooterHeight();
  footerResizeObserver = new ResizeObserver(() => updateFooterHeight());
  if (bottomNavRef.value) footerResizeObserver.observe(bottomNavRef.value);
  window.addEventListener('resize', updateFooterHeight);
  ensureInspectDateTime();
  loadHistory();
});

watch(
  () => calcMode.value === 'graphics',
  (isGraphics) => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('graphics-fullscreen-active', isGraphics);
    if (isGraphics && window.Telegram?.WebApp?.expand) window.Telegram.WebApp.expand();
    const btn = window.Telegram?.WebApp?.MainButton;
    if (isGraphics && btn) btn.hide();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', updateFooterHeight);
  if (footerResizeObserver && bottomNavRef.value) footerResizeObserver.unobserve(bottomNavRef.value);
  if (footerResizeObserver) footerResizeObserver.disconnect();
});
</script>

<style scoped>
.text-metric-green { color: #88e523; }
.text-metric-silver { color: #a0aec0; }
.bg-metric-green { background-color: #88e523; }
.border-metric-green { border-color: #88e523; }
.app-root {
  --app-footer-height: calc(64px + env(safe-area-inset-bottom, 0px));
}
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
  padding: 0 0 var(--app-footer-height) 0;
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
