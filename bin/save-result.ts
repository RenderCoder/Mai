#!/usr/bin/env bun

/**
 * save-result.ts — 文案结果保存工具
 *
 * 主要用途：
 * 1. 作为 SKILL.md 中 Claude 使用 Bash 工具调用的备选方案
 * 2. 用户手动保存/重新保存结果时的独立工具
 *
 * 用法：
 *   bun run bin/save-result.ts --requirement <path> --content <content-file>
 *   echo "<content>" | bun run bin/save-result.ts --requirement <path>
 *   bun run bin/save-result.ts --product <path> --copy-type title --content <content-file>
 */

import { parseArgs } from "util";
import { resolve, dirname, basename, join, extname } from "path";
import { existsSync } from "fs";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    requirement: { type: "string", short: "r" },
    product: { type: "string", short: "p" },
    "copy-type": { type: "string", short: "t", default: "full-listing" },
    content: { type: "string", short: "c" },
    date: { type: "string", short: "d" },
    "dry-run": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  console.log(`
Usage:
  bun run bin/save-result.ts --requirement <path> --content <content-file>
  bun run bin/save-result.ts --product <path> --copy-type <type> --content <content-file>
  echo "<content>" | bun run bin/save-result.ts --requirement <path>

Options:
  -r, --requirement <path>   Requirement file path (determines save location)
  -p, --product <path>       Product file path (fallback save location)
  -t, --copy-type <type>     Copy type (default: full-listing)
  -c, --content <path>       Path to content file to save
  -d, --date <YYYYMMDD>      Override date (default: today)
      --dry-run              Show target path without writing
  -h, --help                 Show this help
  `);
  process.exit(0);
}

function getDateStr(override?: string): string {
  if (override) return override;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function getTimeStr(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${h}${min}`;
}

function generateOutputPath(opts: {
  requirement?: string;
  product?: string;
  copyType: string;
  dateStr: string;
}): string {
  if (opts.requirement) {
    const dir = dirname(resolve(opts.requirement));
    const name = basename(opts.requirement, extname(opts.requirement));
    const target = join(dir, `${name}_result_${opts.dateStr}.md`);
    if (existsSync(target)) {
      return join(dir, `${name}_result_${opts.dateStr}_${getTimeStr()}.md`);
    }
    return target;
  }

  if (opts.product) {
    const dir = dirname(resolve(opts.product));
    const name = basename(opts.product, extname(opts.product));
    return join(dir, `${name}_${opts.copyType}_result_${opts.dateStr}.md`);
  }

  throw new Error(
    "Either --requirement or --product must be specified to determine save location."
  );
}

async function readContent(contentPath?: string): Promise<string> {
  if (contentPath) {
    const resolved = resolve(contentPath);
    if (!existsSync(resolved)) {
      throw new Error(`Content file not found: ${resolved}`);
    }
    return await Bun.file(resolved).text();
  }

  // Read from stdin
  const chunks: string[] = [];
  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(decoder.decode(value, { stream: true }));
  }
  chunks.push(decoder.decode());

  const result = chunks.join("");
  if (!result.trim()) {
    throw new Error("No content provided. Use --content <file> or pipe via stdin.");
  }
  return result;
}

async function main() {
  const dateStr = getDateStr(values.date);
  const copyType = values["copy-type"] ?? "full-listing";

  const outputPath = generateOutputPath({
    requirement: values.requirement,
    product: values.product,
    copyType,
    dateStr,
  });

  if (values["dry-run"]) {
    console.log(`Target path: ${outputPath}`);
    process.exit(0);
  }

  const content = await readContent(values.content);

  await Bun.write(outputPath, content);
  console.log(`Result saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
