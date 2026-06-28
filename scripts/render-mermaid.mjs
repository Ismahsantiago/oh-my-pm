#!/usr/bin/env node
// render-mermaid.mjs
// Extracts mermaid blocks from docs/**/*.md, renders each to PNG
// via @mermaid-js/mermaid-cli (mmdc), and inserts image references.

import { execSync } from "node:child_process";
import {
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT, "docs");
const IMAGES_DIR = join(DOCS_DIR, "images");
const MERMAID_BLOCK_RE = /```mermaid\n([\s\S]*?)```/g;

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes("--check");
const FORCE = args.includes("--force");

function log(...msg) {
  if (!CHECK_ONLY) console.log(...msg);
}

function warn(...msg) {
  console.warn(...msg);
}

function findMarkdownFiles() {
  return globSync(join(DOCS_DIR, "**", "*.md")).filter(
    (f) => !f.includes("node_modules") && !f.includes(".git"),
  );
}

function blockFilename(mdFile, index) {
  const rel = relative(DOCS_DIR, mdFile);
  const name = rel.replaceAll("/", "--").replace(/\.md$/, "");
  return `${name}-${index}.png`;
}

function extractMermaidBlocks(content) {
  const blocks = [];
  let match;
  while ((match = MERMAID_BLOCK_RE.exec(content)) !== null) {
    blocks.push({ code: match[1].trim(), index: blocks.length });
  }
  return blocks;
}

function hasImageReference(content, imagePath) {
  return content.includes(relative(DOCS_DIR, imagePath));
}

function renderBlock(blockCode, outputPath) {
  const tmpFile = join(
    tmpdir(),
    `mermaid-render-${Date.now()}-${Math.random().toString(36).slice(2)}.mmd`,
  );

  try {
    writeFileSync(tmpFile, blockCode, "utf-8");
    mkdirSync(dirname(outputPath), { recursive: true });
    execSync(
      `npx -y mmdc -i "${tmpFile}" -o "${outputPath}" -b transparent --quiet`,
      {
        cwd: ROOT,
        stdio: "pipe",
        timeout: 30000,
        env: {
          ...process.env,
          PUPPETEER_EXECUTABLE_PATH:
            process.env.PUPPETEER_EXECUTABLE_PATH ||
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        },
      },
    );
    return existsSync(outputPath);
  } catch (err) {
    warn(`  x mmdc error: ${err.message}`);
    return false;
  } finally {
    rmSync(tmpFile, { force: true });
  }
}

function insertImageReference(content, blockIndex, imageRelPath) {
  let matchIndex = 0;
  return content.replace(MERMAID_BLOCK_RE, (match) => {
    if (matchIndex === blockIndex) {
      return match + `\n![Diagrama ${blockIndex + 1}](${imageRelPath})\n`;
    }
    matchIndex++;
    return match;
  });
}

async function main() {
  console.log("Scanning docs/ for mermaid blocks...\n");

  const files = findMarkdownFiles();
  if (files.length === 0) {
    console.log("No markdown files found in docs/.");
    return;
  }

  let totalBlocks = 0;
  let rendered = 0;
  let skipped = 0;
  let failed = 0;

  for (const mdFile of files) {
    const relPath = relative(DOCS_DIR, mdFile);
    const content = readFileSync(mdFile, "utf-8");
    const blocks = extractMermaidBlocks(content);
    if (blocks.length === 0) continue;

    totalBlocks += blocks.length;
    log(`\n${relPath} (${blocks.length} block${blocks.length > 1 ? "s" : ""})`);

    let modifiedContent = content;

    for (const block of blocks) {
      const imgFilename = blockFilename(mdFile, block.index);
      const imgPath = join(IMAGES_DIR, imgFilename);
      const imgRelPath = relative(dirname(mdFile), imgPath);

      if (!FORCE && hasImageReference(modifiedContent, imgPath)) {
        log(`  - Block ${block.index + 1}: already referenced (skipping)`);
        skipped++;
        continue;
      }

      if (CHECK_ONLY) {
        log(`  ~ Block ${block.index + 1}: would render to ${imgRelPath}`);
        continue;
      }

      log(`  > Rendering block ${block.index + 1}...`);
      const ok = renderBlock(block.code, imgPath);

      if (ok) {
        modifiedContent = insertImageReference(modifiedContent, block.index, imgRelPath);
        rendered++;
        log(`  + Rendered to ${imgRelPath}`);
      } else {
        failed++;
        warn(`  x Failed to render block ${block.index + 1}`);
      }
    }

    if (modifiedContent !== content) {
      writeFileSync(mdFile, modifiedContent, "utf-8");
    }
  }

  console.log("\n========");
  if (CHECK_ONLY) {
    console.log(
      `Would render: ${totalBlocks} diagram(s) - ${skipped} already referenced, ${totalBlocks - skipped} pending`,
    );
  } else {
    console.log(`Results: ${rendered} rendered, ${skipped} skipped, ${failed} failed`);
    console.log(`Total blocks found: ${totalBlocks}`);
  }

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
