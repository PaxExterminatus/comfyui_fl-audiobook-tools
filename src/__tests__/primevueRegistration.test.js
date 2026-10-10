import { describe, it, expect } from "vitest";
import { createApp } from "vue";
import { registerPrimeVueComponents } from "../shared/primevue_components.js";

// List of expected PrimeVue component names to be globally registered.
const EXPECTED_COMPONENTS = [
    "Avatar",
    "Button",
    "ButtonGroup",
    "Card",
    "Checkbox",
    "ConfirmDialog",
    "Dialog",
    "Divider",
    "Dropdown",
    "Fieldset",
    "InlineMessage",
    "InputGroup",
    "InputGroupAddon",
    "InputNumber",
    "InputSwitch",
    "InputText",
    "Message",
    "Textarea",
];

/** Helper to retrieve the set of component names registered on the app. */
function getRegisteredComponentNames(app) {
    // Vue's internal registry is stored under _context.components.
    // The keys are the component names.
    return Object.keys(app._context.components || {});
}

describe("registerPrimeVueComponents", () => {
    it("registers exactly the expected number of components", () => {
        const app = createApp({});
        registerPrimeVueComponents(app);
        const names = getRegisteredComponentNames(app);
        expect(names).toHaveLength(EXPECTED_COMPONENTS.length);
    });

    it("registers the expected component names and no extras", () => {
        const app = createApp({});
        registerPrimeVueComponents(app);
        const names = getRegisteredComponentNames(app).sort();
        const expected = EXPECTED_COMPONENTS.slice().sort();
        expect(names).toEqual(expected);
    });

    it("can be called twice on a fresh app without throwing", () => {
        const app = createApp({});
        expect(() => {
            registerPrimeVueComponents(app);
            registerPrimeVueComponents(app);
        }).not.toThrow();
    });

    it("contains Button after registration", () => {
        const app = createApp({});
        registerPrimeVueComponents(app);
        const names = getRegisteredComponentNames(app);
        expect(names).toContain("Button");
    });

    it("contains InputText after registration", () => {
        const app = createApp({});
        registerPrimeVueComponents(app);
        const names = getRegisteredComponentNames(app);
        expect(names).toContain("InputText");
    });
});
