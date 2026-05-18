import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const filesToInspect = ["package.json"];
const workflowDir = path.join(root, ".github", "workflows");
const banned = [
  /zendesk/i,
  /ecgrid/i,
  /admin\s*3\.5/i,
  /openai\s+files/i,
  /curl\s+.*(post|put|patch|delete)/i,
  /fetch\(.+method:\s*["'](POST|PUT|PATCH|DELETE)/i,
];

async function addWorkflowFiles() {
  const entries = await readdir(workflowDir).catch(() => []);
  for (const entry of entries) {
    filesToInspect.push(path.join(".github", "workflows", entry));
  }
}

await addWorkflowFiles();

const findings = [];

for (const file of filesToInspect) {
  const fullPath = path.join(root, file);
  const text = await readFile(fullPath, "utf8").catch(() => "");
  for (const pattern of banned) {
    if (pattern.test(text)) {
      findings.push(`${file}: external write pattern ${pattern}`);
    }
  }
}

if (findings.length > 0) {
  console.error("No-write guard failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("No-write guard passed.");
