import { createApp } from "vue";
import App from "./App.vue";
import { pinia } from "../src/shared/pinia.js";
import PrimeVue from "primevue/config";
import { registerPrimeVueComponents } from "../src/shared/primevue_components.js";
import { ensureStylesLinked } from "../src/shared/styles_link.js";
import { createRouter } from "./router.js";

ensureStylesLinked(import.meta.url);

const app = createApp(App);

app.use(pinia);
app.use(PrimeVue, { ripple: true });
registerPrimeVueComponents(app);
app.use(createRouter());

app.mount("#app");
