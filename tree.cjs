// tree.cjs — вывод структуры проекта.
// Запуск: node tree.cjs [путь] [--files] [--depth=N] [--out=file.txt]

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith("--")) || ".";
const showFiles = args.includes("--files");
const depthArg = args.find((a) => a.startsWith("--depth="));
const maxDepth = depthArg ? Number(depthArg.split("=")[1]) : 4;
const outArg = args.find((a) => a.startsWith("--out="));
const outFile = outArg ? outArg.split("=")[1] : null;

const IGNORE = new Set([
    ".git", ".hg", ".svn", "node_modules", "__pycache__", ".pytest_cache",
    ".venv", "venv", "env", "dist", "build", "out", ".next", ".nuxt",
    ".cache", ".idea", ".vscode", ".DS_Store", "coverage",
]);

const lines = [];

function walk(dir, prefix, depth) {
    if (depth > maxDepth) return;

    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        console.error(`[skip] ${dir}: ${e.message}`);
        return;
    }

    entries.sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    const visible = entries.filter((e) =>
        !IGNORE.has(e.name) && (showFiles || e.isDirectory()),
    );

    visible.forEach((entry, i) => {
        const last = i === visible.length - 1;
        lines.push(`${prefix}${last ? "└── " : "├── "}${entry.name}${entry.isDirectory() ? "/" : ""}`);
        if (entry.isDirectory()) {
            walk(path.join(dir, entry.name), prefix + (last ? "    " : "│   "), depth + 1);
        }
    });
}

try {
    const abs = path.resolve(root);

    if (!fs.existsSync(abs)) {
        console.error(`Ошибка: путь не существует: ${abs}`);
        console.error(`Текущая директория: ${process.cwd()}`);
        process.exit(1);
    }

    console.error(`Сканирую: ${abs}`);
    console.error(`Глубина: ${maxDepth}, файлы: ${showFiles ? "да" : "нет"}`);

    lines.push(`${path.basename(abs)}/`);
    walk(abs, "", 1);

    const out = lines.join("\n");

    if (outFile) {
        fs.writeFileSync(outFile, out);
        console.error(`Записано в ${outFile} (${lines.length} строк)`);
    } else {
        console.log(out);
    }
} catch (e) {
    console.error(`Ошибка: ${e.message}`);
    console.error(e.stack);
    process.exit(1);
}