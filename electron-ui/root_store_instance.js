// Single shared root store instance
// Created once and imported everywhere — all components share the same mode/roots
// localStorage is available as a global in the Electron renderer process
import { makeRootStore } from './root_store.js';

export const rootStore = makeRootStore(localStorage);