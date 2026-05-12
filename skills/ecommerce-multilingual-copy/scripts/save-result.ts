#!/usr/bin/env bun

/**
 * Save generated copywriting results beside the source requirement/product file.
 *
 * This file lives inside the skill directory so both Claude Code plugin installs
 * and Codex skill installs can use the same deterministic save helper.
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  resolve,
} from "node:path";
import { parseArgs } from "node:util";

export interface OutputPathOptions {
  requirement?: string;
  product?: string;
  copyType: string;
  dateStr: string;
  now?: Date;
  cwd?: string;
  homeDir?: string;
  pathExists?: (path: string) => boolean;
}

export function formatDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function formatTime(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}${min}`;
}

export function expandHomePath(path: string, homeDir = homedir()): string {
  if (path === "~") return homeDir;
  if (path.startsWith("~/")) return join(homeDir, path.slice(2));
  return path;
}

export function resolveUserPath(
  path: string,
  cwd = process.cwd(),
  homeDir = homedir(),
): string {
  const expanded = expandHomePath(path, homeDir);
  return isAbsolute(expanded) ? resolve(expanded) : resolve(cwd, expanded);
}

function withCollisionSuffix(
  target: string,
  dateStr: string,
  now: Date,
  pathExists: (path: string) => boolean,
): string {
  if (!pathExists(target)) return target;

  const dir = dirname(target);
  const ext = extname(target);
  const name = basename(target, ext);
  return join(dir, `${name}_${formatTime(now)}${ext || ".md"}`);
}

export function generateOutputPath(opts: OutputPathOptions): string {
  const pathExists = opts.pathExists ?? existsSync;
  const cwd = opts.cwd ?? process.cwd();
  const homeDir = opts.homeDir ?? homedir();
  const now = opts.now ?? new Date();

  if (opts.requirement) {
    const requirementPath = resolveUserPath(opts.requirement, cwd, homeDir);
    const dir = dirname(requirementPath);
    const name = basename(requirementPath, extname(requirementPath));
    const target = join(dir, `${name}_result_${opts.dateStr}.md`);
    return withCollisionSuffix(target, opts.dateStr, now, pathExists);
  }

  if (opts.product) {
    const productPath = resolveUserPath(opts.product, cwd, homeDir);
    const dir = dirname(productPath);
    const name = basename(productPath, extname(productPath));
    const target = join(
      dir,
      `${name}_${opts.copyType}_result_${opts.dateStr}.md`,
    );
    return withCollisionSuffix(target, opts.dateStr, now, pathExists);
  }

  throw new Error(
    "Either --requirement or --product must be specified to determine save location.",
  );
}

export async function readContent(contentPath?: string): Promise<string> {
  if (contentPath) {
    const resolved = resolveUserPath(contentPath);
    if (!existsSync(resolved)) {
      throw new Error(`Content file not found: ${resolved}`);
    }
    return await Bun.file(resolved).text();
  }

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
    throw new Error(
      "No content provided. Use --content <file> or pipe via stdin.",
    );
  }
  return result;
}

export function helpText(): string {
  return `
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
  `;
}

export async function runCli(args = Bun.argv.slice(2)): Promise<number> {
  const { values } = parseArgs({
    args,
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
    console.log(helpText());
    return 0;
  }

  const dateStr =
    typeof values.date === "string" ? values.date : formatDate(new Date());
  const copyType =
    typeof values["copy-type"] === "string"
      ? values["copy-type"]
      : "full-listing";

  const outputPath = generateOutputPath({
    requirement:
      typeof values.requirement === "string" ? values.requirement : undefined,
    product: typeof values.product === "string" ? values.product : undefined,
    copyType,
    dateStr,
  });

  if (values["dry-run"]) {
    console.log(`Target path: ${outputPath}`);
    return 0;
  }

  const content = await readContent(
    typeof values.content === "string" ? values.content : undefined,
  );

  await Bun.write(outputPath, content);
  console.log(`Result saved to: ${outputPath}`);
  return 0;
}

if (import.meta.main) {
  runCli().then(
    (code) => process.exit(code),
    (err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    },
  );
}
