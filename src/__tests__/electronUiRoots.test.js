import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeRootStore } from '../../electron-ui/root_store.js';

describe('makeRootStore', () => {
  let storage;
  let store;

  beforeEach(() => {
    // Mock storage that mimics localStorage
    storage = {
      getItem: vi.fn((key) => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    store = makeRootStore(storage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getVoicingRoot / setVoicingRoot', () => {
    it('returns empty string when nothing set', () => {
      expect(store.getVoicingRoot()).toBe('');
    });

    it('sets and gets voicing root', () => {
      store.setVoicingRoot('/path/to/voicing');
      expect(store.getVoicingRoot()).toBe('/path/to/voicing');
      expect(storage.setItem).toHaveBeenCalledWith('FL_Electron.voicingRoot', '/path/to/voicing');
    });

    it('does not affect dubbing root when setting voicing root', () => {
      store.setDubbingRoot('/path/to/dubbing');
      store.setVoicingRoot('/path/to/voicing');
      expect(store.getDubbingRoot()).toBe('/path/to/dubbing');
    });
  });

  describe('getDubbingRoot / setDubbingRoot', () => {
    it('returns empty string when nothing set', () => {
      expect(store.getDubbingRoot()).toBe('');
    });

    it('sets and gets dubbing root', () => {
      store.setDubbingRoot('/path/to/dubbing');
      expect(store.getDubbingRoot()).toBe('/path/to/dubbing');
      expect(storage.setItem).toHaveBeenCalledWith('FL_Electron.dubbingRoot', '/path/to/dubbing');
    });

    it('does not affect voicing root when setting dubbing root', () => {
      store.setVoicingRoot('/path/to/voicing');
      store.setDubbingRoot('/path/to/dubbing');
      expect(store.getVoicingRoot()).toBe('/path/to/voicing');
    });
  });

  describe('mode switching', () => {
    it('starts in voicing mode', () => {
      expect(store.getCurrentMode()).toBe('voicing');
    });

    it('can switch to dubbing mode', () => {
      store.setCurrentMode('dubbing');
      expect(store.getCurrentMode()).toBe('dubbing');
    });

    it('can switch back to voicing mode', () => {
      store.setCurrentMode('dubbing');
      store.setCurrentMode('voicing');
      expect(store.getCurrentMode()).toBe('voicing');
    });

    it('getCurrentModeRoot returns voicing root when in voicing mode', () => {
      store.setVoicingRoot('/path/to/voicing');
      store.setCurrentMode('voicing');
      expect(store.getCurrentModeRoot()).toBe('/path/to/voicing');
    });

    it('getCurrentModeRoot returns dubbing root when in dubbing mode', () => {
      store.setDubbingRoot('/path/to/dubbing');
      store.setCurrentMode('dubbing');
      expect(store.getCurrentModeRoot()).toBe('/path/to/dubbing');
    });

    it('setting current mode root updates the correct storage', () => {
      store.setCurrentMode('voicing');
      store.setCurrentModeRoot('/path/to/voicing');
      expect(store.getVoicingRoot()).toBe('/path/to/voicing');
      expect(store.getDubbingRoot()).toBe('');

      store.setCurrentMode('dubbing');
      store.setCurrentModeRoot('/path/to/dubbing');
      expect(store.getDubbingRoot()).toBe('/path/to/dubbing');
      expect(store.getVoicingRoot()).toBe('/path/to/voicing');
    });

    it('value set in one mode persists after switching away and back', () => {
      store.setCurrentMode('voicing');
      store.setVoicingRoot('/path/to/voicing');
      store.setCurrentMode('dubbing');
      store.setDubbingRoot('/path/to/dubbing');
      store.setCurrentMode('voicing');
      expect(store.getVoicingRoot()).toBe('/path/to/voicing');
      store.setCurrentMode('dubbing');
      expect(store.getDubbingRoot()).toBe('/path/to/dubbing');
    });
  });

  describe('migration', () => {
    it('migrates old voDubRoot to dubbingRoot when new keys are empty', () => {
      // Simulate existing storage with old key
      storage.getItem.mockImplementation((key) => {
        if (key === 'FL_Electron.voDubRoot') return '/old/path';
        return null;
      });
      // Create new store - migration should run during construction
      const migratedStore = makeRootStore(storage);
      expect(migratedStore.getVoicingRoot()).toBe('');
      expect(migratedStore.getDubbingRoot()).toBe('/old/path');
      // Old key should be left alone (not cleared)
      expect(storage.getItem).toHaveBeenCalledWith('FL_Electron.voDubRoot');
      // Should not have called setItem for voicingRoot
      expect(storage.setItem).toHaveBeenCalledWith('FL_Electron.dubbingRoot', '/old/path');
      expect(storage.setItem).not.toHaveBeenCalledWith('FL_Electron.voicingRoot', expect.any(String));
    });

    it('does not migrate if either new key already exists', () => {
      // Simulate existing storage with old key and voicingRoot already set
      storage.getItem.mockImplementation((key) => {
        if (key === 'FL_Electron.voDubRoot') return '/old/path';
        if (key === 'FL_Electron.voicingRoot') return '/new/voicing';
        return null;
      });
      const migratedStore = makeRootStore(storage);
      expect(migratedStore.getVoicingRoot()).toBe('/new/voicing');
      expect(migratedStore.getDubbingRoot()).toBe(''); // Should not migrate
      // Should not have set dubbingRoot
      expect(storage.setItem).not.toHaveBeenCalledWith('FL_Electron.dubbingRoot', '/old/path');
    });

    it('does not run migration a second time', () => {
      // First run: migrate
      storage.getItem.mockImplementation((key) => {
        if (key === 'FL_Electron.voDubRoot') return '/old/path';
        return null;
      });
      const store1 = makeRootStore(storage);
      expect(store1.getDubbingRoot()).toBe('/old/path');

      // Second run: simulate that dubbingRoot is now set (so migration should skip)
      storage.getItem.mockImplementation((key) => {
        if (key === 'FL_Electron.voDubRoot') return '/old/path';
        if (key === 'FL_Electron.dubbingRoot') return '/old/path'; // already migrated
        return null;
      });
      const store2 = makeRootStore(storage);
      expect(store2.getDubbingRoot()).toBe('/old/path');
      // Should not have called setItem again for dubbingRoot (already set)
      expect(storage.setItem).toHaveBeenCalledTimes(1); // only from first store's migration
    });

    it('does not overwrite dubbingRoot if user has changed it after migration', () => {
      // First run: migrate old key to dubbingRoot
      storage.getItem.mockImplementation((key) => {
        if (key === 'FL_Electron.voDubRoot') return '/old/path';
        return null;
      });
      const store1 = makeRootStore(storage);
      expect(store1.getDubbingRoot()).toBe('/old/path');

      // User changes dubbingRoot
      store1.setDubbingRoot('/new/user/path');

      // Second run: should not overwrite user's value
      storage.getItem.mockImplementation((key) => {
        if (key === 'FL_Electron.voDubRoot') return '/old/path';
        if (key === 'FL_Electron.dubbingRoot') return '/new/user/path'; // user's value
        return null;
      });
      const store2 = makeRootStore(storage);
      expect(store2.getDubbingRoot()).toBe('/new/user/path');
      expect(store2.getVoicingRoot()).toBe('');
    });
  });

  describe('storage errors', () => {
    it('does not crash when storage.getItem throws', () => {
      storage.getItem.mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      const store = makeRootStore(storage);
      // Should not throw
      expect(() => store.getVoicingRoot()).not.toThrow();
      expect(() => store.getDubbingRoot()).not.toThrow();
      expect(store.getVoicingRoot()).toBe('');
      expect(store.getDubbingRoot()).toBe('');
    });

    it('does not crash when storage.setItem throws', () => {
      storage.setItem.mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      const store = makeRootStore(storage);
      // Should not throw
      expect(() => store.setVoicingRoot('/path')).not.toThrow();
      expect(() => store.setDubbingRoot('/path')).not.toThrow();
    });
  });
});