import Avatar from "primevue/avatar";
import Button from "primevue/button";
import ButtonGroup from "primevue/buttongroup";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import ConfirmDialog from "primevue/confirmdialog";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import Fieldset from "primevue/fieldset";
import InlineMessage from "primevue/inlinemessage";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputNumber from "primevue/inputnumber";
import InputSwitch from "primevue/inputswitch";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Textarea from "primevue/textarea";

export function registerPrimeVueComponents(app) {
    app.component("Avatar", Avatar);
    app.component("Button", Button);
    app.component("ButtonGroup", ButtonGroup);
    app.component("Card", Card);
    app.component("Checkbox", Checkbox);
    app.component("ConfirmDialog", ConfirmDialog);
    app.component("Dialog", Dialog);
    app.component("Divider", Divider);
    app.component("Dropdown", Dropdown);
    app.component("Fieldset", Fieldset);
    app.component("InlineMessage", InlineMessage);
    app.component("InputGroup", InputGroup);
    app.component("InputGroupAddon", InputGroupAddon);
    app.component("InputNumber", InputNumber);
    app.component("InputSwitch", InputSwitch);
    app.component("InputText", InputText);
    app.component("Message", Message);
    app.component("Textarea", Textarea);
}
