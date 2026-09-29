export function speedMatchLabel(enDurationS, ruDurationS) {
    if (
        enDurationS == null ||
        ruDurationS == null ||
        enDurationS <= 0 ||
        ruDurationS <= 0 ||
        typeof enDurationS !== 'number' ||
        typeof ruDurationS !== 'number'
    ) {
        return { ratio: 1, percent: 0, label: "" };
    }

    let ratio = ruDurationS / enDurationS;

    // Clamping to 0.5 .. 2.0
    if (ratio < 0.5) {
        ratio = 0.5;
    } else if (ratio > 2.0) {
        ratio = 2.0;
    }

    const percent = Math.round((ratio - 1) * 100);

    let label = "";
    if (percent !== 0) {
        const sign = percent > 0 ? "+" : "";
        label = `${sign}${percent}%`;
    }

    return { ratio, percent, label };
}
