import { ref } from 'vue';

export const HISTORY_SCHEMA_VERSION = 1;
const STORAGE_KEY = `dentmetric_history_v${HISTORY_SCHEMA_VERSION}`;
const MAX_STORAGE_BYTES = 4_500_000;

const historyItems = ref<any[]>([]);
const historyLoaded = ref(false);

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    if (import.meta.env?.DEV) console.warn('[history] parse failed', e);
    return null;
  }
}

function migrateHistory(payload: any) {
  if (!payload) return { version: HISTORY_SCHEMA_VERSION, items: [] };
  if (Array.isArray(payload)) {
    return { version: HISTORY_SCHEMA_VERSION, items: payload };
  }
  if (payload.version === HISTORY_SCHEMA_VERSION && Array.isArray(payload.items)) {
    return payload;
  }
  if (payload.items && Array.isArray(payload.items)) {
    return { version: HISTORY_SCHEMA_VERSION, items: payload.items };
  }
  return { version: HISTORY_SCHEMA_VERSION, items: [] };
}

function persist(items: any[]) {
  const payload = { version: HISTORY_SCHEMA_VERSION, items };
  let serialized = JSON.stringify(payload);
  if (serialized.length > MAX_STORAGE_BYTES) {
    const trimmed = [...items];
    while (trimmed.length > 0 && serialized.length > MAX_STORAGE_BYTES) {
      trimmed.pop();
      serialized = JSON.stringify({ version: HISTORY_SCHEMA_VERSION, items: trimmed });
    }
    items = trimmed;
  }
  localStorage.setItem(STORAGE_KEY, serialized);
  historyItems.value = items;
}

export function loadHistory() {
  if (historyLoaded.value) return historyItems.value;
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = migrateHistory(safeParse(raw));
  historyItems.value = parsed.items || [];
  historyLoaded.value = true;
  return historyItems.value;
}

export function saveEstimate(estimateDraft: any) {
  if (!estimateDraft) return null;
  const items = [...historyItems.value];
  const now = new Date().toISOString();
  const id = estimateDraft.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const next = { ...estimateDraft, id, createdAt: estimateDraft.createdAt || now };
  items.unshift(next);
  persist(items);
  return next;
}

export function deleteEstimate(id: string) {
  if (!id) return;
  const items = historyItems.value.filter((item) => item?.id !== id);
  persist(items);
}

export function updateEstimate(id: string, partial: any) {
  if (!id || !partial) return null;
  const items = historyItems.value.map((item) => {
    if (item?.id !== id) return item;
    return {
      ...item,
      client: { ...(item.client || {}), ...(partial.client || {}) },
      comment: partial.comment != null ? partial.comment : item.comment,
      updatedAt: new Date().toISOString()
    };
  });
  persist(items);
  return items.find((item) => item?.id === id) || null;
}

export function clearHistory() {
  persist([]);
}

export function useHistoryStore() {
  return {
    historyItems,
    loadHistory,
    saveEstimate,
    updateEstimate,
    deleteEstimate,
    clearHistory
  };
}
