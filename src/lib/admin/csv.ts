// Neutraliza fórmulas al abrir CSV en hojas de cálculo.
export function adminCsv(records: Record<string, unknown>[]) {
    const columns = [...new Set(records.flatMap(r => Object.keys(r)))];
    const cell = (value: unknown) => {
        let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
        if (/^[\s]*[=+\-@]/.test(text))
            text = "'" + text;
        return '"' + text.replaceAll('"', '""') + '"';
    };
    return '\uFEFF' + [columns.map(cell).join(';'), ...records.map(r => columns.map(k => cell(r[k])).join(';'))].join('\r\n');
}
