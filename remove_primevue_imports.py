import glob, re, os, sys

def should_remove(line):
    # Remove import statements from primevue components (not config, useconfirm, confirmationservice)
    # Pattern: import X from "primevue/something"
    # We'll match lines that start with optional whitespace, then import, then anything, then from "primevue/" and not ending with config, confirmationservice, useconfirm
    m = re.match(r"^\s*import\s+.*\s+from\s+\"primevue/([^\"]+)\"", line)
    if not m:
        return False
    module = m.group(1)
    # Keep config, confirmationservice, useconfirm
    if module in ("config", "confirmationservice", "useconfirm"):
        return False
    # Otherwise, this is a component import to remove
    return True

def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    new_lines = [l for l in lines if not should_remove(l)]
    if new_lines != lines:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Processed {path}")

if __name__ == "__main__":
    # Recursively find .vue files under src
    for path in glob.glob(os.path.join('src', '**', '*.vue'), recursive=True):
        process_file(path)
