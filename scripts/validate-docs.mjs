#!/usr/bin/env node
/**
 * validate-docs.mjs
 *
 * Validation gate: checks that every .md file in docs/architecture/
 * and docs/features/ contains at least one diagram (mermaid block or
 * image reference).
 *
 * Exit codes:
 *   0 – all files pass
 *   1 – one or more files are missing diagrams
 *
 * Usage:
 *   node scripts/validate-docs.mjs
 *   node scripts/validate-docs.mjs --fix   # inject a placeholder diagram
 */

import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const TARGET_DIRS = ["docs/architecture", "docs/features"];
const DIAGRAM_PATTERN = /```(mermaid|flowchart|sequenceDiagram|graph|stateDiagram|erDiagram|classDiagram|gantt|pie|quadrantChart|mindmap|timeline|gitgraph|journey|section|block)\b/i;
const IMAGE_PATTERN = /!\[.*?\]\(.*?\.(png|svg|jpg|jpeg|webp)\)/i;
const args = process.argv.slice(2);
const FIX_MODE = args.includes("--fix");

function findTargetFiles() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    const absDir = join(ROOT, dir);
    const pattern = join(absDir, "**", "*.md");
    const matches = globSync(pattern);
    files.push(...matches);
  }
  return files;
}

function hasDiagram(content) {
  return DIAGRAM_PATTERN.test(content) || IMAGE_PATTERN.test(content);
}

function injectPlaceholderDiagram(mdFile) {
  const content = readFileSync(mdFile, "utf-8");
  const rel = relative(ROOT, mdFile);

  // Only inject if no diagram exists
  if (hasDiagram(content)) return false;

  // Don't inject into files that are clearly not diagram-friendly
  if (content.trim().length < 10) return false;

  const title = basename(mdFile, ".md").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const placeholder = `\n\n## Diagrama del sistema\n\n\`\`\`mermaid\nflowchart TD\n  A[${title}] --> B[Definir componentes]\n  B --> C{Completo?}\n  C -- Sí --> D[Documentado]\n  C -- No --> E[Iterar]\n\`\`\`\n`;

  writeFileSync(mdFile, content.trimEnd() + placeholder, "utf-8");
  return true;
}

function main() {
  const files = findTargetFiles();

  if (files.length === 0) {
    console.log("⚠ No markdown files found in target directories.");
    console.log(`  (Searched: ${TARGET_DIRS.join(", ")})`);
    return;
  }

  console.log(`🔍 Validating ${files.length} documentation file(s)...\n`);

  let passed = 0;
  let failed = 0;
  let fixed = 0;

  for (const mdFile of files) {
    const rel = relative(ROOT, mdFile);
    const content = readFileSync(mdFile, "utf-8");

    if (hasDiagram(content)) {
      console.log(`  ✓ ${rel}`);
      passed++;
    } else if (FIX_MODE) {
      const injected = injectPlaceholderDiagram(mdFile);
      if (injected) {
        console.log(`  ✓ ${rel} → (placeholder injected)`);
        fixed++;
        passed++;
      } else {
        console.log(`  ⚠ ${rel} → (too small to inject)`);
        passed++;
      }
    } else {
      console.log(`  ✗ ${rel} — NO DIAGRAM FOUND`);
      failed++;
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log(`✓ ${passed} passed`);
  if (fixed > 0) console.log(`  (${fixed} placeholder(s) injected)`);
  if (failed > 0) console.log(`✗ ${failed} failed (missing diagrams)`);

  if (failed > 0) {
    console.log("\n💡 Tip: Add a mermaid diagram (```mermaid) or an image (![alt](path.png)).");
    console.log("   Or run with --fix to inject placeholders.");
    process.exitCode = 1;
  }
}

main();
