/**
 * Unit tests for history save/reset flow.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadHistory,
  saveEstimate,
  deleteEstimate,
  updateEstimate,
  clearHistory,
} from '../src/features/history/historyStore';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('historyStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    clearHistory(); // Reset in-memory state
  });

  it('loadHistory returns empty array when no data', () => {
    const items = loadHistory();
    expect(items).toEqual([]);
  });

  it('saveEstimate adds item and persists', () => {
    loadHistory(); // Ensure store is initialized
    const draft = {
      clientName: 'Test',
      quickDents: [],
      total: 5000,
    };
    const saved = saveEstimate(draft);
    expect(saved).toBeDefined();
    expect(saved.id).toBeDefined();
    expect(saved.clientName).toBe('Test');

    const items = loadHistory();
    expect(items.length).toBe(1);
    expect(items[0].clientName).toBe('Test');
  });

  it('deleteEstimate removes item', () => {
    const draft = { clientName: 'A', quickDents: [], total: 1000 };
    const saved = saveEstimate(draft);
    deleteEstimate(saved.id);

    const items = loadHistory();
    expect(items.length).toBe(0);
  });

  it('updateEstimate updates client fields', () => {
    const draft = { clientName: 'Original', quickDents: [], total: 2000 };
    const saved = saveEstimate(draft);
    const updated = updateEstimate(saved.id, {
      client: { clientName: 'Updated' },
      comment: 'New comment',
    });

    expect(updated).toBeDefined();
    expect(updated.client.clientName).toBe('Updated');
    expect(updated.comment).toBe('New comment');

    const items = loadHistory();
    expect(items[0].client.clientName).toBe('Updated');
  });

  it('clearHistory empties storage', () => {
    saveEstimate({ clientName: 'A', quickDents: [], total: 1000 });
    saveEstimate({ clientName: 'B', quickDents: [], total: 2000 });
    clearHistory();

    const items = loadHistory();
    expect(items).toEqual([]);
  });
});
