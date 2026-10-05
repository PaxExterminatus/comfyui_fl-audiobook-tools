/*
Общий Pinia instance для всех эфемерных Vue-приложений проекта.
 */
import { createPinia, setActivePinia } from "pinia";

export const pinia = createPinia();
// Ensure Pinia is active for environments (like tests) that import this module without explicitly installing it.
setActivePinia(pinia);
