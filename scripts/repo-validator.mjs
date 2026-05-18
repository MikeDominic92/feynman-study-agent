import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  ".env.example",
  ".github/workflows/ci.yml",
  "docs/research-prompt.md",
  "docs/architecture.md",
  "docs/local-first-runbook.md",
  "docs/goals/production-ready-local-first-mvp/goal.md",
  "docs/goals/production-ready-local-first-mvp/state.yaml",
  "fixtures/sanitized-radiation-packet.md",
  "src/lib/types.ts",
  "src/lib/sample-data.ts",
  "src/lib/feynman.ts",
  "src/lib/storage.ts",
  "src/lib/retrieval.ts",
  "src/lib/tutor-service.ts",
  "src/lib/exports.ts",
];
const requiredScripts = [
  "lint",
  "typecheck",
  "test",
  "privacy:scan",
  "guard:no-external",
  "validate:repo",
  "precommit:check",
  "verify:prod",
];
const requiredIgnorePatterns = [
  "!.env.example",
  "/imports/",
  "/local-imports/",
  "/local-sources/",
  "/course-files/",
  "/data/",
  "*.sqlite",
  "*.pptx",
  "*.xlsx",
  "*.pdf",
  "*.docx",
];

const findings = [];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  await stat(fullPath).catch(() => findings.push(`missing ${file}`));
}

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    findings.push(`missing package script ${script}`);
  }
}

const gitignore = await readFile(path.join(root, ".gitignore"), "utf8");
for (const pattern of requiredIgnorePatterns) {
  if (!gitignore.includes(pattern)) {
    findings.push(`missing .gitignore pattern ${pattern}`);
  }
}

const readme = await readFile(path.join(root, "README.md"), "utf8");
if (/Create Next App|Deploy Now|Vercel template/i.test(readme)) {
  findings.push("README still contains starter copy");
}

if (findings.length > 0) {
  console.error("Repo validator failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Repo validator passed.");
