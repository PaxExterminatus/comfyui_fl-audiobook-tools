import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeRootStore } from '../../electron-ui/root_store.js';

/**
 * Tests for the recent folder history functionality added to makeRootStore.
 * The store should expose three new methods:
 *   - getRecent(): array of recent paths for the current mode (newest first)
 *   - getRecentFor(mode): array of recent paths for the given mode
 *   - rememberCurrent(): records the current mode's root into its recent list
 *
 * The tests cover basic behavior, edge cases, persistence handling, and error
 * resilience. They are deliberately written before the implementation exists,
 * so they will fail until the features are added.
 */

describe('makeRootStore recent folder history', () => {
  let storage;
  let store;

  // Helper to build the recent‑list storage key for a given mode
  const recentKey = (mode) => `FL_Electron.${mode}Recent`;

  beforeEach(() => {
    // Fresh mock storage for each test – similar to the roots test.
    storage = {
      getItem: vi.fn(() => null), // default: nothing stored
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    store = makeRootStore(storage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------
  // Existence of the new API
  // ---------------------------------------------------------------------
  it('exposes recent‑history methods', () => {
    expect(typeof store.getRecent).toBe('function');
    expect(typeof store.getRecentFor).toBe('function');
    expect(typeof store.rememberCurrent).toBe('function');
  });

  // ---------------------------------------------------------------------
  // Basic recording behaviour
  // ---------------------------------------------------------------------
  it('rememberCurrent adds the current root to the recent list', () => {
    store.setCurrentMode('voicing');
    store.setCurrentModeRoot('/path/to/voicing');
    store.rememberCurrent();
    expect(store.getRecent()).toEqual(['/path/to/voicing']);
    // The same via getRecentFor for explicit mode name
    expect(store.getRecentFor('voicing')).toEqual(['/path/to/voicing']);
  });

  it('setCurrentModeRoot alone does not affect the recent list', () => {
    store.setCurrentMode('voicing');
    store.setCurrentModeRoot('/path/only');
    expect(store.getRecent()).toEqual([]);
  });

  // ---------------------------------------------------------------------
  // Duplicate handling – moving to front without duplication
  // ---------------------------------------------------------------------
  it('re‑remembering an existing path moves it to the front without duplication', () => {
    store.setCurrentMode('voicing');
    store.setCurrentModeRoot('/a');
    store.rememberCurrent(); // ['a']
    store.setCurrentModeRoot('/b');
    store.rememberCurrent(); // ['b','a']
    store.setCurrentModeRoot('/a');
    store.rememberCurrent(); // ['a','b'] – no duplicate 'a'
    expect(store.getRecent()).toEqual(['/a', '/b']);
    expect(store.getRecent()).toHaveLength(2);
  });

  // ---------------------------------------------------------------------
  // Cap at eight entries
  // ---------------------------------------------------------------------
  it('caps the recent list at eight entries, discarding the oldest', () => {
    store.setCurrentMode('voicing');
    for (let i = 1; i <= 9; i++) {
      const p = `/p${i}`;
      store.setCurrentModeRoot(p);
      store.rememberCurrent();
    }
    const recent = store.getRecent();
    expect(recent).toHaveLength(8);
    // Newest first: /p9 … /p2
    expect(recent).toEqual(['/p9', '/p8', '/p7', '/p6', '/p5', '/p4', '/p3', '/p2']);
    expect(recent).not.toContain('/p1');
  });

  // ---------------------------------------------------------------------
  // Empty / whitespace handling
  // ---------------------------------------------------------------------
  it('does not record empty or whitespace‑only paths', () => {
    store.setCurrentMode('voicing');
    store.setCurrentModeRoot('');
    store.rememberCurrent();
    store.setCurrentModeRoot('   ');
    store.rememberCurrent();
    expect(store.getRecent()).toEqual([]);
  });

  // ---------------------------------------------------------------------
  // Case and slash sensitivity – treated as distinct entries
  // ---------------------------------------------------------------------
  it('keeps paths that differ only in case or slash direction separate', () => {
    store.setCurrentMode('voicing');
    store.setCurrentModeRoot('/path/dir');
    store.rememberCurrent();
    store.setCurrentModeRoot('/PATH/DIR');
    store.rememberCurrent();
    const recent = store.getRecent();
    expect(recent).toHaveLength(2);
    expect(recent).toEqual(['/PATH/DIR', '/path/dir']);
  });

  // ---------------------------------------------------------------------
  // Independence of mode histories
  // ---------------------------------------------------------------------
  it('maintains independent recent lists for voicing and dubbing modes', () => {
    // Voicing entry
    store.setCurrentMode('voicing');
    store.setCurrentModeRoot('/voicing/one');
    store.rememberCurrent();

    // Switch to dubbing and add a different entry
    store.setCurrentMode('dubbing');
    store.setCurrentModeRoot('/dubbing/one');
    store.rememberCurrent();

    // Verify each mode's list stays separate
    expect(store.getRecentFor('voicing')).toEqual(['/voicing/one']);
    expect(store.getRecentFor('dubbing')).toEqual(['/dubbing/one']);
    // getRecent() reflects the *current* mode (dubbing here)
    expect(store.getRecent()).toEqual(['/dubbing/one']);
  });

  // ---------------------------------------------------------------------
  // Persistence – loading from storage, handling corrupt data
  // ---------------------------------------------------------------------
  it('loads a well‑formed JSON array from storage on construction', () => {
    const stored = JSON.stringify(['/saved/one', '/saved/two']);
    storage.getItem.mockImplementation((key) => {
      if (key === recentKey('voicing')) return stored;
      return null;
    });
    const freshStore = makeRootStore(storage);
    expect(freshStore.getRecentFor('voicing')).toEqual(['/saved/one', '/saved/two']);
  });

  it('treats corrupt JSON in storage as an empty recent list', () => {
    storage.getItem.mockImplementation((key) => {
      if (key === recentKey('voicing')) return '{not: "json"}';
      return null;
    });
    const freshStore = makeRootStore(storage);
    expect(freshStore.getRecentFor('voicing')).toEqual([]);
  });

  // ---------------------------------------------------------------------
  // Storage errors – reading and writing must not crash the store
  // ---------------------------------------------------------------------
  it('does not crash when storage.getItem throws while reading recent history', () => {
    storage.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const safeStore = makeRootStore(storage);
    expect(() => safeStore.getRecentFor('voicing')).not.toThrow();
    expect(safeStore.getRecentFor('voicing')).toEqual([]);
  });

  it('does not crash when storage.setItem throws while recording recent history', () => {
    storage.setItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const safeStore = makeRootStore(storage);
    safeStore.setCurrentMode('voicing');
    safeStore.setCurrentModeRoot('/path');
    expect(() => safeStore.rememberCurrent()).not.toThrow();
    // The in‑memory list should still be updated even if persisting fails
    expect(safeStore.getRecent()).toEqual(['/path']);
  });
});
