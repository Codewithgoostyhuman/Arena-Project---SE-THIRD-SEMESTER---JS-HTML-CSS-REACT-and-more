import fs from "fs"
import path from "path"

const OUTPUT_FILE = "FLATTENED_PROJECT.md";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vercel",
  "coverage",
]);

const IGNORE_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

const ROOT_DIR = process.cwd();

/* ---------------- Folder Tree ---------------- */

function buildTree(dir, prefix = "") {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let tree = "";

  items.forEach((item, index) => {
    if (IGNORE_DIRS.has(item.name)) return;

    const isLast = index === items.length - 1;
    const pointer = isLast ? "└─ " : "├─ ";
    tree += `${prefix}${pointer}${item.name}\n`;

    if (item.isDirectory()) {
      const nextPrefix = prefix + (isLast ? "   " : "│  ");
      tree += buildTree(path.join(dir, item.name), nextPrefix);
    }
  });

  return tree;
}

/* ---------------- File Flattening ---------------- */

function flattenFiles(dir, output) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (item.isDirectory()) {
      if (!IGNORE_DIRS.has(item.name)) {
        flattenFiles(fullPath, output);
      }
    } else {
      if (IGNORE_FILES.has(item.name)) continue;

      const ext = path.extname(item.name).replace(".", "") || "txt";
      const content = fs.readFileSync(fullPath, "utf-8");

      output.push(
        `\n---\n\n## File: ${relativePath}\n\n\`\`\`${ext}\n${content}\n\`\`\`\n`
      );
    }
  }
}

/* ---------------- Main ---------------- */

function run() {
  console.log("🔍 Flattening project...");

  const output = [];
  output.push("# FLATTENED REACT ARENA PROJECT\n");
  output.push("## Folder Structure\n");
  output.push("```");
  output.push(buildTree(ROOT_DIR));
  output.push("```\n");

  flattenFiles(ROOT_DIR, output);

  fs.writeFileSync(OUTPUT_FILE, output.join(""), "utf-8");

  console.log(`✅ Done! Output written to ${OUTPUT_FILE}`);
}

run();
