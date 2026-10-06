import { createApp } from "vue";
import App from "./App.vue";
import { pinia } from "../src/shared/pinia.js";
import PrimeVue from "primevue/config";
/*
 The line editor calls useConfirm(). Until this slice it got the service from
 its own ephemeral createApp in src/line_editor/main.js; now that it is a
 route in this single app, the service has to be installed here or the editor
 renders blank with "No PrimeVue Confirmation provided!".
*/
import ConfirmationService from "primevue/confirmationservice";
import { registerPrimeVueComponents } from "../src/shared/primevue_components.js";
import { ensureStylesLinked } from "../src/shared/styles_link.js";
import { createRouter } from "./router.js";

ensureStylesLinked(import.meta.url);

const app = createApp(App);

app.use(pinia);
app.use(PrimeVue, { ripple: true });
app.use(ConfirmationService);
registerPrimeVueComponents(app);
app.use(createRouter());

app.mount("#app");
