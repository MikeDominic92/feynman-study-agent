import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "out",
  "build",
  "data",
  "imports",
  "local-imports",
  "local-sources",
  "course-files",
  "private",
  "evidence",
  "screenshots",
]);
const blockedExtensions = new Set([".pptx", ".xlsx", ".xls", ".pdf", ".docx", ".odt", ".pages", ".key"]);
const blockedContent = [
  /C:\\Users\\jae2j\\Downloads/i,
  /Intro 2025 - Lecture 1/i,
  /Radiation Quantities 2025/i,
  /Quantities and Units Grid/i,
  /Student Copy/i,
  /Student copy/i,
  /Zendesk/i,
  /WebEDI/i,
  /support\.cleo\.com/i,
];

const findings = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) {
        await walk(fullPath);
      }
      continue;
    }

    if (
      ["scripts/privacy-scan.mjs", "scripts/no-write-guard.mjs"].includes(
        relativePath.replaceAll("\\", "/"),
      )
    ) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (blockedExtensions.has(extension)) {
      findings.push(`${relativePath}: blocked course-file extension`);
      continue;
    }

    const info = await stat(fullPath);
    if (info.size > 1_000_000) {
      continue;
    }

    const text = await readFile(fullPath, "utf8").catch(() => "");
    for (const pattern of blockedContent) {
      if (pattern.test(text)) {
        findings.push(`${relativePath}: blocked private content pattern ${pattern}`);
      }
    }
  }
}

await walk(root);

if (findings.length > 0) {
  console.error("Privacy scan failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Privacy scan passed.");
