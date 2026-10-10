import { SCRIPT_LIBRARY_API, VO_DUB_API } from "../src/shared/fl_common.js";

export function makeWidget(initial = "") {
    return { value: initial, callback: null };
}

export const checkedApi = {
    isChecked: (fname) => {
        const checked = JSON.parse(localStorage.getItem("FL_Electron.checkedFiles") || "[]");
        return checked.includes(fname);
    },
    setChecked: (fname, val) => {
        let checked = JSON.parse(localStorage.getItem("FL_Electron.checkedFiles") || "[]");
        if (val) {
            if (!checked.includes(fname)) checked.push(fname);
        } else {
            checked = checked.filter(f => f !== fname);
        }
        localStorage.setItem("FL_Electron.checkedFiles", JSON.stringify(checked));
        console.log("[electron-ui] setChecked", fname, val);
    },
};

export const revoiceApi = {
    revoiceLine: async ({ folder, baseName, linePosition, speaker, instruct, text }) => {
        const resp = await fetch(`${SCRIPT_LIBRARY_API}/render/line`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder, base_name: baseName, position: linePosition, speaker, instruct, text }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        return data;
    },
};

export const renderApi = {
    renderRow: async ({ root, audioKey }) => {
        const resp = await fetch(`${VO_DUB_API}/render/row`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ root, audio_key: audioKey }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        return data;
    },
};